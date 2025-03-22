//  "use client";

// import { useEffect, useRef, useState } from "react";

// export default function Canvas() {
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const [selectedTool, setSelectedTool] = useState("rectangle"); // Tool: shape or eraser
//     const [color, setColor] = useState("#000000");

//     useEffect(() => {
//         if (canvasRef.current) {
//             const canvas = canvasRef.current;
//             const ctx = canvas.getContext("2d");

//             if (!ctx) {
//                 return;
//             }

//             let isDrawing = false;
//             let startX = 0;
//             let startY = 0;

//             const startDrawing = (e: MouseEvent) => {
//                 isDrawing = true;
//                 const rect = canvas.getBoundingClientRect();
//                 startX = e.clientX - rect.left;
//                 startY = e.clientY - rect.top;

//                 if (selectedTool === "erase") {
//                     erase(e); // Start erasing immediately
//                 }
//             };

//             const stopDrawing = () => {
//                 isDrawing = false;
//                 ctx.beginPath(); // Reset path for freehand or eraser
//             };

//             const draw = (e: MouseEvent) => {
//                 if (!isDrawing || selectedTool === "erase") return;

//                 const rect = canvas.getBoundingClientRect();
//                 const currentX = e.clientX - rect.left;
//                 const currentY = e.clientY - rect.top;

//                 if (selectedTool === "rectangle") {
//                     const width = currentX - startX;
//                     const height = currentY - startY;
//                     ctx.clearRect(0, 0, canvas.width, canvas.height);
//                     ctx.drawImage(canvas, 0, 0); // Retain previous drawings
//                     ctx.strokeStyle = color;
//                     ctx.lineWidth = 2;
//                     ctx.strokeRect(startX, startY, width, height);
//                 } 
// 
// 
//                  else if (selectedTool === "circle") {
//                     const radius = Math.sqrt(
//                         Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
//                     );
//                     ctx.clearRect(0, 0, canvas.width, canvas.height);
//                     ctx.drawImage(canvas, 0, 0); // Retain previous drawings
//                     ctx.strokeStyle = color;
//                     ctx.lineWidth = 2;
//                     ctx.beginPath();
//                     ctx.arc(startX, startY, radius, 0, Math.PI * 2);
//                     ctx.stroke();
//                 } 
// 
// 
//                  else if (selectedTool === "line") {
//                     ctx.clearRect(0, 0, canvas.width, canvas.height);
//                     ctx.drawImage(canvas, 0, 0); // Retain previous drawings
//                     ctx.strokeStyle = color;
//                     ctx.lineWidth = 2;
//                     ctx.beginPath();
//                     ctx.moveTo(startX, startY);
//                     ctx.lineTo(currentX, currentY);
//                     ctx.stroke();
//                 }
// 
// 
// 
//                  else if (selectedTool === "freehand") {
//                     ctx.strokeStyle = color;
//                     ctx.lineWidth = 2;
//                     ctx.lineTo(currentX, currentY);
//                     ctx.stroke();
//                     ctx.beginPath();
//                     ctx.moveTo(currentX, currentY);
//                 }
//             };

//             const erase = (e: MouseEvent) => {
//                 if (!isDrawing) return;
//                 const rect = canvas.getBoundingClientRect();
//                 const currentX = e.clientX - rect.left;
//                 const currentY = e.clientY - rect.top;

//                 ctx.clearRect(currentX - 10, currentY - 10, 20, 20); // Erase with a square brush
//             };

//             canvas.addEventListener("mousedown", startDrawing);
//             canvas.addEventListener("mouseup", stopDrawing);
//             canvas.addEventListener("mousemove", (e) => {
//                 if (selectedTool === "erase") {
//                     erase(e);
//                 } else {
//                     draw(e);
//                 }
//             });

//             return () => {
//                 canvas.removeEventListener("mousedown", startDrawing);
//                 canvas.removeEventListener("mouseup", stopDrawing);
//                 canvas.removeEventListener("mousemove", draw);
//                 canvas.removeEventListener("mousemove", erase);
//             };
//         }
//     }, [selectedTool, color]);

//     return (
//         <div>
//             <div className="controls" style={{ marginBottom: "10px" }}>
//                 <label>
//                     Tool:
//                     <select
//                         value={selectedTool}
//                         onChange={(e) => setSelectedTool(e.target.value)}
//                         style={{ marginLeft: "5px", marginRight: "15px" }}
//                     >
//                         <option value="rectangle">Rectangle</option>
//                         <option value="circle">Circle</option>
//                         <option value="line">Line</option>
//                         <option value="freehand">Freehand</option>
//                         <option value="erase">Eraser</option>
//                     </select>
//                 </label>
//                 <label>
//                     Color:
//                     <input
//                         type="color"
//                         value={color}
//                         onChange={(e) => setColor(e.target.value)}
//                         style={{ marginLeft: "5px" }}
//                         disabled={selectedTool === "erase"} // Disable color picker for eraser
//                     />
//                 </label>
//             </div>
//             <canvas
//                 ref={canvasRef}
//                 width={500}
//                 height={500}
//                 style={{ border: "1px solid black", cursor: "crosshair" }}
//             ></canvas>
//         </div>
//     );
// }





 

 
import RoomCanvas from "../../components/RoomCanvas"; 


export default async function CanvasPage({params}:{
    params:{
        roomId:string
    }
}){
    const roomId= (await params).roomId;
    console.log(roomId);

    return <RoomCanvas roomId= {roomId}></RoomCanvas>
}