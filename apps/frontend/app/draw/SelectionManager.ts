import { Shape, Handle } from "./types";
import { getShapeBounds, getCombinedBounds, getHandlePositions, hitTestHandle, updateShapeFromBounds, hitTest } from "./geometry";

export interface SelectionCallbacks {
  getShapes: () => Shape[];
  setShapes: (shapes: Shape[]) => void;
  redraw: () => void;
  sendUpdate: (id: string, shape: Partial<Shape>) => void;
  historyPush: (action: any) => void;
  getCtx: () => CanvasRenderingContext2D;
  getScale: () => number;
}

export class SelectionManager {
  selectedShapes: Shape[] = [];
  selectionBox: { x: number; y: number; width: number; height: number } | null = null;
  
  isDragging = false;
  isResizing = false;
  dragStartShapes: Shape[] = [];
  resizeStartShapes: Shape[] = [];
  activeHandle: Handle | null = null;
  dragStartX = 0;
  dragStartY = 0;

  private callbacks: SelectionCallbacks;

  constructor(callbacks: SelectionCallbacks) {
    this.callbacks = callbacks;
  }

  clear() {
    this.selectedShapes = [];
    this.selectionBox = null;
  }

  set(shapes: Shape[]) {
    this.selectedShapes = shapes;
  }

  get() {
    return this.selectedShapes;
  }

  onMouseDown(x: number, y: number, e: MouseEvent, canEdit: boolean): boolean {
    const existingShapes = this.callbacks.getShapes();
    const ctx = this.callbacks.getCtx();
    const scale = this.callbacks.getScale();

    // Check handles for resize
    if (canEdit && this.selectedShapes.length === 1) {
      const shape = this.selectedShapes[0];
      const bounds = getShapeBounds(shape);
      if (shape.type === "text") {
         const lines = shape.content.split("\n");
         ctx.font = `${shape.fontSize || 20}px ${shape.fontFamily || "sans-serif"}`;
         bounds.width = Math.max(...lines.map(l => ctx.measureText(l).width));
      }
      const handle = hitTestHandle(x, y, bounds, scale);
      if (handle) {
        this.isResizing = true;
        this.resizeStartShapes = JSON.parse(JSON.stringify(this.selectedShapes));
        this.activeHandle = handle;
        this.dragStartX = x;
        this.dragStartY = y;
        return true; // Handled
      }
    }

    // Check drag for group
    if (this.selectedShapes.length > 1) {
      const groupBounds = getCombinedBounds(this.selectedShapes, ctx);
      const pad = 4 / scale;
      if (
        groupBounds &&
        x >= groupBounds.x - pad &&
        x <= groupBounds.x + groupBounds.width + pad &&
        y >= groupBounds.y - pad &&
        y <= groupBounds.y + groupBounds.height + pad
      ) {
        if (canEdit) {
          this.isDragging = true;
          this.dragStartShapes = JSON.parse(JSON.stringify(this.selectedShapes));
          this.dragStartX = x;
          this.dragStartY = y;
        }
        return true; // Handled
      }
    }

    // Check hit shape
    const hit = [...existingShapes]
      .reverse()
      .find((s) => hitTest(s, x, y, 8 / scale, ctx));

    if (hit) {
      if (e.shiftKey) {
        const index = this.selectedShapes.findIndex((s) => s.id === hit.id);
        if (index !== -1) {
          this.selectedShapes.splice(index, 1);
        } else {
          this.selectedShapes.push(hit);
        }
      } else if (!this.selectedShapes.find((s) => s.id === hit.id)) {
        // Only re-select if the hit shape isn't already selected.
        // This allows clicking inside a selected group without losing the group selection.
        this.selectedShapes = [hit];
      }

      if (canEdit && this.selectedShapes.length > 0) {
        this.isDragging = true;
        this.dragStartShapes = JSON.parse(JSON.stringify(this.selectedShapes));
        this.dragStartX = x;
        this.dragStartY = y;
      }
      this.callbacks.redraw();
      return true; // Handled
    }

    // Start Marquee
    this.selectedShapes = [];
    this.selectionBox = { x, y, width: 0, height: 0 };
    this.dragStartX = x;
    this.dragStartY = y;
    this.callbacks.redraw();
    return true;
  }

