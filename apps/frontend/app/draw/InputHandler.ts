import { Shape, Tool, Theme } from "./types";
import { SelectionManager } from "./SelectionManager";
import { genId } from "./utils";

export interface InputCallbacks {
  getView: () => { panX: number; panY: number; scale: number };
  setView: (view: { panX: number; panY: number; scale: number }) => void;
  getTool: () => Tool;
  getColor: () => string;
  getCanEdit: () => boolean;
  getSelectionManager: () => SelectionManager;
  redraw: () => void;
  drawTemp: (drawFn: (ctx: CanvasRenderingContext2D) => void) => void;
  addShape: (shape: Shape) => void;
  eraseAt: (x: number, y: number) => void;
  startTextInput: (clientX: number, clientY: number, worldX: number, worldY: number, text?: string, id?: string) => void;
  startImagePlacement: (worldX: number, worldY: number) => void;
  toWorld: (screenX: number, screenY: number) => { x: number; y: number };
  deleteSelected: () => void;
  undo: () => void;
  redo: () => void;
}

export class InputHandler {
  private canvas: HTMLCanvasElement;
  private callbacks: InputCallbacks;

  private isDrawing = false;
  private isPanning = false;
  private startX = 0;
  private startY = 0;
  private pencilPoints: { x: number; y: number }[] = [];
  
  // Touch specific
  private touchStartDist = 0;
  private touchStartScale = 1;
  private isTwoFingerPan = false;

  public isSpacePressed = false;

  constructor(canvas: HTMLCanvasElement, callbacks: InputCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
  }

  init() {
    this.initMouseHandlers();
    this.initTouchHandlers();
    this.initWheelHandler();
    this.initDoubleClickHandler();
    this.initKeyboardHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("touchstart", this.touchStartHandler);
    this.canvas.removeEventListener("touchmove", this.touchMoveHandler);
    this.canvas.removeEventListener("touchend", this.touchEndHandler);
    this.canvas.removeEventListener("wheel", this.wheelHandler);
    this.canvas.removeEventListener("dblclick", this.doubleClickHandler);
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
  }

  private getMouseCoords(e: MouseEvent | Touch) {
    const rect = this.canvas.getBoundingClientRect();
    return this.callbacks.toWorld(e.clientX - rect.left, e.clientY - rect.top);
  }

  // Mouse Handlers
  private mouseDownHandler = (e: MouseEvent) => {
    const tool = this.callbacks.getTool();
    if (this.isSpacePressed || tool === "cursor") {
      this.isPanning = true;
      return;
    }

    const { x, y } = this.getMouseCoords(e);
    this.startX = x;
    this.startY = y;

    if (tool === "selection") {
      const handled = this.callbacks.getSelectionManager().onMouseDown(x, y, e as any, this.callbacks.getCanEdit());
      if (handled) return;
    }

    if (!this.callbacks.getCanEdit()) return;

    if (tool === "text") {
      this.callbacks.startTextInput(e.clientX, e.clientY, x, y);
      return;
    }
    if (tool === "image") {
      this.callbacks.startImagePlacement(x, y);
      return;
    }

    this.isDrawing = true;
    if (tool === "pencil") this.pencilPoints = [{ x, y }];
    if (tool === "eraser") this.callbacks.eraseAt(x, y);
  };

  private mouseMoveHandler = (e: MouseEvent) => {
    const { x, y } = this.getMouseCoords(e);
    const view = this.callbacks.getView();
    const tool = this.callbacks.getTool();

    if (this.isPanning) {
      this.callbacks.setView({
        ...view,
        panX: view.panX + (e.movementX * window.devicePixelRatio) / view.scale,
        panY: view.panY + (e.movementY * window.devicePixelRatio) / view.scale,
      });
      return;
    }

    if (tool === "selection") {
      const handled = this.callbacks.getSelectionManager().onMouseMove(x, y);
      if (handled) return;
    }

    if (!this.isDrawing) return;

    if (tool === "eraser") {
      this.callbacks.eraseAt(x, y);
      return;
    }

    if (tool === "pencil") this.pencilPoints.push({ x, y });

    this.callbacks.redraw();
    this.callbacks.drawTemp((ctx) => {
      ctx.strokeStyle = this.callbacks.getColor();
      ctx.lineWidth = 2 / view.scale;

      if (tool === "pencil") {
        ctx.beginPath();
        this.pencilPoints.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      } else if (tool === "rect") {
        ctx.strokeRect(this.startX, this.startY, x - this.startX, y - this.startY);
      } else if (tool === "circle") {
        const dx = x - this.startX, dy = y - this.startY;
        const radius = Math.sqrt(dx * dx + dy * dy) / 2;
        ctx.beginPath();
        ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === "diamond") {
        const w = Math.abs(x - this.startX), h = Math.abs(y - this.startY);
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY - h / 2);
        ctx.lineTo(this.startX + w / 2, this.startY);
        ctx.lineTo(this.startX, this.startY + h / 2);
        ctx.lineTo(this.startX - w / 2, this.startY);
        ctx.closePath();
        ctx.stroke();
      } else if (tool === "arrow") {
        this.drawTempArrow(ctx, this.startX, this.startY, x, y);
      } else if (tool === "line") {
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    });
  };

