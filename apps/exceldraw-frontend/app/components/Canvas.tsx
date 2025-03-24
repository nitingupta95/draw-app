import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { 
    ArrowRight, 
    Circle, 
    Diamond, 
    Image, 
    Pencil, 
    RectangleHorizontalIcon, 
    Undo, 
    Redo, 
    Eraser 
} from "lucide-react";
import { Game } from "../draw/Game";

export type Tool = "circle" | "rect" | "pencil" | "diamond" | "arrow" | "text" | "image" | "eraser";

export function Canvas({ roomId, socket }: { socket: WebSocket; roomId: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            const handleUndoRedo = (e: KeyboardEvent) => {
                if (e.ctrlKey && e.key === "z") {
                    g.undo();
                } else if (e.ctrlKey && e.key === "y") {
                    g.redo();
                }
            };

            window.addEventListener("keydown", handleUndoRedo);

            return () => {
                g.destroy();
                window.removeEventListener("keydown", handleUndoRedo);
            };
        }
    }, [canvasRef]);

    return (
        <div style={{ height: "100vh", overflow: "hidden" }}>
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
            <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} game={game} />
        </div>
    );
}

function Topbar({ selectedTool, setSelectedTool, game }: { selectedTool: Tool, setSelectedTool: (s: Tool) => void, game?: Game }) {
    return (
        <div style={{ position: "fixed", top: 10, left: 10 }}>
            <div className="flex gap-2">
                <IconButton onClick={() => setSelectedTool("pencil")} activated={selectedTool === "pencil"} icon={<Pencil />} />
                <IconButton onClick={() => setSelectedTool("rect")} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} />
                <IconButton onClick={() => setSelectedTool("circle")} activated={selectedTool === "circle"} icon={<Circle />} />
                <IconButton onClick={() => setSelectedTool("diamond")} activated={selectedTool === "diamond"} icon={<Diamond />} />
                <IconButton onClick={() => setSelectedTool("arrow")} activated={selectedTool === "arrow"} icon={<ArrowRight />} />
                <IconButton onClick={() => setSelectedTool("image")} activated={selectedTool === "image"} icon={<Image />} />
                <IconButton onClick={() => setSelectedTool("eraser")} activated={selectedTool === "eraser"} icon={<Eraser />} />
            </div>
        </div>
    );
}
