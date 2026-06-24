import { useParams } from "react-router";

export function WineDetailPage() {
  const { wineId } = useParams();

  return (
    <main>
      <h1>ワイン詳細</h1>
      <p>ワインID: {wineId}</p>
    </main>
  );
}