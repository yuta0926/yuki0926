import { Link } from "react-router";

import type {
  Wine,
} from "../types/wine";


type WineTableProps = {
  wines: Wine[];
};


function formatPrice(
  value: number | null,
): string {
  if (value === null) {
    return "-";
  }

  return `${value.toLocaleString()}円`;
}


export function WineTable({
  wines,
}: WineTableProps) {
  if (wines.length === 0) {
    return (
      <p>
        条件に一致するワインがありません。
      </p>
    );
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ワイン名</th>
            <th>種類</th>
            <th>スタイル</th>
            <th>国</th>
            <th>生産者</th>
            <th>品種</th>
            <th>Vintage</th>
            <th>売価</th>
            <th>在庫</th>
            <th>場所</th>
          </tr>
        </thead>

        <tbody>
          {wines.map((wine) => (
            <tr key={wine.id}>
              <td>
                <Link
                  to={`/wines/${wine.id}`}
                >
                  {wine.name}
                </Link>
              </td>

              <td>
                {wine.wine_type ?? "-"}
              </td>

              <td>
                {wine.style_type ?? "-"}
              </td>

              <td>
                {wine.country ?? "-"}
              </td>

              <td>
                {wine.producer ?? "-"}
              </td>

              <td>
                {wine.grape_variety ?? "-"}
              </td>

              <td>
                {wine.vintage ?? "-"}
              </td>

              <td>
                {formatPrice(
                  wine.sale_price,
                )}
              </td>

              <td>{wine.quantity}</td>

              <td>
                {wine.location ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}