export type Tool = "selection" | "cursor" | "pencil" | "rect" | "circle" | "diamond" | "arrow" | "line" | "text" | "image" | "eraser";

export type Theme = "light" | "dark";
export type BaseShape = { id: string };

export type Shape =
  | (BaseShape & {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    })
  | (BaseShape & {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      color: string;
    })
  | (BaseShape & {
      type: "pencil";
      points: { x: number; y: number }[];
      color: string;
    })
  | (BaseShape & {
      type: "diamond";
      centerX: number;
      centerY: number;
      width: number;
      height: number;
      color: string;
    })
  | (BaseShape & {
      type: "arrow";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      color: string;
    })
  | (BaseShape & {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      color: string;
    })
  | (BaseShape & {
      type: "text";
      x: number;
      y: number;
      content: string;
      color: string;
      fontSize: number;
      fontFamily?: string;
      textAlign?: "left" | "center" | "right";
      opacity?: number;
    })
  | (BaseShape & {
      type: "image";
      x: number;
      y: number;
      width: number;
      height: number;
      src: string;
    });

export type HistoryAction = 
  | { type: "add"; shapeId: string; shape: Shape }
  | { type: "erase"; shapes: Shape[] }
  | { type: "modify"; before: Shape[]; after: Shape[] }
  | { type: "reorder"; before: string[]; after: string[] };

export type ViewState = { scale: number; panX: number; panY: number };
export type Handle = "nw" | "ne" | "se" | "sw";
