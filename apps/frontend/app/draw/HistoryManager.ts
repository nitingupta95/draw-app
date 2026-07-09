import { HistoryAction, Shape } from "./types";

export interface HistoryCallbacks {
  getShapes: () => Shape[];
  setShapes: (shapes: Shape[]) => void;
  sendShape: (shape: Shape) => void;
  sendErase: (shapeId: string) => void;
  sendReorder: (order: string[]) => void;
  clearSelection: () => void;
  redraw: () => void;
}

export class HistoryManager {
  private undoStack: HistoryAction[] = [];
  private redoStack: HistoryAction[] = [];
  private callbacks: HistoryCallbacks;

  constructor(callbacks: HistoryCallbacks) {
    this.callbacks = callbacks;
  }

  push(action: HistoryAction) {
    this.undoStack.push(action);
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const action = this.undoStack.pop()!;
    this.redoStack.push(action);
    
    let currentShapes = [...this.callbacks.getShapes()];

    switch (action.type) {
      case "add":
        currentShapes = currentShapes.filter(s => s.id !== action.shapeId);
        this.callbacks.sendErase(action.shapeId);
        break;
      case "erase":
        action.shapes.forEach(s => {
          currentShapes.push(s);
          this.callbacks.sendShape(s);
        });
        break;
      case "modify":
        action.before.forEach(beforeShape => {
          const idx = currentShapes.findIndex(s => s.id === beforeShape.id);
          if (idx !== -1) {
            currentShapes[idx] = beforeShape;
          } else {
            currentShapes.push(beforeShape);
          }
          this.callbacks.sendShape(beforeShape);
        });
        break;
      case "reorder":
        const shapeMap = new Map(currentShapes.map(s => [s.id, s]));
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
        currentShapes = newShapes;
        this.callbacks.sendReorder(action.before);
        break;
    }
    
    this.callbacks.setShapes(currentShapes);
    this.callbacks.clearSelection();
    this.callbacks.redraw();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const action = this.redoStack.pop()!;
    this.undoStack.push(action);
    
    let currentShapes = [...this.callbacks.getShapes()];

    switch (action.type) {
      case "add":
        currentShapes.push(action.shape);
        this.callbacks.sendShape(action.shape);
        break;
      case "erase":
        const idsToErase = new Set(action.shapes.map(s => s.id));
        currentShapes = currentShapes.filter(s => !idsToErase.has(s.id));
        action.shapes.forEach(s => this.callbacks.sendErase(s.id));
        break;
      case "modify":
        action.after.forEach(afterShape => {
          const idx = currentShapes.findIndex(s => s.id === afterShape.id);
          if (idx !== -1) {
            currentShapes[idx] = afterShape;
          } else {
            currentShapes.push(afterShape);
          }
          this.callbacks.sendShape(afterShape);
        });
        break;
      case "reorder":
        const shapeMap = new Map(currentShapes.map(s => [s.id, s]));
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
        currentShapes = newShapes;
        this.callbacks.sendReorder(action.after);
        break;
    }
    
    this.callbacks.setShapes(currentShapes);
    this.callbacks.clearSelection();
    this.callbacks.redraw();
  }
}
