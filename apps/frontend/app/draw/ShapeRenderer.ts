import { Shape, Theme, ViewState, Handle } from "./types";

export const BG_COLORS: Record<Theme, string> = {
  dark: "#121212",
  light: "#ffffff",
};

export const DEFAULT_STROKE: Record<Theme, string> = {
  dark: "#e9ecef",
  light: "#1e1e1e",
};

export const HANDLE_SIZE = 8;

export class ShapeRenderer {
  private ctx: CanvasRenderingContext2D;
  private imageCache = new Map<string, HTMLImageElement>();
  private requestRedraw: () => void;

  constructor(ctx: CanvasRenderingContext2D, requestRedraw: () => void) {
    this.ctx = ctx;
    this.requestRedraw = requestRedraw;
  }

  getOrLoadImage(src: string): HTMLImageElement {
    let img = this.imageCache.get(src);
    if (!img) {
      img = new window.Image();
      img.src = src;
      this.imageCache.set(src, img);
      img.onload = () => this.requestRedraw();
    }
    return img;
  }

  drawArrow(x1: number, y1: number, x2: number, y2: number, color?: string) {
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

  drawShape(shape: Shape, theme: Theme, scale: number) {
    if (shape.type === "text") {
      this.ctx.globalAlpha = (shape.opacity ?? 100) / 100;
    } else {
      this.ctx.globalAlpha = 1;
    }

    if (shape.type !== "image") {
      this.ctx.strokeStyle = shape.color ?? DEFAULT_STROKE[theme];
      this.ctx.fillStyle = shape.color ?? DEFAULT_STROKE[theme];
    }
    this.ctx.lineWidth = 2 / scale;

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
        this.ctx.textBaseline = "top";
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
        }
        break;
      }
      default:
        break;
    }
  }

  drawSelectionBox(box: { x: number, y: number, width: number, height: number }, scale: number) {
    this.ctx.strokeStyle = "#4A90D9";
    this.ctx.lineWidth = 2 / scale;
    this.ctx.setLineDash([6 / scale, 4 / scale]);
    this.ctx.globalAlpha = 1;
    this.ctx.strokeRect(
      box.x - 4 / scale,
      box.y - 4 / scale,
      box.width + 8 / scale,
      box.height + 8 / scale,
    );
    this.ctx.setLineDash([]);
  }

  drawMarquee(box: { x: number, y: number, width: number, height: number }, scale: number) {
    this.ctx.strokeStyle = "#4A90D9";
    this.ctx.lineWidth = 2 / scale;
    this.ctx.setLineDash([4 / scale, 4 / scale]);
    this.ctx.globalAlpha = 1;
    this.ctx.strokeRect(box.x, box.y, box.width, box.height);
    this.ctx.setLineDash([]);
  }

  drawHandles(positions: Record<Handle, { x: number, y: number }>, scale: number) {
    const handleRadius = HANDLE_SIZE / scale;
    this.ctx.fillStyle = "#4A90D9";
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 1 / scale;
    for (const pos of Object.values(positions)) {
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, handleRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }
}
