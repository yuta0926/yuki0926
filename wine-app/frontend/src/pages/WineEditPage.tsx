import { useParams } from "react-router";

export function WineEditPage() {
  const { wineId } = useParams();

  return (
    <main>
      <h1>ワイン編集</h1>
      <p>ワインID: {wineId}</p>
    </main>
  );
}