  onMouseMove(x: number, y: number): boolean {
    if (this.isResizing && this.selectedShapes.length === 1) {
      const dx = x - this.dragStartX;
      const dy = y - this.dragStartY;
      const startShape = this.resizeStartShapes[0];
      const startBounds = getShapeBounds(startShape);

      const newBounds = { ...startBounds };
      switch (this.activeHandle) {
        case "nw":
          newBounds.x += dx;
          newBounds.y += dy;
          newBounds.width -= dx;
          newBounds.height -= dy;
          break;
        case "ne":
          newBounds.y += dy;
          newBounds.width += dx;
          newBounds.height -= dy;
          break;
        case "se":
          newBounds.width += dx;
          newBounds.height += dy;
          break;
        case "sw":
          newBounds.x += dx;
          newBounds.width -= dx;
          newBounds.height += dy;
          break;
      }

      const minSize = 10;
      if (newBounds.width < minSize) newBounds.width = minSize;
      if (newBounds.height < minSize) newBounds.height = minSize;

      updateShapeFromBounds(this.selectedShapes[0], newBounds);
      this.callbacks.redraw();
      return true;
    }

    if (this.isDragging && this.selectedShapes.length > 0) {
      const dx = x - this.dragStartX;
      const dy = y - this.dragStartY;
      for (let i = 0; i < this.selectedShapes.length; i++) {
        const shape = this.selectedShapes[i];
        const startShape = this.dragStartShapes[i];
        if (startShape.type === "pencil" && shape.type === "pencil") {
          shape.points = startShape.points.map((p) => ({
            x: p.x + dx,
            y: p.y + dy,
          }));
        } else if ((startShape.type === "arrow" || startShape.type === "line") && (shape.type === "arrow" || shape.type === "line")) {
          shape.startX = startShape.startX + dx;
          shape.startY = startShape.startY + dy;
          shape.endX = startShape.endX + dx;
          shape.endY = startShape.endY + dy;
        } else {
          if (shape.type === "rect" || shape.type === "text" || shape.type === "image") {
            shape.x = (startShape as any).x + dx;
            shape.y = (startShape as any).y + dy;
          }
          if (shape.type === "circle" || shape.type === "diamond") {
            shape.centerX = (startShape as any).centerX + dx;
            shape.centerY = (startShape as any).centerY + dy;
          }
        }
      }
      this.callbacks.redraw();
      return true;
    }

    if (this.selectionBox) {
      const currentX = Math.min(x, this.dragStartX);
      const currentY = Math.min(y, this.dragStartY);
      const width = Math.abs(x - this.dragStartX);
      const height = Math.abs(y - this.dragStartY);
      this.selectionBox = { x: currentX, y: currentY, width, height };

      const existingShapes = this.callbacks.getShapes();
      const selected = existingShapes.filter((shape) => {
        const bounds = getShapeBounds(shape);
        return (
          bounds.x >= currentX &&
          bounds.y >= currentY &&
          bounds.x + bounds.width <= currentX + width &&
          bounds.y + bounds.height <= currentY + height
        );
      });
      this.selectedShapes = selected;
      this.callbacks.redraw();
      return true;
    }
    return false;
  }

  onMouseUp(): boolean {
    if (this.isResizing && this.selectedShapes.length === 1) {
      this.callbacks.historyPush({
        type: "modify",
        before: this.resizeStartShapes,
        after: JSON.parse(JSON.stringify(this.selectedShapes))
      });
      this.callbacks.sendUpdate(this.selectedShapes[0].id, this.selectedShapes[0]);
      this.isResizing = false;
      this.activeHandle = null;
      return true;
    }

    if (this.isDragging && this.selectedShapes.length > 0) {
      const hasMoved = this.selectedShapes.some((s, i) => {
        const start = this.dragStartShapes[i];
        return JSON.stringify(s) !== JSON.stringify(start);
      });
      if (hasMoved) {
        this.callbacks.historyPush({
          type: "modify",
          before: this.dragStartShapes,
          after: JSON.parse(JSON.stringify(this.selectedShapes))
        });
        this.selectedShapes.forEach((s) => this.callbacks.sendUpdate(s.id, s));
      }
      this.isDragging = false;
      return true;
    }

    if (this.selectionBox) {
      this.selectionBox = null;
      this.callbacks.redraw();
      return true;
    }

    return false;
  }
}
