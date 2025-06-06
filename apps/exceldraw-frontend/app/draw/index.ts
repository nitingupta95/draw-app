import { HTTP_BACKEND } from "@/config";
import axios from "axios";
import { Canvas } from "../components/Canvas";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
    |{
      type:"pencil";
      startX:number;
      startY:number;
      endX:number;
      endY:number;
    };

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error("Canvas context is not available.");
    return;
  }

  let existingShapes: Shape[] = await getExistingShapes(roomId);

  socket.onmessage = (e: any) => {
    try {
      const message = JSON.parse(e.data);
      if (message.type === "chat" && message.message) {
        const parsedShape = JSON.parse(message.message);
        if (parsedShape && parsedShape.shape) {
          existingShapes.push(parsedShape.shape);
          clearCanvas(existingShapes, canvas, ctx);
        }
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  clearCanvas(existingShapes, canvas, ctx);
  let isDrawing = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    startX = e.clientX - canvas.getBoundingClientRect().left;
    startY = e.clientY - canvas.getBoundingClientRect().top;
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!isDrawing) return;
    isDrawing = false;
    const width = e.clientX - canvas.getBoundingClientRect().left - startX;
    const height = e.clientY - canvas.getBoundingClientRect().top - startY;

    const selectedTool= window.selectedTool;
    let shape:Shape|null=null
    if(selectedTool==="rect"){
      shape = {
        type:"rect",
        x: startX,
        y: startY,
        width,
        height,
      };      
    }

    else if (selectedTool==="circle"){
      const radius = Math.abs(Math.max(width, height) / 2);
      shape= {
        type:"circle",
        radius,
        centerX: startX + radius, 
        centerY:startY + radius
      };
  
      
    }
    if(!shape){
      return null
    }
    existingShapes.push(shape);
    
    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId,
      })
    );
    clearCanvas(existingShapes, canvas, ctx);
  });




  canvas.addEventListener("mousemove", (e:any) => {
    if (isDrawing) {
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        clearCanvas(existingShapes, canvas, ctx);
        ctx.strokeStyle = "rgba(255, 255, 255)"
        // @ts-ignore
        const selectedTool = window.selectedTool;
        if(selectedTool === "rect") {
            ctx.strokeRect(startX, startY, width, height);   
        }else if(selectedTool === "circle"){
          const radius = Math.abs(Math.max(width, height) / 2);
          const centerX = startX + radius;
          const centerY = startY + radius;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.closePath();                
        }
    }
  })    

}




        






function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.forEach((shape) => {
    if (!shape || !shape.type) return;

    
    ctx.lineWidth = 2;

    if (shape.type === "rect") {
      ctx.strokeStyle = "rgba(255, 255, 255)";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }
  });
}

async function getExistingShapes(roomId: string): Promise<Shape[]> {
  try {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.messages;

    if (!Array.isArray(messages)) {
      console.warn("Unexpected API response format.");
      return [];
    }

    return messages
      .map((x: { message: string }) => {
        try {
          const messageData = JSON.parse(x.message);
          return messageData.shape || null;
        } catch (error) {
          console.error("Error parsing message:", x.message, error);
          return null;
        }
      })
      .filter((shape) => shape !== null);
  } catch (error: any) {
    console.error("Error fetching shapes:", error);
    return [];
  }
}