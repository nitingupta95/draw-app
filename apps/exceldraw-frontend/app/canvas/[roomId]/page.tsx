import RoomCanvas from "../../components/RoomCanvas";

export default async function CanvasPage(props: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await props.params;

  return <RoomCanvas roomId={roomId} />;
}
