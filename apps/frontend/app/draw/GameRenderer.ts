import { Shape, Theme, ViewState } from "./types";
import { ShapeRenderer, BG_COLORS } from "./ShapeRenderer";
import { getShapeBounds, getCombinedBounds, getHandlePositions } from "./geometry";
import { SelectionManager } from "./SelectionManager";

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private renderer: ShapeRenderer;

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, renderer: ShapeRenderer) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.renderer = renderer;
  }

  clearCanvas(
    theme: Theme,
    view: ViewState,
    existingShapes: Shape[],
    selectedShapes: Shape[],
    selectionManager: SelectionManager
  ) {
    this.ctx.fillStyle = BG_COLORS[theme];
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(view.panX, view.panY);
    this.ctx.scale(view.scale, view.scale);

    existingShapes.forEach((shape) => {
      this.renderer.drawShape(shape, theme, view.scale);
    });

    if (selectedShapes.length > 0) {
      if (selectedShapes.length === 1) {
        const bounds = getShapeBounds(selectedShapes[0]);
        if (selectedShapes[0].type === "text") {
           const lines = selectedShapes[0].content.split("\n");
           this.ctx.font = `${selectedShapes[0].fontSize || 20}px ${selectedShapes[0].fontFamily || "sans-serif"}`;
           bounds.width = Math.max(...lines.map(l => this.ctx.measureText(l).width));
        }
        this.renderer.drawSelectionBox(bounds, view.scale);
        const handlePositions = getHandlePositions(bounds);
        this.renderer.drawHandles(handlePositions, view.scale);
      } else {
        const bounds = getCombinedBounds(selectedShapes, this.ctx)!;
        this.renderer.drawSelectionBox(bounds, view.scale);
      }
    }

    const selectionBox = selectionManager.selectionBox;
    if (selectionBox) {
      this.renderer.drawMarquee(selectionBox, view.scale);
    }

    this.ctx.restore();
    this.ctx.globalAlpha = 1;
  }
}
