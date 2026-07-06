import { Paper, Typography } from "@mui/material";
import { Link } from "react-router";

import { WineBadge } from "../../../components/common/WineBadge";
import { WineImage } from "../../../components/common/WineImage";

import { formatPrice } from "../utils/formatPrice";

import type { Wine } from "../types/wine";


type WineCardGridViewProps = {
  wines: Wine[];
};


export function WineCardGridView({
  wines,
}: WineCardGridViewProps) {
  if (wines.length === 0) {
    return (
      <div className="rounded-xl border border-app-border bg-app-surface px-6 py-16 text-center text-app-text-secondary">
        条件に一致するワインがありません。
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {wines.map((wine) => (
        <Paper
          key={wine.id}
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <WineImage
            imageUrl={wine.image_url}
            alt={wine.name}
            className="aspect-[4/3] w-full"
          />

          <div className="flex flex-col gap-2 p-4">
            <Link
              to={`/wines/${wine.id}`}
              className="font-medium text-app-text transition-colors hover:text-app-primary hover:underline"
            >
              {wine.name}
            </Link>

            <div className="flex flex-wrap gap-1.5">
              <WineBadge value={wine.wine_type} />
              <WineBadge value={wine.style_type} />
            </div>

            <Typography
              variant="body2"
              className="text-app-text-secondary"
            >
              {wine.producer ?? "-"} / {wine.country ?? "-"}
              {wine.vintage ? ` / ${wine.vintage}` : ""}
            </Typography>

            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-app-text-secondary">
                {wine.location ?? "-"}
              </span>

              <span className="font-medium text-app-text">
                {formatPrice(wine.sale_price)}
              </span>
            </div>

            <div className="text-right text-xs text-app-text-secondary">
              在庫 {wine.quantity}本
            </div>
          </div>
        </Paper>
      ))}
    </div>
  );
}
