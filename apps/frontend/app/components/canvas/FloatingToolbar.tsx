import { motion } from "framer-motion";
import { MousePointer2, Hand, Pencil, Square, Circle, Diamond, ArrowRight, Type, Eraser, Undo2, Redo2 } from "lucide-react";
import { Game, Tool } from "../../draw/Game";

export function FloatingToolbar({ selectedTool, setSelectedTool, canEdit, game }: { selectedTool: Tool, setSelectedTool: (s: Tool) => void, canEdit: boolean, game?: Game }) {
  const tools = [
    { id: "selection", icon: <MousePointer2 size={18} /> },
    { id: "cursor", icon: <Hand size={18} /> },
    { id: "pencil", icon: <Pencil size={18} /> },
    { id: "rect", icon: <Square size={18} /> },
    { id: "circle", icon: <Circle size={18} /> },
    { id: "diamond", icon: <Diamond size={18} /> },
    { id: "arrow", icon: <ArrowRight size={18} /> },
    { id: "text", icon: <Type size={18} /> },
    { id: "eraser", icon: <Eraser size={18} /> },
  ] as const;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-24 sm:top-28 left-1/2 -translate-x-1/2 z-40 flex flex-wrap justify-center items-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-2 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 w-fit max-w-[90vw] sm:max-w-max"
    >
      {tools.map((tool) => {
        const isDrawingTool = tool.id !== "selection" && tool.id !== "cursor";
        const disabled = !canEdit && isDrawingTool;
        return (
          <button
            key={tool.id}
            disabled={disabled}
            onClick={() => setSelectedTool(tool.id as Tool)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
              selectedTool === tool.id 
                ? "bg-indigo-100 text-primary shadow-sm" 
                : disabled 
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {tool.icon}
          </button>
        );
      })}

      <div className="w-px h-6 bg-gray-200 mx-0 sm:mx-1 hidden sm:block" />
      
      <button onClick={() => game?.undo()} disabled={!canEdit} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${!canEdit ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}>
        <Undo2 size={18} />
      </button>
      <button onClick={() => game?.redo()} disabled={!canEdit} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${!canEdit ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}>
        <Redo2 size={18} />
      </button>
    </motion.div>
  );
}
