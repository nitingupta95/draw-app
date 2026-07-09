import { getExistingShapes } from "./http";
import {
  Tool,
  Theme,
  BaseShape,
  Shape,
  HistoryAction,
  ViewState,
  Handle
} from "./types";
import { HistoryManager } from "./HistoryManager";
import { SocketManager } from "./SocketManager";
import { SelectionManager } from "./SelectionManager";
import { InputHandler } from "./InputHandler";
import { ShapeRenderer, BG_COLORS, DEFAULT_STROKE } from "./ShapeRenderer";
import { getShapeBounds, getCombinedBounds, getHandlePositions, hitTest } from "./geometry";
import { genId } from "./utils";
import { ViewManager } from "./ViewManager";
import { ToolManager } from "./ToolManager";
import { GameRenderer } from "./GameRenderer";

export type { Tool, Theme, BaseShape, Shape, HistoryAction, ViewState, Handle };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private renderer: ShapeRenderer;
  private selectedTool: Tool = "pencil";
  private canEdit: boolean = true;
  private theme: Theme = "light";
  private selectedColor: string = DEFAULT_STROKE.light;
  private fontSize: number = 20;

  private historyManager: HistoryManager;
  private _selectionManager: SelectionManager;
  private socketManager: SocketManager;
  private inputHandler: InputHandler;
  private viewManager: ViewManager;
  private toolManager: ToolManager;
  private gameRenderer: GameRenderer;
  socket: WebSocket;

  get selectedShapes() { return this._selectionManager.selectedShapes; }
  set selectedShapes(val) { this._selectionManager.selectedShapes = val; }

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    
    this.renderer = new ShapeRenderer(this.ctx, () => this.clearCanvas());
    this.gameRenderer = new GameRenderer(this.ctx, this.canvas, this.renderer);
    this.viewManager = new ViewManager(this.canvas, () => this.clearCanvas());

    this.socketManager = new SocketManager(socket, roomId, {
      getShapes: () => this.existingShapes,
      setShapes: (shapes: Shape[]) => { this.existingShapes = shapes; },
      getSelectedShapes: () => this.selectedShapes,
      setSelectedShapes: (shapes: Shape[]) => { this.selectedShapes = shapes; },
      redraw: () => this.clearCanvas()
    });

    this.historyManager = new HistoryManager({
      getShapes: () => this.existingShapes,
      setShapes: (shapes: Shape[]) => { this.existingShapes = shapes; },
      sendShape: (shape: Shape) => this.socketManager.sendShape(shape),
      sendErase: (id: string) => this.socketManager.sendErase(id),
      sendReorder: (order: string[]) => this.socketManager.sendReorder(order),
      clearSelection: () => { this.selectedShapes = []; },
      redraw: () => this.clearCanvas()
    });

    this._selectionManager = new SelectionManager({
      getShapes: () => this.existingShapes,
      setShapes: (shapes) => this.existingShapes = shapes,
      redraw: () => this.clearCanvas(),
      sendUpdate: (id, shape) => this.socketManager.sendUpdate(id, shape),
      historyPush: (action) => this.historyPush(action),
      getCtx: () => this.ctx,
      getScale: () => this.viewManager.getView().scale
    });

    this.toolManager = new ToolManager({
      getExistingShapes: () => this.existingShapes,
      setExistingShapes: (s) => { this.existingShapes = s; },
      getSelectedShapes: () => this.selectedShapes,
      setSelectedShapes: (s) => { this.selectedShapes = s; },
      getColor: () => this.selectedColor,
      getFontSize: () => this.fontSize,
      getScale: () => this.viewManager.getView().scale,
      redraw: () => this.clearCanvas(),
      historyPush: (action) => this.historyPush(action),
      sendShape: (s) => this.socketManager.sendShape(s),
      sendUpdate: (id, updates) => this.socketManager.sendUpdate(id, updates),
      sendErase: (id) => this.socketManager.sendErase(id),
      sendReorder: (order) => this.socketManager.sendReorder(order),
      hitTest: (x, y, padding) => [...this.existingShapes].reverse().find((s) => hitTest(s, x, y, padding, this.ctx))
    });

    this.inputHandler = new InputHandler(this.canvas, {
      getView: () => this.viewManager.getView(),
      setView: (v) => { this.viewManager.applyView(v); },
      getTool: () => this.selectedTool,
      getColor: () => this.selectedColor,
      getCanEdit: () => this.canEdit,
      getSelectionManager: () => this._selectionManager,
      redraw: () => this.clearCanvas(),
      drawTemp: (drawFn) => {
        this.ctx.save();
        const v = this.viewManager.getView();
        this.ctx.translate(v.panX, v.panY);
        this.ctx.scale(v.scale, v.scale);
        drawFn(this.ctx);
        this.ctx.restore();
      },
      addShape: (shape) => {
        this.existingShapes.push(shape);
        this.historyPush({ type: "add", shapeId: shape.id, shape });
        this.clearCanvas();
        this.socketManager.sendShape(shape);
      },
      eraseAt: (x, y) => this.toolManager.eraseAt(x, y),
      startTextInput: (cx, cy, wx, wy, t, id) => this.toolManager.startTextInput(cx, cy, wx, wy, t, id),
      startImagePlacement: (x, y) => this.toolManager.startImagePlacement(x, y),
      toWorld: (sx, sy) => this.viewManager.toWorld(sx, sy),
      deleteSelected: () => {
        if (this.selectedShapes.length > 0) {
          const ids = this.selectedShapes.map(s => s.id);
          this.existingShapes = this.existingShapes.filter(s => !ids.includes(s.id));
          this.historyPush({ type: "erase", shapes: this.selectedShapes });
          ids.forEach(id => this.socketManager.sendErase(id));
          this.selectedShapes = [];
          this.clearCanvas();
        }
      },
      undo: () => this.undo(),
      redo: () => this.redo(),
    });
    this.inputHandler.init();
    this.init();
  }

  destroy() {
    this.inputHandler.destroy();
    this.socketManager.destroy();
    this.toolManager.destroy();
  }

  setCanEdit(canEdit: boolean) { this.canEdit = canEdit; }
  historyPush(action: HistoryAction) { this.historyManager.push(action); }
  undo() { this.historyManager.undo(); }
  redo() { this.historyManager.redo(); }
  
  setTool(tool: Tool) {
    this.toolManager.forceCommitTextInput();
    this.selectedTool = tool;
    this.selectedShapes = [];
    this.clearCanvas();
  }

  setColor(color: string) { this.selectedColor = color; }
  setFontSize(size: number) { this.fontSize = size; }
  
  setTheme(theme: Theme) {
    this.theme = theme;
    if (this.selectedColor === DEFAULT_STROKE[theme === "dark" ? "light" : "dark"]) {
      this.selectedColor = DEFAULT_STROKE[theme];
    }
    this.clearCanvas();
  }

  setOnViewChange(cb: (view: ViewState) => void) { this.viewManager.setOnViewChange(cb); }
  zoomIn() { this.viewManager.zoomIn(); }
  zoomOut() { this.viewManager.zoomOut(); }
  resetZoom() { this.viewManager.resetZoom(); }
  zoomToSelection() { this.viewManager.zoomToSelection(this.selectedShapes); }
  updateTextProperty(id: string, key: string, value: any) { this.toolManager.updateTextProperty(id, key, value); }
  moveLayer(id: string, direction: 1 | -1) { this.toolManager.moveLayer(id, direction); }

  async init() {
    try {
      const loaded = (await getExistingShapes(this.roomId)) as Shape[];
      loaded.forEach((s) => {
        if (!s.id) s.id = genId();
        if (s.type !== "image" && !s.color) s.color = DEFAULT_STROKE[this.theme];
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

  redraw() { this.clearCanvas(); }

  clearCanvas() {
    this.gameRenderer.clearCanvas(
      this.theme,
      this.viewManager.getView(),
      this.existingShapes,
      this.selectedShapes,
      this._selectionManager
    );
  }
}