import { Shape } from "./types";
import { genId } from "./utils";

export interface SocketCallbacks {
  getShapes: () => Shape[];
  setShapes: (shapes: Shape[]) => void;
  getSelectedShapes: () => Shape[];
  setSelectedShapes: (shapes: Shape[]) => void;
  redraw: () => void;
}

export class SocketManager {
  private socket: WebSocket;
  private roomId: string;
  private callbacks: SocketCallbacks;

  constructor(socket: WebSocket, roomId: string, callbacks: SocketCallbacks) {
    this.socket = socket;
    this.roomId = roomId;
    this.callbacks = callbacks;
    this.socket.addEventListener("message", this.socketMessageHandler);
  }

  destroy() {
    this.socket.removeEventListener("message", this.socketMessageHandler);
  }

  private socketMessageHandler = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type !== "chat" || message.roomId !== this.roomId) return;
      
      const payload = JSON.parse(message.message);
      let existingShapes = this.callbacks.getShapes();
      let selectedShapes = this.callbacks.getSelectedShapes();
      let needsRedraw = false;

      if (payload.shape) {
        const shape: Shape = payload.shape;
        if (!shape.id) shape.id = genId();
        const existingIndex = existingShapes.findIndex((s) => s.id === shape.id);
        
        if (existingIndex !== -1) {
          existingShapes[existingIndex] = shape;
          const selIndex = selectedShapes.findIndex((s) => s.id === shape.id);
          if (selIndex !== -1) selectedShapes[selIndex] = shape;
        } else {
          existingShapes.push(shape);
        }
        needsRedraw = true;
      } else if (payload.updateId && payload.updates) {
        const existingIndex = existingShapes.findIndex((s) => s.id === payload.updateId);
        if (existingIndex !== -1) {
          Object.assign(existingShapes[existingIndex], payload.updates);
          const selIndex = selectedShapes.findIndex((s) => s.id === payload.updateId);
          if (selIndex !== -1) {
            Object.assign(selectedShapes[selIndex], payload.updates);
          }
          needsRedraw = true;
        }
      } else if (payload.reorder) {
        const order = payload.reorder as string[];
        const shapeMap = new Map(existingShapes.map((s) => [s.id, s]));
        const newOrder = order
          .map((id) => shapeMap.get(id))
          .filter((s) => s !== undefined) as Shape[];
        if (newOrder.length === existingShapes.length) {
          this.callbacks.setShapes(newOrder);
          needsRedraw = true;
        }
      } else if (payload.eraseId) {
        this.callbacks.setShapes(existingShapes.filter((s) => s.id !== payload.eraseId));
        this.callbacks.setSelectedShapes(selectedShapes.filter((s) => s.id !== payload.eraseId));
        needsRedraw = true;
      }

      if (needsRedraw) {
        this.callbacks.redraw();
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  sendShape(shape: Shape) {
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      }),
    );
  }

  sendUpdate(id: string, updates: Partial<Shape>) {
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ updateId: id, updates }),
        roomId: this.roomId,
      }),
    );
  }

  sendErase(id: string) {
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ eraseId: id }),
        roomId: this.roomId,
      }),
    );
  }

  sendReorder(order: string[]) {
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ reorder: order }),
        roomId: this.roomId,
      }),
    );
  }
}
