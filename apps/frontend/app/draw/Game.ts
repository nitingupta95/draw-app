export type Tool = "selection" | "cursor" | "pencil" | "rect" | "circle" | "diamond" | "arrow" | "line" | "text" | "image" | "eraser";
import { getExistingShapes } from "./http";

export type Theme = "light" | "dark";
export type BaseShape = { id: string };

export type Shape =
  | (BaseShape & {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    })
  | (BaseShape & {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      color: string;
    })
  | (BaseShape & {
      type: "pencil";
      points: { x: number; y: number }[];
      color: string;
    })
  | (BaseShape & {
      type: "diamond";
      centerX: number;
      centerY: number;
      width: number;
      height: number;
      color: string;
    })
  | (BaseShape & {
      type: "arrow";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      color: string;
    })
  | (BaseShape & {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      color: string;
    })
  | (BaseShape & {
      type: "text";
      x: number;
      y: number;
      content: string;
      color: string;
      fontSize: number;
      fontFamily?: string;
      textAlign?: "left" | "center" | "right";
      opacity?: number;
    })
  | (BaseShape & {
      type: "image";
      x: number;
      y: number;
      width: number;
      height: number;
      src: string;
    });

export type HistoryAction = 
  | { type: "add"; shapeId: string; shape: Shape }
  | { type: "erase"; shapes: Shape[] }
  | { type: "modify"; before: Shape[]; after: Shape[] }
  | { type: "reorder"; before: string[]; after: string[] };

type ViewState = { scale: number; panX: number; panY: number };
type Handle = "nw" | "ne" | "se" | "sw";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;
const HANDLE_SIZE = 8;

const BG_COLORS: Record<Theme, string> = {
  dark: "#121212",
  light: "#ffffff",
};