  private drawTempArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    const headLen = 12;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(
      x2 - headLen * Math.cos(angle - Math.PI / 6),
      y2 - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLen * Math.cos(angle + Math.PI / 6),
      y2 - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  }

  private mouseUpHandler = (e: MouseEvent) => {
    if (this.isPanning) {
      this.isPanning = false;
      return;
    }

    const tool = this.callbacks.getTool();
    if (tool === "selection") {
      const handled = this.callbacks.getSelectionManager().onMouseUp();
      if (handled) return;
    }

    if (!this.isDrawing) return;
    this.isDrawing = false;

    const { x: endX, y: endY } = this.getMouseCoords(e);
    const color = this.callbacks.getColor();
    let shape: Shape | null = null;

    switch (tool) {
      case "rect":
        shape = {
          id: genId(), type: "rect", x: this.startX, y: this.startY, width: endX - this.startX, height: endY - this.startY, color
        };
        break;
      case "circle": {
        const dx = endX - this.startX, dy = endY - this.startY;
        shape = {
          id: genId(), type: "circle", centerX: this.startX, centerY: this.startY, radius: Math.sqrt(dx * dx + dy * dy) / 2, color
        };
        break;
      }
      case "diamond":
        shape = {
          id: genId(), type: "diamond", centerX: this.startX, centerY: this.startY, width: Math.abs(endX - this.startX), height: Math.abs(endY - this.startY), color
        };
        break;
      case "arrow":
      case "line":
        shape = {
          id: genId(), type: tool, startX: this.startX, startY: this.startY, endX, endY, color
        };
        break;
      case "pencil":
        shape = {
          id: genId(), type: "pencil", points: this.pencilPoints, color
        };
        break;
    }

    if (shape) {
      this.callbacks.addShape(shape);
    }
  };

  private initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
  }

  // Wheel
  private wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    const view = this.callbacks.getView();
    
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY * -0.01;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let newScale = view.scale * (1 + delta);
      newScale = Math.min(Math.max(newScale, 0.1), 5);

      const dx = (mouseX / view.scale) - (mouseX / newScale);
      const dy = (mouseY / view.scale) - (mouseY / newScale);

      this.callbacks.setView({
        scale: newScale,
        panX: view.panX - dx,
        panY: view.panY - dy,
      });
    } else {
      this.callbacks.setView({
        ...view,
        panX: view.panX - (e.deltaX / view.scale),
        panY: view.panY - (e.deltaY / view.scale),
      });
    }
  };

  private initWheelHandler() {
    this.canvas.addEventListener("wheel", this.wheelHandler, { passive: false });
  }

  // Touch
  private touchStartHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      this.isTwoFingerPan = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.touchStartDist = Math.sqrt(dx * dx + dy * dy);
      this.touchStartScale = this.callbacks.getView().scale;
      this.isPanning = true;
      return;
    }
    if (e.touches.length === 1 && !this.isTwoFingerPan) {
      this.mouseDownHandler(e.touches[0] as any);
    }
  };

  private touchMoveHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const view = this.callbacks.getView();
      
      let newScale = this.touchStartScale * (dist / this.touchStartDist);
      newScale = Math.min(Math.max(newScale, 0.1), 5);
      
      this.callbacks.setView({
        ...view,
        scale: newScale,
      });
      return;
    }
    if (e.touches.length === 1 && !this.isTwoFingerPan) {
      // Simulate movementX/Y for panning
      const touch = e.touches[0];
      const moveEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        movementX: 0, // In full implementation, track previous touch pos
        movementY: 0
      };
      this.mouseMoveHandler(moveEvent as any);
    }
  };

  private touchEndHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length < 2) {
      this.isTwoFingerPan = false;
      this.isPanning = false;
    }
    if (e.touches.length === 0) {
      this.mouseUpHandler(e.changedTouches[0] as any);
    }
  };

  private initTouchHandlers() {
    this.canvas.addEventListener("touchstart", this.touchStartHandler, { passive: false });
    this.canvas.addEventListener("touchmove", this.touchMoveHandler, { passive: false });
    this.canvas.addEventListener("touchend", this.touchEndHandler, { passive: false });
  }

  // Double Click
  private doubleClickHandler = (e: MouseEvent) => {
    const { x, y } = this.getMouseCoords(e);
    const selectionMgr = this.callbacks.getSelectionManager();
    const selectedShapes = selectionMgr.get();
    
    if (selectedShapes.length !== 1) return;
    const hit = selectedShapes[0];
    if (hit.type !== "text") return;

    e.preventDefault();
    e.stopPropagation();
    this.callbacks.startTextInput(e.clientX, e.clientY, hit.x, hit.y, hit.content, hit.id);
  };

  private initDoubleClickHandler() {
    this.canvas.addEventListener("dblclick", this.doubleClickHandler);
  }

  // Keyboard
  private keyDownHandler = (e: KeyboardEvent) => {
    if (e.key === " ") this.isSpacePressed = true;

    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.key === "Backspace" || e.key === "Delete") {
      this.callbacks.deleteSelected();
    } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
      if (e.shiftKey) {
        this.callbacks.redo();
      } else {
        this.callbacks.undo();
      }
    }
  };

  private keyUpHandler = (e: KeyboardEvent) => {
    if (e.key === " ") this.isSpacePressed = false;
  };

  private initKeyboardHandlers() {
    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  }
}
