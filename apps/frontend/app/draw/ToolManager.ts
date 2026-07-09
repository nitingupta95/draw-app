import { Shape, Tool, Theme } from "./types";
import { genId } from "./utils";

export interface ToolCallbacks {
  getExistingShapes: () => Shape[];
  setExistingShapes: (shapes: Shape[]) => void;
  getSelectedShapes: () => Shape[];
  setSelectedShapes: (shapes: Shape[]) => void;
  getColor: () => string;
  getFontSize: () => number;
  getScale: () => number;
  redraw: () => void;
  historyPush: (action: any) => void;
  sendShape: (shape: Shape) => void;
  sendUpdate: (id: string, updates: any) => void;
  sendErase: (id: string) => void;
  sendReorder: (order: string[]) => void;
  hitTest: (x: number, y: number, padding: number) => Shape | undefined;
}

export class ToolManager {
  private callbacks: ToolCallbacks;
  private imageCache = new Map<string, HTMLImageElement>();
  private textInput?: HTMLTextAreaElement;

  constructor(callbacks: ToolCallbacks) {
    this.callbacks = callbacks;
  }

  destroy() {
    this.textInput?.remove();
  }

  updateTextProperty(id: string, key: string, value: any) {
    const existingShapes = this.callbacks.getExistingShapes();
    const shape = existingShapes.find((s) => s.id === id);
    if (shape && shape.type === "text") {
      (shape as any)[key] = value;
      this.callbacks.sendUpdate(id, { [key]: value });
      this.callbacks.redraw();
    }
  }

  moveLayer(id: string, direction: 1 | -1) {
    const selectedShapes = this.callbacks.getSelectedShapes();
    if (selectedShapes.length !== 1) return;
    
    const existingShapes = this.callbacks.getExistingShapes();
    const index = existingShapes.findIndex((s) => s.id === id);
    if (index === -1) return;
    
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= existingShapes.length) return;
    
    [existingShapes[index], existingShapes[newIndex]] = [
      existingShapes[newIndex],
      existingShapes[index],
    ];
    this.callbacks.redraw();
    this.callbacks.sendReorder(existingShapes.map((s) => s.id));
  }

  eraseAt(x: number, y: number) {
    const padding = 8 / this.callbacks.getScale();
    const hit = this.callbacks.hitTest(x, y, padding);
    if (hit) {
      let existingShapes = this.callbacks.getExistingShapes();
      existingShapes = existingShapes.filter((s) => s.id !== hit.id);
      this.callbacks.setExistingShapes(existingShapes);

      let selectedShapes = this.callbacks.getSelectedShapes();
      selectedShapes = selectedShapes.filter((s) => s.id !== hit.id);
      this.callbacks.setSelectedShapes(selectedShapes);

      this.callbacks.historyPush({ type: "erase", shapes: [hit] });
      this.callbacks.sendErase(hit.id);
      this.callbacks.redraw();
    }
  }

  startTextInput(
    clientX: number,
    clientY: number,
    worldX: number,
    worldY: number,
    existingText?: string,
    existingId?: string,
  ) {
    if (this.textInput) this.commitTextInput();

    const fontSize = this.callbacks.getFontSize();
    const color = this.callbacks.getColor();

    const textarea = document.createElement("textarea");
    textarea.style.position = "fixed";
    textarea.style.left = `${clientX}px`;
    textarea.style.top = `${clientY - 16}px`;
    textarea.style.background = "transparent";
    textarea.style.color = color;
    textarea.style.border = "1px dashed #888";
    textarea.style.font = `${fontSize}px sans-serif`;
    textarea.style.zIndex = "10000";
    textarea.style.outline = "none";
    textarea.style.minWidth = "100px";
    textarea.style.minHeight = `${fontSize}px`;
    textarea.style.resize = "none";
    textarea.style.padding = "2px";
    textarea.style.overflow = "hidden";

    if (existingText) {
      textarea.value = existingText;
    }

    document.body.appendChild(textarea);
    setTimeout(() => {
      textarea.focus();
      textarea.select();
    }, 0);

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
    (this.textInput as any)._color = color;
    (this.textInput as any)._id = existingId || null;
    (this.textInput as any)._fontSize = fontSize;
  }

  commitTextInput() {
    const input = this.textInput;
    if (!input) return;
    this.textInput = undefined;

    const content = input.value;
    const x = (input as any)._x;
    const y = (input as any)._y;
    const color = (input as any)._color ?? this.callbacks.getColor();
    const existingId = (input as any)._id;
    const fontSize = (input as any)._fontSize || this.callbacks.getFontSize();
    input.remove();

    if (!content.trim()) return;

    const existingShapes = this.callbacks.getExistingShapes();
    const selectedShapes = this.callbacks.getSelectedShapes();

    if (existingId) {
      const textShapeId = existingId;
      const beforeShape = JSON.parse(JSON.stringify(existingShapes.find(s => s.id === textShapeId)));
      const updates = { content, x, y, color, fontSize };
      this.callbacks.sendUpdate(textShapeId, updates);
      
      const index = existingShapes.findIndex((s) => s.id === textShapeId);
      if (index !== -1) {
        const shape = existingShapes[index] as any;
        shape.content = content;
        shape.x = x;
        shape.y = y;
        shape.color = color;
        shape.fontSize = fontSize;
        
        const selIndex = selectedShapes.findIndex((s) => s.id === textShapeId);
        if (selIndex !== -1) selectedShapes[selIndex] = shape;
        
        const textShape = existingShapes.find(s => s.id === textShapeId);
        if (textShape && textShape.type === "text") {
          this.callbacks.historyPush({
            type: "modify",
            before: [beforeShape],
            after: [{...textShape}]
          });
        }
        this.callbacks.redraw();
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
      existingShapes.push(shape);
      this.callbacks.historyPush({ type: "add", shapeId: shape.id, shape });
      this.callbacks.redraw();
      this.callbacks.sendShape(shape);
    }
  }

  startImagePlacement(x: number, y: number) {
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
          const existingShapes = this.callbacks.getExistingShapes();
          existingShapes.push(shape);
          this.callbacks.historyPush({ type: "add", shapeId: shape.id, shape });
          this.callbacks.redraw();
          this.callbacks.sendShape(shape);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  }

  forceCommitTextInput() {
    if (this.textInput) {
      this.commitTextInput();
    }
  }
}