const DEFAULT_STROKE: Record<Theme, string> = {
  dark: "#e9ecef",
  light: "#1e1e1e",
};

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private isDrawing: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "pencil";
  private pencilPoints: { x: number; y: number }[] = [];
  private textInput?: HTMLTextAreaElement;
  private imageCache = new Map<string, HTMLImageElement>();
  private canEdit: boolean = true;

  private theme: Theme = "light";
  private selectedColor: string = DEFAULT_STROKE.light;
  private fontSize: number = 20;

  private view: ViewState = { scale: 1, panX: 0, panY: 0 };
  private onViewChange?: (view: ViewState) => void;

  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;

  // History / Undo / Redo
  private undoStack: HistoryAction[] = [];
  private redoStack: HistoryAction[] = [];

  // Multi‑selection
  public selectedShapes: Shape[] = [];
  private dragStartShapes: Shape[] = [];
  private isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  // Resize
  private isResizing = false;
  private resizeStartShapes: Shape[] = [];
  private resizeHandle: Handle | null = null;
  private resizeStartBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;
  private resizeStartMouse: { x: number; y: number } | null = null;

  // Marquee
  private isMarqueeDragging = false;
  private marqueeStartX = 0;
  private marqueeStartY = 0;
  private selectionBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;

  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.isDrawing = false;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
    this.initWheelHandler();
    this.initDoubleClickHandler();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("wheel", this.wheelHandler);
    this.canvas.removeEventListener("dblclick", this.doubleClickHandler);
    this.socket.removeEventListener("message", this.socketMessageHandler);
    this.textInput?.remove();
  }

  setCanEdit(canEdit: boolean) {
    this.canEdit = canEdit;
  }

  historyPush(action: HistoryAction) {
    this.undoStack.push(action);
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const action = this.undoStack.pop()!;
    this.redoStack.push(action);

    switch (action.type) {
      case "add":
        this.existingShapes = this.existingShapes.filter(s => s.id !== action.shapeId);
        this.sendErase(action.shapeId);
        break;
      case "erase":
        action.shapes.forEach(s => {
          this.existingShapes.push(s);
          this.sendShape(s);
        });
        break;
      case "modify":
        action.before.forEach(beforeShape => {
          const idx = this.existingShapes.findIndex(s => s.id === beforeShape.id);
          if (idx !== -1) {
            this.existingShapes[idx] = beforeShape;
          } else {
            this.existingShapes.push(beforeShape);
          }
          this.sendShape(beforeShape);
        });
        break;
      case "reorder":
        const shapeMap = new Map(this.existingShapes.map(s => [s.id, s]));
        const newShapes: Shape[] = [];
        for (const id of action.before) {
          if (shapeMap.has(id)) {
            newShapes.push(shapeMap.get(id)!);
            shapeMap.delete(id);
          }
        }
        for (const s of shapeMap.values()) {
          newShapes.push(s);
        }
        this.existingShapes = newShapes;
        this.sendReorder(action.before);
        break;
    }
    this.selectedShapes = [];
    this.clearCanvas();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const action = this.redoStack.pop()!;
    this.undoStack.push(action);

    switch (action.type) {
      case "add":
        this.existingShapes.push(action.shape);
        this.sendShape(action.shape);
        break;
      case "erase":
        const idsToErase = new Set(action.shapes.map(s => s.id));
        this.existingShapes = this.existingShapes.filter(s => !idsToErase.has(s.id));
        action.shapes.forEach(s => this.sendErase(s.id));
        break;
      case "modify":
        action.after.forEach(afterShape => {
          const idx = this.existingShapes.findIndex(s => s.id === afterShape.id);
          if (idx !== -1) {
            this.existingShapes[idx] = afterShape;
          } else {
            this.existingShapes.push(afterShape);
          }
          this.sendShape(afterShape);
        });
        break;
      case "reorder":
        const shapeMap = new Map(this.existingShapes.map(s => [s.id, s]));
        const newShapes: Shape[] = [];
        for (const id of action.after) {
          if (shapeMap.has(id)) {
            newShapes.push(shapeMap.get(id)!);
            shapeMap.delete(id);
          }
        }
        for (const s of shapeMap.values()) {
          newShapes.push(s);
        }
        this.existingShapes = newShapes;
        this.sendReorder(action.after);
        break;
    }
    this.selectedShapes = [];
    this.clearCanvas();
  }

  setTool(tool: Tool) {
    if (this.textInput) this.commitTextInput();
    this.selectedTool = tool;
    this.selectedShapes = [];
    this.clearCanvas();
  }

  setColor(color: string) {
    this.selectedColor = color;
  }

  setFontSize(size: number) {
    this.fontSize = size;
  }

  setTheme(theme: Theme) {
    this.theme = theme;
    if (
      this.selectedColor === DEFAULT_STROKE[theme === "dark" ? "light" : "dark"]
    ) {
      this.selectedColor = DEFAULT_STROKE[theme];
    }
    this.clearCanvas();
  }

  setOnViewChange(cb: (view: ViewState) => void) {
    this.onViewChange = cb;
    cb({ ...this.view });
  }

  private applyView(
    next: Partial<ViewState>,
    focal?: { x: number; y: number },
  ) {
    const prevScale = this.view.scale;
    const nextScale = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, next.scale ?? prevScale),
    );

    let { panX, panY } = this.view;

    if (next.scale !== undefined && focal) {
      const rect = this.canvas.getBoundingClientRect();
      const fx = focal.x - rect.left;
      const fy = focal.y - rect.top;
      panX = fx - ((fx - panX) / prevScale) * nextScale;
      panY = fy - ((fy - panY) / prevScale) * nextScale;
    } else if (next.scale !== undefined) {
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;
      panX = cx - ((cx - panX) / prevScale) * nextScale;
      panY = cy - ((cy - panY) / prevScale) * nextScale;
    }

    if (next.panX !== undefined) panX = next.panX;
    if (next.panY !== undefined) panY = next.panY;

    this.view = { scale: nextScale, panX, panY };
    this.onViewChange?.({ ...this.view });
    this.clearCanvas();
  }

  zoomIn() {
    this.applyView({
      scale: Math.round((this.view.scale + ZOOM_STEP) * 100) / 100,
    });
  }

  zoomOut() {
    this.applyView({
      scale: Math.round((this.view.scale - ZOOM_STEP) * 100) / 100,
    });
  }

  resetZoom() {
    this.applyView({ scale: 1, panX: 0, panY: 0 });
  }

  public zoomToSelection() {
    if (this.selectedShapes.length === 0) return;
    let bounds = this.getShapeBounds(this.selectedShapes[0]);
    for (let i = 1; i < this.selectedShapes.length; i++) {
      const b = this.getShapeBounds(this.selectedShapes[i]);
      const minX = Math.min(bounds.x, b.x);
      const minY = Math.min(bounds.y, b.y);
      const maxX = Math.max(bounds.x + bounds.width, b.x + b.width);
      const maxY = Math.max(bounds.y + bounds.height, b.y + b.height);
      bounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    const padding = 50;
    const targetWidth = bounds.width + padding * 2;
    const targetHeight = bounds.height + padding * 2;
    const scaleX = this.canvas.width / targetWidth;
    const scaleY = this.canvas.height / targetHeight;
    const newScale = Math.min(scaleX, scaleY, MAX_ZOOM);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const panX = this.canvas.width / 2 - centerX * newScale;
    const panY = this.canvas.height / 2 - centerY * newScale;
    this.applyView({ scale: newScale, panX, panY });
  }

  private wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = -e.deltaY * 0.001;
      this.applyView(
        { scale: this.view.scale + delta },
        { x: e.clientX, y: e.clientY },
      );
    } else {
      this.applyView({
        panX: this.view.panX - e.deltaX,
        panY: this.view.panY - e.deltaY,
      });
    }
  };

  private initWheelHandler() {
    this.canvas.addEventListener("wheel", this.wheelHandler, {
      passive: false,
    });
  }

  private toWorld(screenX: number, screenY: number) {
    return {
      x: (screenX - this.view.panX) / this.view.scale,
      y: (screenY - this.view.panY) / this.view.scale,
    };
  }

  async init() {
    try {
      const loaded = (await getExistingShapes(this.roomId)) as Shape[];
      loaded.forEach((s) => {
        if (!s.id) s.id = genId();
        if (s.type !== "image" && !s.color) {
          s.color = DEFAULT_STROKE[this.theme];
        }
        if (s.type === "text") {
          if (!s.fontSize) (s as any).fontSize = 20;
          if (!s.fontFamily) (s as any).fontFamily = "sans-serif";
          if (!s.textAlign) (s as any).textAlign = "left";
          if (s.opacity === undefined) (s as any).opacity = 100;
        }
      });
      this.existingShapes = loaded;
      this.clearCanvas();
    } catch (err) {
      console.error("Failed to load existing shapes:", err);
    }
  }

  private socketMessageHandler = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);

      if (message.type !== "chat" || message.roomId !== this.roomId) return;

      const payload = JSON.parse(message.message);

      if (payload.shape) {
        const shape: Shape = payload.shape;
        if (!shape.id) shape.id = genId();
        const existingIndex = this.existingShapes.findIndex(
          (s) => s.id === shape.id,
        );
        if (existingIndex !== -1) {
          this.existingShapes[existingIndex] = shape;
          const selIndex = this.selectedShapes.findIndex(
            (s) => s.id === shape.id,
          );
          if (selIndex !== -1) this.selectedShapes[selIndex] = shape;
        } else {
          this.existingShapes.push(shape);
        }
        this.clearCanvas();
      } else if (payload.updateId && payload.updates) {
        const existingIndex = this.existingShapes.findIndex((s) => s.id === payload.updateId);
        if (existingIndex !== -1) {
          Object.assign(this.existingShapes[existingIndex], payload.updates);
          const selIndex = this.selectedShapes.findIndex((s) => s.id === payload.updateId);
          if (selIndex !== -1) {
            Object.assign(this.selectedShapes[selIndex], payload.updates);
          }
          this.clearCanvas();
        }
      } else if (payload.reorder) {
        const order = payload.reorder as string[];
        const shapeMap = new Map(this.existingShapes.map((s) => [s.id, s]));
        const newOrder = order
          .map((id) => shapeMap.get(id))
          .filter((s) => s !== undefined) as Shape[];
        if (newOrder.length === this.existingShapes.length) {
          this.existingShapes = newOrder;
          this.clearCanvas();
        }
      } else if (payload.eraseId) {
        this.existingShapes = this.existingShapes.filter(
          (s) => s.id !== payload.eraseId,
        );
        this.selectedShapes = this.selectedShapes.filter(
          (s) => s.id !== payload.eraseId,
        );
        this.clearCanvas();
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  initHandlers() {
    this.socket.addEventListener("message", this.socketMessageHandler);
  }

  redraw() {
    this.clearCanvas();
  }

  private getShapeBounds(shape: Shape): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    switch (shape.type) {
      case "rect":
        return {
          x: Math.min(shape.x, shape.x + shape.width),
          y: Math.min(shape.y, shape.y + shape.height),
          width: Math.abs(shape.width),
          height: Math.abs(shape.height),
        };
      case "circle":
        return {
          x: shape.centerX - Math.abs(shape.radius),
          y: shape.centerY - Math.abs(shape.radius),
          width: Math.abs(shape.radius) * 2,
          height: Math.abs(shape.radius) * 2,
        };
      case "diamond": {
        const w = shape.width / 2;
        const h = shape.height / 2;
        return {
          x: shape.centerX - w,
          y: shape.centerY - h,
          width: shape.width,
          height: shape.height,
        };
      }
      case "pencil": {
        let minX = Infinity,
          maxX = -Infinity,
          minY = Infinity,
          maxY = -Infinity;
        shape.points.forEach((p) => {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        });
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
      }
      case "arrow":
      case "line": {
        const minX = Math.min(shape.startX, shape.endX);
        const maxX = Math.max(shape.startX, shape.endX);
        const minY = Math.min(shape.startY, shape.endY);
        const maxY = Math.max(shape.startY, shape.endY);
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
      }
      case "text": {
        const fontSize = shape.fontSize || 20;
        const fontFamily = shape.fontFamily || "sans-serif";
        this.ctx.font = `${fontSize}px ${fontFamily}`;
        const lines = shape.content.split("\n");
        const maxWidth = Math.max(
          ...lines.map((l) => this.ctx.measureText(l).width),
        );
        const totalHeight = lines.length * fontSize * 1.2;
        return { x: shape.x, y: shape.y, width: maxWidth, height: totalHeight };
      }
      case "image":
        return {
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
        };
      default:
        return { x: 0, y: 0, width: 0, height: 0 };
    }
  }

  /**
   * Combined bounding box for a set of shapes (used for group drag / group
   * highlight). Returns null if the array is empty.
   */
  private getCombinedBounds(shapes: Shape[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null {
    if (shapes.length === 0) return null;
    let bounds = this.getShapeBounds(shapes[0]);
    for (let i = 1; i < shapes.length; i++) {
      const b = this.getShapeBounds(shapes[i]);
      const minX = Math.min(bounds.x, b.x);
      const minY = Math.min(bounds.y, b.y);
      const maxX = Math.max(bounds.x + bounds.width, b.x + b.width);
      const maxY = Math.max(bounds.y + bounds.height, b.y + b.height);
      bounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    return bounds;
  }

  clearCanvas() {
    this.ctx.fillStyle = BG_COLORS[this.theme];
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.view.panX, this.view.panY);
    this.ctx.scale(this.view.scale, this.view.scale);

    this.existingShapes.forEach((shape) => {
      if (shape.type === "text") {
        this.ctx.globalAlpha = (shape.opacity ?? 100) / 100;
      } else {
        this.ctx.globalAlpha = 1;
      }

      if (shape.type !== "image") {
        this.ctx.strokeStyle = shape.color ?? DEFAULT_STROKE[this.theme];
        this.ctx.fillStyle = shape.color ?? DEFAULT_STROKE[this.theme];
      }
      this.ctx.lineWidth = 2 / this.view.scale;

      switch (shape.type) {
        case "rect":
          this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          break;
        case "circle":
          this.ctx.beginPath();
          this.ctx.arc(
            shape.centerX,
            shape.centerY,
            Math.abs(shape.radius),
            0,
            Math.PI * 2,
          );
          this.ctx.stroke();
          this.ctx.closePath();
          break;
        case "pencil":
          this.ctx.beginPath();
          shape.points.forEach((point, index) => {
            if (index === 0) this.ctx.moveTo(point.x, point.y);
            else this.ctx.lineTo(point.x, point.y);
          });
          this.ctx.stroke();
          this.ctx.closePath();
          break;
        case "diamond":
          this.ctx.beginPath();
          this.ctx.moveTo(shape.centerX, shape.centerY - shape.height / 2);
          this.ctx.lineTo(shape.centerX + shape.width / 2, shape.centerY);
          this.ctx.lineTo(shape.centerX, shape.centerY + shape.height / 2);
          this.ctx.lineTo(shape.centerX - shape.width / 2, shape.centerY);
          this.ctx.closePath();
          this.ctx.stroke();
          break;
        case "arrow":
          this.drawArrow(
            shape.startX,
            shape.startY,
            shape.endX,
            shape.endY,
            shape.color,
          );
          break;
        case "line":
          this.ctx.beginPath();
          this.ctx.moveTo(shape.startX, shape.startY);
          this.ctx.lineTo(shape.endX, shape.endY);
          this.ctx.stroke();
          this.ctx.closePath();
          break;
        case "text": {
          const fontSize = shape.fontSize || 20;
          const fontFamily = shape.fontFamily || "sans-serif";
          const textAlign = shape.textAlign || "left";
          this.ctx.font = `${fontSize}px ${fontFamily}`;
          this.ctx.textAlign = textAlign;
          const lines = shape.content.split("\n");
          lines.forEach((line, i) => {
            let drawX = shape.x;
            if (textAlign === "center") {
              const width = this.ctx.measureText(line).width;
              drawX = shape.x + width / 2;
            } else if (textAlign === "right") {
              const width = this.ctx.measureText(line).width;
              drawX = shape.x + width;
            }
            this.ctx.fillText(line, drawX, shape.y + i * fontSize * 1.2);
          });
          break;
        }
        case "image": {
          const img = this.getOrLoadImage(shape.src);
          if (img.complete) {
            this.ctx.drawImage(
              img,
              shape.x,
              shape.y,
              shape.width,
              shape.height,
            );
          } else {
            img.onload = () => this.clearCanvas();
          }
          break;
        }
        default:
          break;
      }
    });

    // Selection highlights
    if (this.selectedShapes.length > 0) {
      if (this.selectedShapes.length === 1) {
        const bounds = this.getShapeBounds(this.selectedShapes[0]);
        this.ctx.strokeStyle = "#4A90D9";
        this.ctx.lineWidth = 2 / this.view.scale;
        this.ctx.setLineDash([6 / this.view.scale, 4 / this.view.scale]);
        this.ctx.globalAlpha = 1;
        this.ctx.strokeRect(
          bounds.x - 4 / this.view.scale,
          bounds.y - 4 / this.view.scale,
          bounds.width + 8 / this.view.scale,
          bounds.height + 8 / this.view.scale,
        );
        this.ctx.setLineDash([]);

        // Handles
        const handlePositions = this.getHandlePositions(bounds);
        const handleRadius = HANDLE_SIZE / this.view.scale;
        this.ctx.fillStyle = "#4A90D9";
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 1 / this.view.scale;
        for (const pos of Object.values(handlePositions)) {
          this.ctx.beginPath();
          this.ctx.arc(pos.x, pos.y, handleRadius, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.stroke();
          this.ctx.closePath();
        }
      } else {
        // Multiple selected: bounding box around the whole group
        const bounds = this.getCombinedBounds(this.selectedShapes)!;
        this.ctx.strokeStyle = "#4A90D9";
        this.ctx.lineWidth = 2 / this.view.scale;
        this.ctx.setLineDash([6 / this.view.scale, 4 / this.view.scale]);
        this.ctx.globalAlpha = 1;
        this.ctx.strokeRect(
          bounds.x - 4 / this.view.scale,
          bounds.y - 4 / this.view.scale,
          bounds.width + 8 / this.view.scale,
          bounds.height + 8 / this.view.scale,
        );
        this.ctx.setLineDash([]);
      }
    }

    // Marquee selection box
    if (this.selectionBox) {
      const { x, y, width, height } = this.selectionBox;
      this.ctx.strokeStyle = "#4A90D9";
      this.ctx.lineWidth = 2 / this.view.scale;
      this.ctx.setLineDash([4 / this.view.scale, 4 / this.view.scale]);
      this.ctx.globalAlpha = 1;
      this.ctx.strokeRect(x, y, width, height);
      this.ctx.setLineDash([]);
    }

    this.ctx.restore();
    this.ctx.globalAlpha = 1;
  }

  private drawArrow(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color?: string,
  ) {
    const headLen = 12;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    if (color) this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(
      x2 - headLen * Math.cos(angle - Math.PI / 6),
      y2 - headLen * Math.sin(angle - Math.PI / 6),
    );
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(
      x2 - headLen * Math.cos(angle + Math.PI / 6),
      y2 - headLen * Math.sin(angle + Math.PI / 6),
    );
    this.ctx.stroke();
  }

  private getOrLoadImage(src: string): HTMLImageElement {
    let img = this.imageCache.get(src);
    if (!img) {
      img = new window.Image();
      img.src = src;
      this.imageCache.set(src, img);
    }
    return img;
  }

  private sendShape(shape: Shape) {
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      }),
    );
  }

  private sendUpdate(id: string, updates: Partial<Shape>) {
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ updateShape: { id, ...updates } }),
        roomId: this.roomId,
      }),
    );
  }

  private sendErase(id: string) {
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ eraseId: id }),
        roomId: this.roomId,
      }),
    );
  }

  private sendReorder(order: string[]) {
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ reorder: order }),
        roomId: this.roomId,
      }),
    );
  }

  public updateTextProperty(id: string, key: string, value: any) {
    const shape = this.existingShapes.find((s) => s.id === id);
    if (shape && shape.type === "text") {
      (shape as any)[key] = value;
      this.sendUpdate(id, { [key]: value });
      this.clearCanvas();
    }
  }

  public moveLayer(id: string, direction: 1 | -1) {
    if (this.selectedShapes.length !== 1) return;
    const index = this.existingShapes.findIndex((s) => s.id === id);
    if (index === -1) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.existingShapes.length) return;
    [this.existingShapes[index], this.existingShapes[newIndex]] = [
      this.existingShapes[newIndex],
      this.existingShapes[index],
    ];
    this.clearCanvas();
    this.sendReorder(this.existingShapes.map((s) => s.id));
  }

  private getHandlePositions(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): Record<Handle, { x: number; y: number }> {
    const { x, y, width, height } = bounds;
    return {
      nw: { x, y },
      ne: { x: x + width, y },
      se: { x: x + width, y: y + height },
      sw: { x, y: y + height },
    };
  }

  private hitTestHandle(
    mouseX: number,
    mouseY: number,
    bounds: { x: number; y: number; width: number; height: number },
  ): Handle | null {
    const handles = this.getHandlePositions(bounds);
    const tolerance = HANDLE_SIZE / this.view.scale + 4 / this.view.scale;
    for (const [key, pos] of Object.entries(handles)) {
      const dx = mouseX - pos.x;
      const dy = mouseY - pos.y;
      if (dx * dx + dy * dy < tolerance * tolerance) {
        return key as Handle;
      }
    }
    return null;
  }

  private updateShapeFromBounds(
    shape: Shape,
    newBounds: { x: number; y: number; width: number; height: number },
  ) {
    const { x, y, width, height } = newBounds;
    switch (shape.type) {
      case "rect":
        shape.x = x;
        shape.y = y;
        shape.width = width;
        shape.height = height;
        break;
      case "circle":
        shape.centerX = x + width / 2;
        shape.centerY = y + height / 2;
        shape.radius = Math.min(width, height) / 2;
        break;
      case "diamond":
        shape.centerX = x + width / 2;
        shape.centerY = y + height / 2;
        shape.width = width;
        shape.height = height;
        break;
      case "text": {
        const oldBounds = this.getShapeBounds(shape);
        const scaleX = width / oldBounds.width;
        const scaleY = height / oldBounds.height;
        const scale = Math.min(scaleX, scaleY);
        shape.fontSize = Math.max(
          4,
          Math.round((shape.fontSize || 20) * scale),
        );
        shape.x = x;
        shape.y = y;
        break;
      }
      case "image":
        shape.x = x;
        shape.y = y;
        shape.width = width;
        shape.height = height;
        break;
      case "pencil": {
        const oldBounds = this.getShapeBounds(shape);
        const scaleX = width / oldBounds.width;
        const scaleY = height / oldBounds.height;
        shape.points = shape.points.map((p) => ({
          x: x + (p.x - oldBounds.x) * scaleX,
          y: y + (p.y - oldBounds.y) * scaleY,
        }));
        break;
      }
      case "arrow":
      case "line": {
        const oldBounds = this.getShapeBounds(shape);
        const scaleX = width / oldBounds.width;
        const scaleY = height / oldBounds.height;
        shape.startX = x + (shape.startX - oldBounds.x) * scaleX;
        shape.startY = y + (shape.startY - oldBounds.y) * scaleY;
        shape.endX = x + (shape.endX - oldBounds.x) * scaleX;
        shape.endY = y + (shape.endY - oldBounds.y) * scaleY;
        break;
      }
      default:
        break;
    }
  }

  private hitTest(
    shape: Shape,
    x: number,
    y: number,
    tolerance = 8 / this.view.scale,
  ): boolean {
    switch (shape.type) {
      case "rect": {
        const { x: sx, y: sy, width, height } = shape;
        const x0 = Math.min(sx, sx + width),
          x1 = Math.max(sx, sx + width);
        const y0 = Math.min(sy, sy + height),
          y1 = Math.max(sy, sy + height);
        return (
          x >= x0 - tolerance &&
          x <= x1 + tolerance &&
          y >= y0 - tolerance &&
          y <= y1 + tolerance &&
          (Math.abs(x - x0) < tolerance ||
            Math.abs(x - x1) < tolerance ||
            Math.abs(y - y0) < tolerance ||
            Math.abs(y - y1) < tolerance)
        );
      }
      case "circle": {
        const dist = Math.hypot(x - shape.centerX, y - shape.centerY);
        return Math.abs(dist - Math.abs(shape.radius)) < tolerance;
      }
      case "pencil":
        return shape.points.some(
          (p) => Math.hypot(x - p.x, y - p.y) < tolerance,
        );
      case "diamond": {
        const dist =
          Math.abs((x - shape.centerX) / (shape.width / 2)) +
          Math.abs((y - shape.centerY) / (shape.height / 2));
        return Math.abs(dist - 1) < 0.15;
      }
      case "arrow":
      case "line":
        return (
          this.pointToSegmentDist(
            x,
            y,
            shape.startX,
            shape.startY,
            shape.endX,
            shape.endY,
          ) < tolerance
        );
      case "text": {
        const fontSize = shape.fontSize || 20;
        const fontFamily = shape.fontFamily || "sans-serif";
        this.ctx.font = `${fontSize}px ${fontFamily}`;
        const lines = shape.content.split("\n");
        const maxWidth = Math.max(
          ...lines.map((l) => this.ctx.measureText(l).width),
        );
        const totalHeight = lines.length * fontSize * 1.2;
        const textTolerance = tolerance * 2;
        return (
          x >= shape.x - textTolerance &&
          x <= shape.x + maxWidth + textTolerance &&
          y >= shape.y - textTolerance &&
          y <= shape.y + totalHeight + textTolerance
        );
      }
      case "image":
        return (
          x >= shape.x &&
          x <= shape.x + shape.width &&
          y >= shape.y &&
          y <= shape.y + shape.height
        );
      default:
        return false;
    }
  }

  private pointToSegmentDist(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    const dx = x2 - x1,
      dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx,
      projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY);
  }

  private eraseAt(x: number, y: number) {
    const hit = [...this.existingShapes]
      .reverse()
      .find((s) => this.hitTest(s, x, y));
    if (hit) {
      this.existingShapes = this.existingShapes.filter((s) => s.id !== hit.id);
      this.selectedShapes = this.selectedShapes.filter((s) => s.id !== hit.id);
      this.historyPush({ type: "erase", shapes: [hit] });
      this.sendErase(hit.id);
      this.clearCanvas();
    }
  }

  private startTextInput(
    clientX: number,
    clientY: number,
    worldX: number,
    worldY: number,
    existingText?: string,
    existingId?: string,
  ) {
    if (this.textInput) this.commitTextInput();

    const textarea = document.createElement("textarea");
    textarea.style.position = "fixed";
    textarea.style.left = `${clientX}px`;
    textarea.style.top = `${clientY - 16}px`;
    textarea.style.background = "transparent";
    textarea.style.color = this.selectedColor;
    textarea.style.border = "1px dashed #888";
    textarea.style.font = `${this.fontSize}px sans-serif`;
    textarea.style.zIndex = "10000";
    textarea.style.outline = "none";
    textarea.style.minWidth = "100px";
    textarea.style.minHeight = `${this.fontSize}px`;
    textarea.style.resize = "none";
    textarea.style.padding = "2px";
    textarea.style.overflow = "hidden";

    if (existingText) {
      textarea.value = existingText;
    }

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const commit = () => {
      if (!this.textInput) return;
      this.commitTextInput();
    };

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commit();
      }
      if (e.key === "Escape") {
        textarea.remove();
        this.textInput = undefined;
      }
    });

    textarea.addEventListener("blur", () => {
      setTimeout(commit, 100);
    });

    this.textInput = textarea;
    (this.textInput as any)._x = worldX;
    (this.textInput as any)._y = worldY;
    (this.textInput as any)._color = this.selectedColor;
    (this.textInput as any)._id = existingId || null;
    (this.textInput as any)._fontSize = this.fontSize;
  }

  private commitTextInput() {
    const input = this.textInput;
    if (!input) return;
    this.textInput = undefined;

    const content = input.value;
    const x = (input as any)._x;
    const y = (input as any)._y;
    const color = (input as any)._color ?? this.selectedColor;
    const existingId = (input as any)._id;
    const fontSize = (input as any)._fontSize || this.fontSize;
    input.remove();

    if (!content.trim()) return;

    if (existingId) {
      const updates = { content, x, y, color, fontSize };
      this.sendUpdate(existingId, updates);
      const index = this.existingShapes.findIndex((s) => s.id === existingId);
      if (index !== -1) {
        const beforeShape = JSON.parse(JSON.stringify(this.existingShapes[index]));
        const shape = this.existingShapes[index] as any;
        shape.content = content;
        shape.x = x;
        shape.y = y;
        shape.color = color;
        shape.fontSize = fontSize;
        const selIndex = this.selectedShapes.findIndex(
          (s) => s.id === existingId,
        );
        if (selIndex !== -1) this.selectedShapes[selIndex] = shape;
        const afterShape = JSON.parse(JSON.stringify(shape));
        this.historyPush({ type: "modify", before: [beforeShape], after: [afterShape] });
        this.clearCanvas();
      }
    } else {
      const shape: Shape = {
        id: genId(),
        type: "text",
        x,
        y,
        content,
        color,
        fontSize,
        fontFamily: "sans-serif",
        textAlign: "left",
        opacity: 100,
      };
      this.existingShapes.push(shape);
      this.historyPush({ type: "add", shapeId: shape.id, shape });
      this.clearCanvas();
      this.sendShape(shape);
    }
  }

  private doubleClickHandler = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const { x, y } = this.toWorld(screenX, screenY);

    if (this.selectedShapes.length !== 1) return;
    const hit = this.selectedShapes[0];
    if (hit.type !== "text") return;
    if (!this.hitTest(hit, x, y, 10 / this.view.scale)) return;

    e.preventDefault();
    e.stopPropagation();
    this.startTextInput(
      e.clientX,
      e.clientY,
      hit.x,
      hit.y,
      hit.content,
      hit.id,
    );
  };

  private initDoubleClickHandler() {
    this.canvas.addEventListener("dblclick", this.doubleClickHandler);
  }

  private startImagePlacement(x: number, y: number) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 300;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const width = img.width * scale;
          const height = img.height * scale;

          const shape: Shape = {
            id: genId(),
            type: "image",
            x,
            y,
            width,
            height,
            src,
          };
          this.imageCache.set(src, img);
          this.existingShapes.push(shape);
          this.historyPush({ type: "add", shapeId: shape.id, shape });
          this.clearCanvas();
          this.sendShape(shape);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  }

  // --- Mouse handlers ---
  mouseDownHandler = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (this.selectedTool === "cursor") {
      this.isPanning = true;
      this.panStartX = e.clientX - this.view.panX;
      this.panStartY = e.clientY - this.view.panY;
      return;
    }

    if (!this.canEdit && this.selectedTool !== "selection") return;

    if (this.selectedTool === "selection") {
      const { x, y } = this.toWorld(screenX, screenY);

      // Check for resize handle (only when exactly one shape selected)
      if (this.canEdit && this.selectedShapes.length === 1) {
        const bounds = this.getShapeBounds(this.selectedShapes[0]);
        const handle = this.hitTestHandle(x, y, bounds);
        if (handle) {
          this.isResizing = true;
          this.resizeStartShapes = JSON.parse(JSON.stringify(this.selectedShapes));
          this.resizeHandle = handle;
          this.resizeStartBounds = { ...bounds };
          this.resizeStartMouse = { x, y };
          return;
        }
      }

      // If a group (big shape + its sub-shapes) is already selected from a
      // previous marquee drag, let the user click-drag anywhere inside that
      // group's bounding box to move everything together — like Excalidraw.
      // Without this, clicking down to start the drag would otherwise hit the
      // "click on a shape" logic below and collapse the selection down to a
      // single shape before the drag even starts.
      if (this.selectedShapes.length > 1) {
        const groupBounds = this.getCombinedBounds(this.selectedShapes);
        const pad = 4 / this.view.scale;
        if (
          groupBounds &&
          x >= groupBounds.x - pad &&
          x <= groupBounds.x + groupBounds.width + pad &&
          y >= groupBounds.y - pad &&
          y <= groupBounds.y + groupBounds.height + pad
        ) {
          if (this.canEdit) {
            this.isDragging = true;
            this.dragStartShapes = JSON.parse(JSON.stringify(this.selectedShapes));
            const first = this.selectedShapes[0];
            let anchorX: number, anchorY: number;
            switch (first.type) {
              case "rect":
              case "text":
              case "image":
                anchorX = first.x;
                anchorY = first.y;
                break;
              case "circle":
              case "diamond":
                anchorX = first.centerX;
                anchorY = first.centerY;
                break;
              case "pencil":
                anchorX = first.points[0]?.x ?? x;
                anchorY = first.points[0]?.y ?? y;
                break;
              case "arrow":
              case "line":
                anchorX = first.startX;
                anchorY = first.startY;
                break;
              default:
                anchorX = x;
                anchorY = y;
            }
            this.dragOffsetX = x - anchorX;
            this.dragOffsetY = y - anchorY;
          }
          this.clearCanvas();
          return;
        }
      }

      // Check if clicking on a shape. Search topmost-drawn shape first so
      // that a small sub-figure overlapping a bigger container gets picked
      // instead of the container underneath it. Uses hitTest (boundary/edge
      // based) so only clicking near a shape's actual outline selects it —
      // clicking inside the empty interior does NOT select it.
      const hit = [...this.existingShapes]
        .reverse()
        .find((s) => this.hitTest(s, x, y));
      if (hit) {
        if (e.shiftKey) {
          const index = this.selectedShapes.findIndex((s) => s.id === hit.id);
          if (index !== -1) {
            this.selectedShapes.splice(index, 1);
          } else {
            this.selectedShapes.push(hit);
          }
        } else if (!this.selectedShapes.find((s) => s.id === hit.id)) {
          // Select only the shape that was actually clicked. Resize
          // handles only show up for a single selected shape, so this
          // keeps click = "select just this one, and let me resize it".
          // To move a figure together with what's nested inside it, drag
          // a marquee box (click empty space and drag) over the whole
          // area instead — that still selects everything inside the box
          // as a group you can move together.
          this.selectedShapes = [hit];
        }

        // Start dragging
        if (this.canEdit && this.selectedShapes.length > 0) {
          this.isDragging = true;
          this.dragStartShapes = JSON.parse(JSON.stringify(this.selectedShapes));
          const first = this.selectedShapes[0];
          let anchorX: number, anchorY: number;
          switch (first.type) {
            case "rect":
            case "text":
            case "image":
              anchorX = first.x;
              anchorY = first.y;
              break;
            case "circle":
              anchorX = first.centerX;
              anchorY = first.centerY;
              break;
            case "diamond":
              anchorX = first.centerX;
              anchorY = first.centerY;
              break;
            case "pencil":
              anchorX = first.points[0]?.x ?? x;
              anchorY = first.points[0]?.y ?? y;
              break;
            case "arrow":
            case "line":
              anchorX = first.startX;
              anchorY = first.startY;
              break;
            default:
              anchorX = x;
              anchorY = y;
          }
          this.dragOffsetX = x - anchorX;
          this.dragOffsetY = y - anchorY;
        }
        this.clearCanvas();
        return;
      }

      // Click on empty: start marquee
      this.selectedShapes = [];
      this.isMarqueeDragging = true;
      this.marqueeStartX = x;
      this.marqueeStartY = y;
      this.selectionBox = { x, y, width: 0, height: 0 };
      this.clearCanvas();
      return;
    }

    // Other tools (text, image, pencil, eraser)
    const { x, y } = this.toWorld(screenX, screenY);
    if (this.selectedTool === "text") {
      e.preventDefault();
      e.stopPropagation();
      this.startTextInput(e.clientX, e.clientY, x, y);
      return;
    }
    if (this.selectedTool === "image") {
      this.startImagePlacement(x, y);
      return;
    }

    this.isDrawing = true;
    this.startX = x;
    this.startY = y;

    if (this.selectedTool === "pencil") {
      this.pencilPoints = [{ x, y }];
    }
    if (this.selectedTool === "eraser") {
      this.eraseAt(x, y);
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.selectedTool === "cursor" && this.isPanning) {
      this.view.panX = e.clientX - this.panStartX;
      this.view.panY = e.clientY - this.panStartY;
      this.onViewChange?.({ ...this.view });
      this.clearCanvas();
      return;
    }

    // Marquee drag
    if (this.selectedTool === "selection" && this.isMarqueeDragging) {
      const rect = this.canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const { x, y } = this.toWorld(screenX, screenY);
      this.selectionBox = {
        x: Math.min(this.marqueeStartX, x),
        y: Math.min(this.marqueeStartY, y),
        width: Math.abs(x - this.marqueeStartX),
        height: Math.abs(y - this.marqueeStartY),
      };
      this.clearCanvas();
      return;
    }

    // Resize (single selection)
    if (
      this.selectedTool === "selection" &&
      this.isResizing &&
      this.selectedShapes.length === 1
    ) {
      const rect = this.canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const { x, y } = this.toWorld(screenX, screenY);

      if (!this.resizeStartBounds || !this.resizeStartMouse) return;

      const dx = x - this.resizeStartMouse.x;
      const dy = y - this.resizeStartMouse.y;
      let newBounds = { ...this.resizeStartBounds };
      const shiftKey = e.shiftKey;

      switch (this.resizeHandle) {
        case "nw":
          newBounds.x = this.resizeStartBounds.x + dx;
          newBounds.y = this.resizeStartBounds.y + dy;
          newBounds.width = this.resizeStartBounds.width - dx;
          newBounds.height = this.resizeStartBounds.height - dy;
          if (shiftKey) {
            const aspect =
              this.resizeStartBounds.width / this.resizeStartBounds.height;
            newBounds.height = newBounds.width / aspect;
            newBounds.y =
              this.resizeStartBounds.y +
              this.resizeStartBounds.height -
              newBounds.height;
          }
          break;
        case "ne":
          newBounds.y = this.resizeStartBounds.y + dy;
          newBounds.width = this.resizeStartBounds.width + dx;
          newBounds.height = this.resizeStartBounds.height - dy;
          if (shiftKey) {
            const aspect =
              this.resizeStartBounds.width / this.resizeStartBounds.height;
            newBounds.height = newBounds.width / aspect;
            newBounds.y =
              this.resizeStartBounds.y +
              this.resizeStartBounds.height -
              newBounds.height;
          }
          break;
        case "se":
          newBounds.width = this.resizeStartBounds.width + dx;
          newBounds.height = this.resizeStartBounds.height + dy;
          if (shiftKey) {
            const aspect =
              this.resizeStartBounds.width / this.resizeStartBounds.height;
            newBounds.height = newBounds.width / aspect;
          }
          break;
        case "sw":
          newBounds.x = this.resizeStartBounds.x + dx;
          newBounds.width = this.resizeStartBounds.width - dx;
          newBounds.height = this.resizeStartBounds.height + dy;
          if (shiftKey) {
            const aspect =
              this.resizeStartBounds.width / this.resizeStartBounds.height;
            newBounds.width = newBounds.height * aspect;
            newBounds.x =
              this.resizeStartBounds.x +
              this.resizeStartBounds.width -
              newBounds.width;
          }
          break;
        default:
          break;
      }

      const minSize = 2 / this.view.scale;
      if (newBounds.width < minSize) newBounds.width = minSize;
      if (newBounds.height < minSize) newBounds.height = minSize;

      this.updateShapeFromBounds(this.selectedShapes[0], newBounds);
      this.clearCanvas();
      return;
    }

    // Drag move (multiple shapes)
    if (
      this.selectedTool === "selection" &&
      this.isDragging &&
      this.selectedShapes.length > 0
    ) {
      const rect = this.canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const { x, y } = this.toWorld(screenX, screenY);

      const first = this.selectedShapes[0];
      let anchorX: number, anchorY: number;
      switch (first.type) {
        case "rect":
        case "text":
        case "image":
          anchorX = first.x;
          anchorY = first.y;
          break;
        case "circle":
          anchorX = first.centerX;
          anchorY = first.centerY;
          break;
        case "diamond":
          anchorX = first.centerX;
          anchorY = first.centerY;
          break;
        case "pencil":
          anchorX = first.points[0]?.x ?? 0;
          anchorY = first.points[0]?.y ?? 0;
          break;
        case "arrow":
        case "line":
          anchorX = first.startX;
          anchorY = first.startY;
          break;
        default:
          anchorX = 0;
          anchorY = 0;
      }
      const deltaX = x - anchorX - this.dragOffsetX;
      const deltaY = y - anchorY - this.dragOffsetY;

      for (const shape of this.selectedShapes) {
        switch (shape.type) {
          case "rect":
          case "text":
          case "image":
            (shape as any).x += deltaX;
            (shape as any).y += deltaY;
            break;
          case "circle":
            shape.centerX += deltaX;
            shape.centerY += deltaY;
            break;
          case "diamond":
            shape.centerX += deltaX;
            shape.centerY += deltaY;
            break;
          case "pencil":
            shape.points = shape.points.map((p) => ({
              x: p.x + deltaX,
              y: p.y + deltaY,
            }));
            break;
          case "arrow":
          case "line":
            shape.startX += deltaX;
            shape.startY += deltaY;
            shape.endX += deltaX;
            shape.endY += deltaY;
            break;
          default:
            break;
        }
      }
      this.clearCanvas();
      return;
    }

    // Drawing tools
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const { x, y } = this.toWorld(screenX, screenY);

    if (this.selectedTool === "eraser") {
      this.eraseAt(x, y);
      return;
    }

    if (this.selectedTool === "pencil") {
      this.pencilPoints.push({ x, y });
    }

    this.clearCanvas();
    this.ctx.save();
    this.ctx.translate(this.view.panX, this.view.panY);
    this.ctx.scale(this.view.scale, this.view.scale);
    this.ctx.strokeStyle = this.selectedColor;
    this.ctx.lineWidth = 2 / this.view.scale;

    if (this.selectedTool === "pencil") {
      this.ctx.beginPath();
      this.pencilPoints.forEach((point, index) => {
        if (index === 0) this.ctx.moveTo(point.x, point.y);
        else this.ctx.lineTo(point.x, point.y);
      });
      this.ctx.stroke();
    } else if (this.selectedTool === "rect") {
      this.ctx.strokeRect(
        this.startX,
        this.startY,
        x - this.startX,
        y - this.startY,
      );
    } else if (this.selectedTool === "circle") {
      const dx = x - this.startX,
        dy = y - this.startY;
      const radius = Math.sqrt(dx * dx + dy * dy) / 2;
      this.ctx.beginPath();
      this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    } else if (this.selectedTool === "diamond") {
      const w = Math.abs(x - this.startX),
        h = Math.abs(y - this.startY);
      const cx = this.startX,
        cy = this.startY;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - h / 2);
      this.ctx.lineTo(cx + w / 2, cy);
      this.ctx.lineTo(cx, cy + h / 2);
      this.ctx.lineTo(cx - w / 2, cy);
      this.ctx.closePath();
      this.ctx.stroke();
    } else if (this.selectedTool === "arrow") {
      this.drawArrow(this.startX, this.startY, x, y);
    } else if (this.selectedTool === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (this.selectedTool === "cursor") {
      this.isPanning = false;
      return;
    }

    // Finish marquee
    if (this.selectedTool === "selection" && this.isMarqueeDragging) {
      this.isMarqueeDragging = false;
      if (this.selectionBox) {
        const { x, y, width, height } = this.selectionBox;
        // Only select shapes fully ENCLOSED by the drag box (not merely
        // overlapping it). This is what makes it possible to drag a tight
        // box around just a sub-figure sitting inside a bigger figure and
        // have only that sub-figure get selected/moved — the bigger
        // figure's bounds extend past the box, so it's correctly left out.
        // Dragging a box around the WHOLE big figure still encloses it and
        // everything nested inside it, so that group-select still works.
        const selected = this.existingShapes.filter((shape) => {
          const bounds = this.getShapeBounds(shape);
          return (
            bounds.x >= x &&
            bounds.y >= y &&
            bounds.x + bounds.width <= x + width &&
            bounds.y + bounds.height <= y + height
          );
        });
        this.selectedShapes = selected;
        this.selectionBox = null;
        this.clearCanvas();
      }
      return;
    }

    // Finish resize
    if (
      this.selectedTool === "selection" &&
      this.isResizing &&
      this.selectedShapes.length === 1
    ) {
      this.isResizing = false;
      this.resizeHandle = null;
      this.resizeStartBounds = null;
      this.resizeStartMouse = null;
      this.historyPush({
        type: "modify",
        before: this.resizeStartShapes,
        after: JSON.parse(JSON.stringify(this.selectedShapes))
      });
      this.sendUpdate(this.selectedShapes[0].id, this.selectedShapes[0]);
      return;
    }

    // Finish drag
    if (
      this.selectedTool === "selection" &&
      this.isDragging &&
      this.selectedShapes.length > 0
    ) {
      this.isDragging = false;
      this.historyPush({
        type: "modify",
        before: this.dragStartShapes,
        after: JSON.parse(JSON.stringify(this.selectedShapes))
      });
      for (const shape of this.selectedShapes) {
        this.sendUpdate(shape.id, shape);
      }
      return;
    }

    if (!this.isDrawing) return;
    this.isDrawing = false;

    const rect = this.canvas.getBoundingClientRect();
    const screenEndX = e.clientX - rect.left;
    const screenEndY = e.clientY - rect.top;
    const { x: endX, y: endY } = this.toWorld(screenEndX, screenEndY);
    const color = this.selectedColor;
    let shape: Shape | null = null;

    switch (this.selectedTool) {
      case "rect":
        shape = {
          id: genId(),
          type: "rect",
          x: this.startX,
          y: this.startY,
          width: endX - this.startX,
          height: endY - this.startY,
          color,
        };
        break;
      case "circle": {
        const dx = endX - this.startX,
          dy = endY - this.startY;
        shape = {
          id: genId(),
          type: "circle",
          centerX: this.startX,
          centerY: this.startY,
          radius: Math.sqrt(dx * dx + dy * dy) / 2,
          color,
        };
        break;
      }
      case "diamond":
        shape = {
          id: genId(),
          type: "diamond",
          centerX: this.startX,
          centerY: this.startY,
          width: Math.abs(endX - this.startX),
          height: Math.abs(endY - this.startY),
          color,
        };
        break;
      case "arrow":
        shape = {
          id: genId(),
          type: "arrow",
          startX: this.startX,
          startY: this.startY,
          endX,
          endY,
          color,
        };
        break;
      case "line":
        shape = {
          id: genId(),
          type: "line",
          startX: this.startX,
          startY: this.startY,
          endX,
          endY,
          color,
        };
        break;
      case "pencil":
        shape = {
          id: genId(),
          type: "pencil",
          points: this.pencilPoints,
          color,
        };
        break;
      case "eraser":
        return;
      default:
        return;
    }

    if (!shape) return;
    this.existingShapes.push(shape);
    this.historyPush({ type: "add", shapeId: shape.id, shape });
    this.clearCanvas();
    this.sendShape(shape);
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}