import { getExistingShapes } from "./http";
import toast from "react-hot-toast";
 

export type Tool =
  | "select"
  | "hand"
  | "rect"
  | "diamond"
  | "ellipse"
  | "arrow"
  | "line"
  | "pencil"
  | "text"
  | "eraser";

// Every shape carries an id so erases can be replayed from the DB
export type Shape =
  | { type: "rect";    id?: string; x: number; y: number; width: number; height: number }
  | { type: "ellipse"; id?: string; centerX: number; centerY: number; rx: number; ry: number }
  | { type: "circle";  id?: string; centerX: number; centerY: number; radius: number } // legacy
  | { type: "diamond"; id?: string; x: number; y: number; width: number; height: number }
  | { type: "arrow";   id?: string; startX: number; startY: number; endX: number; endY: number }
  | { type: "line";    id?: string; startX: number; startY: number; endX: number; endY: number }
  | { type: "pencil";  id?: string; points: { x: number; y: number }[] }
  | { type: "text";    id?: string; x: number; y: number; text: string; fontSize?: number };

const genId = () => Math.random().toString(36).slice(2, 10);

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  existingShapes: Shape[];
  private roomId: string;
  private socket: WebSocket;

  // Drawing state
  private clicked = false;
  private startX = 0;
  private startY = 0;
  private currentPencilPoints: { x: number; y: number }[] = [];

  // Eraser: accumulate erased shape ids during a drag, flush on mouseUp
  private pendingErasedIds: Set<string> = new Set();
  private pendingErasedShapes: Shape[] = [];

  // Undo history: each entry is either an added shape id or a set of erased shapes
  private history: Array<
    | { type: "add"; shapeId: string }
    | { type: "erase"; shapes: Shape[] }
  > = [];

  // Zoom / pan
  private zoom = 1;
  private panX = 0;
  private panY = 0;
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;

  selectedTool: Tool = "rect";
  canEdit: boolean = true;
  setCanEdit(val: boolean) { this.canEdit = val; }

  private onTextRequest?: (sx: number, sy: number, cx: number, cy: number) => void;
  private onZoomChange?: (zoom: number) => void;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    onTextRequest?: (sx: number, sy: number, cx: number, cy: number) => void,
    onZoomChange?: (zoom: number) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.socket = socket;
    this.roomId = roomId;
    this.onTextRequest = onTextRequest;
    this.onZoomChange = onZoomChange;
    this.init();
    this.initSocketHandler();
    this.initMouseHandlers();
    this.canvas.addEventListener("wheel", this.wheelHandler, { passive: false });
  }

  // ── Theme ──────────────────────────────────────────────────────────────────
  private get isDark() { return document.documentElement.classList.contains("dark"); }
  private get bgColor() { return this.isDark ? "#1e1e2e" : "#f8f9fa"; }
  private get strokeColor() { return this.isDark ? "rgba(255,255,255,0.88)" : "rgba(20,20,20,0.88)"; }

  // ── Coordinates ───────────────────────────────────────────────────────────
  private toCanvas(clientX: number, clientY: number) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - r.left - this.panX) / this.zoom,
      y: (clientY - r.top  - this.panY) / this.zoom,
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────
  setTool(tool: Tool) {
    this.selectedTool = tool;
    this.canvas.style.cursor =
      tool === "hand"   ? "grab"       :
      tool === "select" ? "default"    :
      tool === "eraser" ? "cell"       :
      tool === "text"   ? "text"       :
      "crosshair";
  }

  addShape(shape: Shape) {
    if (!shape.id) (shape as Shape & { id: string }).id = genId();
    this.existingShapes.push(shape);
    this.history.push({ type: "add", shapeId: shape.id! });
    this.clearCanvas();
    this.socket.send(JSON.stringify({
      type: "chat",
      roomId: this.roomId,
      message: JSON.stringify({ shape }),
    }));
  }

  undo() {
    if (this.history.length === 0) return;
    const last = this.history.pop()!;

    if (last.type === "add") {
      this.existingShapes = this.existingShapes.filter((s) => s.id !== last.shapeId);
      this.socket.send(JSON.stringify({
        type: "chat",
        roomId: this.roomId,
        message: JSON.stringify({ erase: [last.shapeId] }),
      }));
    } else if (last.type === "erase") {
      last.shapes.forEach((s) => this.existingShapes.push(s));
      last.shapes.forEach((s) => {
        this.socket.send(JSON.stringify({
          type: "chat",
          roomId: this.roomId,
          message: JSON.stringify({ shape: s }),
        }));
      });
    }

    this.clearCanvas();
  }

  getZoom() { return this.zoom; }
  zoomIn()  { this.applyZoom(this.zoom * 1.2); }
  zoomOut() { this.applyZoom(this.zoom / 1.2); }
  resetView() {
    this.zoom = 1; this.panX = 0; this.panY = 0;
    this.clearCanvas();
    this.onZoomChange?.(1);
  }

  private applyZoom(z: number) {
    this.zoom = Math.min(Math.max(0.05, z), 20);
    this.clearCanvas();
    this.onZoomChange?.(this.zoom);
  }

  destory() {
    this.canvas.removeEventListener("mousedown",  this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup",    this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove",  this.mouseMoveHandler);
    this.canvas.removeEventListener("wheel",      this.wheelHandler);
    this.socket.removeEventListener("message",    this.socketMsgHandler);
  }

  // ── Rendering ─────────────────────────────────────────────────────────────
  clearCanvas() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    ctx.setTransform(this.zoom, 0, 0, this.zoom, this.panX, this.panY);
    ctx.strokeStyle = this.strokeColor;
    ctx.fillStyle   = this.strokeColor;
    ctx.lineWidth   = 2;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    this.existingShapes.forEach((s) => this.drawShape(s));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  private drawGrid() {
    const ctx = this.ctx;
    const dotColor = this.isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
    const spacing  = 25 * this.zoom;
    const ox = ((this.panX % spacing) + spacing) % spacing;
    const oy = ((this.panY % spacing) + spacing) % spacing;
    const r  = Math.max(0.8, 0.8 * this.zoom);
    ctx.fillStyle = dotColor;
    for (let x = ox; x < this.canvas.width;  x += spacing) {
      for (let y = oy; y < this.canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawShape(shape: Shape) {
    const ctx = this.ctx;
    switch (shape.type) {
      case "rect":
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        break;
      case "ellipse":
        ctx.beginPath();
        ctx.ellipse(shape.centerX, shape.centerY, Math.abs(shape.rx), Math.abs(shape.ry), 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "circle": // legacy
        ctx.beginPath();
        ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "diamond": {
        const cx = shape.x + shape.width  / 2;
        const cy = shape.y + shape.height / 2;
        ctx.beginPath();
        ctx.moveTo(cx,              shape.y);
        ctx.lineTo(shape.x + shape.width, cy);
        ctx.lineTo(cx,              shape.y + shape.height);
        ctx.lineTo(shape.x,        cy);
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case "arrow": {
        const { startX, startY, endX, endY } = shape;
        const angle = Math.atan2(endY - startY, endX - startX);
        const hl = 14;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - hl * Math.cos(angle - Math.PI / 6), endY - hl * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - hl * Math.cos(angle + Math.PI / 6), endY - hl * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
        break;
      }
      case "line":
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX,   shape.endY);
        ctx.stroke();
        break;
      case "pencil": {
        const pts = shape.points;
        if (pts.length < 2) break;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
        break;
      }
      case "text":
        ctx.save();
        ctx.font      = `${shape.fontSize ?? 18}px Inter, ui-sans-serif, sans-serif`;
        ctx.fillStyle = this.strokeColor;
        ctx.fillText(shape.text, shape.x, shape.y);
        ctx.restore();
        break;
    }
  }

  private withZoom(fn: () => void) {
    const ctx = this.ctx;
    ctx.setTransform(this.zoom, 0, 0, this.zoom, this.panX, this.panY);
    ctx.strokeStyle = this.strokeColor;
    ctx.fillStyle   = this.strokeColor;
    ctx.lineWidth   = 2;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    fn();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  // ── Socket ────────────────────────────────────────────────────────────────
  private socketMsgHandler = (event: MessageEvent) => {
    const msg = JSON.parse(event.data);
    
    if (msg.type === "error") {
      toast.error(msg.message || "An error occurred");
      return;
    }

    if (msg.type !== "chat") return;

    let data: { shape?: Shape; erase?: string[] };
    try { data = JSON.parse(msg.message); } catch { return; }

    if (data.shape) {
      this.existingShapes.push(data.shape);
      this.clearCanvas();
    } else if (data.erase && Array.isArray(data.erase)) {
      const ids = new Set(data.erase as string[]);
      this.existingShapes = this.existingShapes.filter((s) => !(s.id && ids.has(s.id)));
      this.clearCanvas();
    }
  };

  initSocketHandler() {
    this.socket.addEventListener("message", this.socketMsgHandler);
  }

  // ── Mouse ─────────────────────────────────────────────────────────────────
  mouseDownHandler = (e: MouseEvent) => {
    if (e.button !== 0) return;

    if (this.selectedTool === "hand") {
      this.isPanning  = true;
      this.panStartX  = e.clientX - this.panX;
      this.panStartY  = e.clientY - this.panY;
      this.canvas.style.cursor = "grabbing";
      return;
    }

    if (!this.canEdit) return;

    if (this.selectedTool === "text") {
      const c = this.toCanvas(e.clientX, e.clientY);
      this.onTextRequest?.(e.clientX, e.clientY, c.x, c.y);
      return;
    }

    const c = this.toCanvas(e.clientX, e.clientY);
    this.startX  = c.x;
    this.startY  = c.y;
    this.clicked = true;

    if (this.selectedTool === "pencil") {
      this.currentPencilPoints = [{ x: c.x, y: c.y }];
    }
    if (this.selectedTool === "eraser") {
      this.pendingErasedIds = new Set();
      this.pendingErasedShapes = [];
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.isPanning) {
      this.panX = e.clientX - this.panStartX;
      this.panY = e.clientY - this.panStartY;
      this.clearCanvas();
      return;
    }
    if (!this.clicked) return;

    const c = this.toCanvas(e.clientX, e.clientY);
    const w = c.x - this.startX;
    const h = c.y - this.startY;

    // ── Eraser ──
    if (this.selectedTool === "eraser") {
      const thr = 20 / this.zoom;
      const toRemove = this.existingShapes.filter((s) => isNearShape(s, c.x, c.y, thr));
      toRemove.forEach((s) => {
        if (s.id) {
          this.pendingErasedIds.add(s.id);
          this.pendingErasedShapes.push(s);
        }
      });
      if (toRemove.length > 0) {
        this.existingShapes = this.existingShapes.filter((s) => !toRemove.includes(s));
        this.clearCanvas();
      }
      return;
    }

    // ── Pencil preview ──
    if (this.selectedTool === "pencil") {
      this.currentPencilPoints.push({ x: c.x, y: c.y });
      this.clearCanvas();
      this.withZoom(() => {
        const pts = this.currentPencilPoints;
        if (pts.length < 2) return;
        this.ctx.beginPath();
        this.ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) this.ctx.lineTo(pts[i].x, pts[i].y);
        this.ctx.stroke();
      });
      return;
    }

    // ── Shape previews ──
    this.clearCanvas();
    this.withZoom(() => {
      const ctx = this.ctx;
      switch (this.selectedTool) {
        case "rect":
          ctx.strokeRect(Math.min(this.startX, c.x), Math.min(this.startY, c.y), Math.abs(w), Math.abs(h));
          break;
        case "ellipse":
          ctx.beginPath();
          ctx.ellipse(this.startX + w / 2, this.startY + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "diamond": {
          const dx = Math.min(this.startX, c.x), dy = Math.min(this.startY, c.y);
          const dw = Math.abs(w),                dh = Math.abs(h);
          const cx = dx + dw / 2,               cy = dy + dh / 2;
          ctx.beginPath();
          ctx.moveTo(cx, dy); ctx.lineTo(dx + dw, cy);
          ctx.lineTo(cx, dy + dh); ctx.lineTo(dx, cy);
          ctx.closePath(); ctx.stroke();
          break;
        }
        case "arrow": {
          const angle = Math.atan2(c.y - this.startY, c.x - this.startX);
          const hl = 14;
          ctx.beginPath();
          ctx.moveTo(this.startX, this.startY); ctx.lineTo(c.x, c.y);
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(c.x - hl * Math.cos(angle - Math.PI / 6), c.y - hl * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(c.x - hl * Math.cos(angle + Math.PI / 6), c.y - hl * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
          break;
        }
        case "line":
          ctx.beginPath();
          ctx.moveTo(this.startX, this.startY);
          ctx.lineTo(c.x, c.y);
          ctx.stroke();
          break;
      }
    });
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = "grab";
      return;
    }
    if (!this.clicked) return;
    this.clicked = false;

    const c = this.toCanvas(e.clientX, e.clientY);
    const w = c.x - this.startX;
    const h = c.y - this.startY;

    // ── Flush eraser ──
    if (this.selectedTool === "eraser") {
      if (this.pendingErasedIds.size > 0) {
        const ids = [...this.pendingErasedIds];
        this.history.push({ type: "erase", shapes: [...this.pendingErasedShapes] });
        this.pendingErasedIds = new Set();
        this.pendingErasedShapes = [];
        this.socket.send(JSON.stringify({
          type: "chat",
          roomId: this.roomId,
          message: JSON.stringify({ erase: ids }),
        }));
      }
      this.clearCanvas();
      return;
    }

    let shape: Shape | null = null;
    const id = genId();

    switch (this.selectedTool) {
      case "rect":
        if (Math.abs(w) > 2 || Math.abs(h) > 2)
          shape = { type: "rect", id, x: Math.min(this.startX, c.x), y: Math.min(this.startY, c.y), width: Math.abs(w), height: Math.abs(h) };
        break;
      case "ellipse":
        if (Math.abs(w) > 2 || Math.abs(h) > 2)
          shape = { type: "ellipse", id, centerX: this.startX + w / 2, centerY: this.startY + h / 2, rx: Math.abs(w / 2), ry: Math.abs(h / 2) };
        break;
      case "diamond":
        if (Math.abs(w) > 2 || Math.abs(h) > 2)
          shape = { type: "diamond", id, x: Math.min(this.startX, c.x), y: Math.min(this.startY, c.y), width: Math.abs(w), height: Math.abs(h) };
        break;
      case "arrow":
        if (Math.hypot(w, h) > 5)
          shape = { type: "arrow", id, startX: this.startX, startY: this.startY, endX: c.x, endY: c.y };
        break;
      case "line":
        if (Math.hypot(w, h) > 5)
          shape = { type: "line", id, startX: this.startX, startY: this.startY, endX: c.x, endY: c.y };
        break;
      case "pencil":
        if (this.currentPencilPoints.length > 1)
          shape = { type: "pencil", id, points: [...this.currentPencilPoints] };
        this.currentPencilPoints = [];
        break;
    }

    if (shape) this.addShape(shape);
    else this.clearCanvas();
  };

  wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const factor  = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(Math.max(0.05, this.zoom * factor), 20);
      const r  = this.canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      this.panX = mx - (mx - this.panX) * (newZoom / this.zoom);
      this.panY = my - (my - this.panY) * (newZoom / this.zoom);
      this.zoom = newZoom;
      this.clearCanvas();
      this.onZoomChange?.(this.zoom);
    } else {
      this.panX -= e.deltaX;
      this.panY -= e.deltaY;
      this.clearCanvas();
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup",   this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}

// ── Eraser helpers ─────────────────────────────────────────────────────────
function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function isNearShape(shape: Shape, x: number, y: number, thr: number): boolean {
  switch (shape.type) {
    case "rect":
      return x >= shape.x - thr && x <= shape.x + shape.width  + thr &&
             y >= shape.y - thr && y <= shape.y + shape.height + thr;
    case "ellipse": {
      const dx = (x - shape.centerX) / (shape.rx + thr);
      const dy = (y - shape.centerY) / (shape.ry + thr);
      return dx * dx + dy * dy <= 1;
    }
    case "circle":
      return Math.hypot(x - shape.centerX, y - shape.centerY) <= shape.radius + thr;
    case "diamond":
      return x >= shape.x - thr && x <= shape.x + shape.width  + thr &&
             y >= shape.y - thr && y <= shape.y + shape.height + thr;
    case "arrow":
    case "line":
      return segDist(x, y, shape.startX, shape.startY, shape.endX, shape.endY) <= thr;
    case "pencil":
      return shape.points.some((p) => Math.hypot(p.x - x, p.y - y) <= thr * 2);
    case "text":
      return x >= shape.x - thr && x <= shape.x + 200 &&
             y >= shape.y - 20 - thr && y <= shape.y + thr;
    default:
      return false;
  }
}