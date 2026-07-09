import { Shape, Handle } from "./types";
import { HANDLE_SIZE } from "./ShapeRenderer";

export function getShapeBounds(shape: Shape): {
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
      const totalHeight = shape.content.split("\n").length * fontSize * 1.2;
      // We will approximate width in getShapeBounds since we don't have ctx here.
      // The caller must provide ctx for exact width, or we just rely on hitTest.
      // Game.ts used ctx to measure, so this might be inaccurate without ctx.
      // For now we will return a minimal bound, or pass ctx here.
      return { x: shape.x, y: shape.y, width: 100, height: totalHeight }; 
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

export function getCombinedBounds(shapes: Shape[], ctx?: CanvasRenderingContext2D): {
  x: number;
  y: number;
  width: number;
  height: number;
} | null {
  if (shapes.length === 0) return null;
  let bounds = getShapeBounds(shapes[0]);
  const firstShape = shapes[0];
  if (firstShape.type === "text" && ctx) {
     const lines = firstShape.content.split("\n");
     ctx.font = `${firstShape.fontSize || 20}px ${firstShape.fontFamily || "sans-serif"}`;
     bounds.width = Math.max(...lines.map(l => ctx.measureText(l).width));
  }

  for (let i = 1; i < shapes.length; i++) {
    const b = getShapeBounds(shapes[i]);
    const shape = shapes[i];
    if (shape.type === "text" && ctx) {
       const lines = shape.content.split("\n");
       ctx.font = `${shape.fontSize || 20}px ${shape.fontFamily || "sans-serif"}`;
       b.width = Math.max(...lines.map(l => ctx.measureText(l).width));
    }
    const minX = Math.min(bounds.x, b.x);
    const minY = Math.min(bounds.y, b.y);
    const maxX = Math.max(bounds.x + bounds.width, b.x + b.width);
    const maxY = Math.max(bounds.y + bounds.height, b.y + b.height);
    bounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  return bounds;
}

export function getHandlePositions(bounds: {
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

export function hitTestHandle(
  mouseX: number,
  mouseY: number,
  bounds: { x: number; y: number; width: number; height: number },
  scale: number
): Handle | null {
  const handles = getHandlePositions(bounds);
  const tolerance = HANDLE_SIZE / scale + 4 / scale;
  for (const [key, pos] of Object.entries(handles)) {
    const dx = mouseX - pos.x;
    const dy = mouseY - pos.y;
    if (dx * dx + dy * dy < tolerance * tolerance) {
      return key as Handle;
    }
  }
  return null;
}

export function updateShapeFromBounds(
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
      const oldBounds = getShapeBounds(shape);
      const scaleX = width / (oldBounds.width || 100);
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
      const oldBounds = getShapeBounds(shape);
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
      const oldBounds = getShapeBounds(shape);
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

export function pointToSegmentDist(
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

export function hitTest(
  shape: Shape,
  x: number,
  y: number,
  tolerance: number,
  ctx?: CanvasRenderingContext2D
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
        pointToSegmentDist(
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
      let maxWidth = 100;
      if (ctx) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        const lines = shape.content.split("\n");
        maxWidth = Math.max(
          ...lines.map((l) => ctx.measureText(l).width),
        );
      }
      const totalHeight = shape.content.split("\n").length * fontSize * 1.2;
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
