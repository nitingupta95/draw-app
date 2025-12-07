export {};

declare global {
  interface Window {
    selectedTool: "rect" | "circle" | "pencil" | "diamond" | "arrow" | "text" | "image" | "eraser";
  }
}
