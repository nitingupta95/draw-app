import { Tool } from "../components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
    | { type: "rect"; x: number; y: number; width: number; height: number }
    | { type: "circle"; centerX: number; centerY: number; radius: number }
    | { type: "pencil"; points: { x: number; y: number }[] }
    | { type: "diamond"; centerX: number; centerY: number; width: number; height: number }
    | { type: "arrow"; startX: number; startY: number; endX: number; endY: number }
    | { type: "text"; x: number; y: number; content: string }
    | { type: "image"; x: number; y: number; img: HTMLImageElement };

export class Game {
    undo() {
        throw new Error("Method not implemented.");
    }
    redo() {
        throw new Error("Method not implemented.");
    }
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private isDrawing: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "pencil";
    private pencilPoints: { x: number; y: number }[] = [];
    private textInput?: HTMLInputElement;
    private undoStack: ImageData[] = [];
    private redoStack: ImageData[] = [];

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.isDrawing = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }
        };
    }
    

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.existingShapes.forEach((shape) => {
            this.ctx.strokeStyle = "white";

            switch (shape.type) {
                case "rect":
                    this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                    break;
                case "circle":
                    this.ctx.beginPath();
                    this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.closePath();
                    break;
                case "pencil":
                    this.ctx.beginPath();
                    shape.points.forEach((point, index) => {
                        if (index === 0) {
                            this.ctx.moveTo(point.x, point.y);
                        } else {
                            this.ctx.lineTo(point.x, point.y);
                        }
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
                    this.ctx.beginPath();
                    this.ctx.moveTo(shape.startX, shape.startY);
                    this.ctx.lineTo(shape.endX, shape.endY);
                    this.ctx.stroke();
                    break;
                case "text":
                    this.ctx.fillStyle = "white";
                    this.ctx.fillText(shape.content, shape.x, shape.y);
                    break;
                case "image":
                    this.ctx.drawImage(shape.img, shape.x, shape.y);
                    break;
            }
        });
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.isDrawing = true;
        this.startX = e.clientX - this.canvas.getBoundingClientRect().left;
        this.startY = e.clientY - this.canvas.getBoundingClientRect().top;
        
        if (this.selectedTool === "pencil") {
            this.pencilPoints = [{ x: this.startX, y: this.startY }];
        }
        else if (this.selectedTool === "eraser") {
            this.ctx.globalCompositeOperation = "destination-out"; // Allows erasing
            this.ctx.lineWidth = 20;  
            this.ctx.lineCap = "round"; // Smooth erasing
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
        }
    };

    mouseMoveHandler = (e: MouseEvent) => {
        if (!this.isDrawing) return;

        const x = e.clientX - this.canvas.getBoundingClientRect().left;
        const y = e.clientY - this.canvas.getBoundingClientRect().top;

        if (this.selectedTool === "pencil") {
            this.pencilPoints.push({ x, y });
        } else if (this.selectedTool === "eraser") {
            this.ctx.fillStyle = "black"; // Set the fill color to black
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2); // Create a circular eraser effect
            this.ctx.fill();
        }
    
        // Always redraw existing shapes
this.clearCanvas();

// Now draw the preview shape on top
this.ctx.save();
this.ctx.strokeStyle = "white";
this.ctx.lineWidth = 2;

if (this.selectedTool === "pencil") {
    this.pencilPoints.push({ x, y });

} else if (this.selectedTool === "rect") {
    this.ctx.strokeRect(this.startX, this.startY, x - this.startX, y - this.startY);

} else if (this.selectedTool === "circle") {
    const dx = x - this.startX;
    const dy = y - this.startY;
    const radius = Math.sqrt(dx * dx + dy * dy) / 2;

    this.ctx.beginPath();
    this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
    this.ctx.stroke();
}

this.ctx.restore();

    };

    mouseUpHandler = (e: MouseEvent) => {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        const endX = e.clientX - this.canvas.getBoundingClientRect().left;
        const endY = e.clientY - this.canvas.getBoundingClientRect().top;
        let shape: Shape | null = null;

        switch (this.selectedTool) {
            case "rect":
                shape = { type: "rect", x: this.startX, y: this.startY, width: endX - this.startX, height: endY - this.startY };
                break;
            case "circle":
                const dx = endX - this.startX;
                const dy = endY - this.startY;
                shape = { type: "circle", centerX: this.startX, centerY: this.startY, radius: Math.sqrt(dx * dx + dy * dy) / 2 };
                break;
            case "diamond":
                shape = { type: "diamond", centerX: this.startX, centerY: this.startY, width: Math.abs(endX - this.startX), height: Math.abs(endY - this.startY) };
                break;
            case "arrow":
                shape = { type: "arrow", startX: this.startX, startY: this.startY, endX, endY };
                break;
            case "pencil":
                shape = { type: "pencil", points: this.pencilPoints };
                break;
            case "eraser":
                this.ctx.globalCompositeOperation = "source-over"; // Reset composite mode
                break;
            
        }

        if (!shape) return;
        this.existingShapes.push(shape);
        this.clearCanvas();


        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId
        }));
    };

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
}
