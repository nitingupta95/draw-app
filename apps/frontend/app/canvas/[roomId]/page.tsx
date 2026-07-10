import { redirect } from "next/navigation";
import RoomCanvas from "../../components/RoomCanvas";

export default async function CanvasPage(props: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await props.params;
  const decodedRoomId = decodeURIComponent(roomId);

  // If the user pasted the entire "Link\nPasscode: XXX" text into the URL
  if (decodedRoomId.includes(" Passcode:") || decodedRoomId.includes("\nPasscode:")) {
    const cleanRoomId = decodedRoomId.split(/[\s\n]+Passcode:/)[0].trim();
    redirect(`/canvas/${cleanRoomId}`);
  }

  // Fallback for any trailing whitespace or newlines appended accidentally
  const cleanRoomId = decodedRoomId.split(/[\s\n]+/)[0].trim();
  if (cleanRoomId !== decodedRoomId) {
    redirect(`/canvas/${cleanRoomId}`);
  }

  return <RoomCanvas roomId={cleanRoomId} />;
}
