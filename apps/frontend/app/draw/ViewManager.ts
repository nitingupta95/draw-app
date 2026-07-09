import { Shape, ViewState } from "./types";
import { getShapeBounds } from "./geometry";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

export class ViewManager {
  private view: ViewState = { scale: 1, panX: 0, panY: 0 };
  private onViewChange?: (view: ViewState) => void;
  private canvas: HTMLCanvasElement;
  private redraw: () => void;

  constructor(canvas: HTMLCanvasElement, redraw: () => void) {
    this.canvas = canvas;
    this.redraw = redraw;
  }

  getView(): ViewState {
    return this.view;
  }

  setOnViewChange(cb: (view: ViewState) => void) {
    this.onViewChange = cb;
    cb({ ...this.view });
  }

  applyView(next: Partial<ViewState>, focal?: { x: number; y: number }) {
    const prevScale = this.view.scale;
    const nextScale = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, next.scale ?? prevScale)
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
    this.redraw();
  }

  zoomIn() {
    this.applyView({ scale: Math.round((this.view.scale + ZOOM_STEP) * 100) / 100 });
  }

  zoomOut() {
    this.applyView({ scale: Math.round((this.view.scale - ZOOM_STEP) * 100) / 100 });
  }

  resetZoom() {
    this.applyView({ scale: 1, panX: 0, panY: 0 });
  }

  zoomToSelection(selectedShapes: Shape[]) {
    if (selectedShapes.length === 0) return;
    let bounds = getShapeBounds(selectedShapes[0]);
    for (let i = 1; i < selectedShapes.length; i++) {
      const b = getShapeBounds(selectedShapes[i]);
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

  toWorld(screenX: number, screenY: number) {
    return {
      x: (screenX - this.view.panX) / this.view.scale,
      y: (screenY - this.view.panY) / this.view.scale,
    };
  }
}
