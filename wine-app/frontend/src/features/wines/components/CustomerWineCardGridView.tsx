import { Chip, Paper, Typography } from "@mui/material";
import { Link } from "react-router";

import { WineBadge } from "../../../components/common/WineBadge";
import { WineImage } from "../../../components/common/WineImage";
import { designTokens } from "../../../theme/theme";

import { formatPrice } from "../utils/formatPrice";

import type { WineCustomer } from "../types/wine";


type CustomerWineCardGridViewProps = {
  wines: WineCustomer[];
};


export function CustomerWineCardGridView({
  wines,
}: CustomerWineCardGridViewProps) {
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
              <Chip
                label={wine.in_stock ? "在庫あり" : "在庫なし"}
                variant="outlined"
                size="small"
                sx={{
                  color: wine.in_stock
                    ? designTokens.colors.success
                    : designTokens.colors.textMuted,
                  borderColor: wine.in_stock
                    ? designTokens.colors.success
                    : designTokens.colors.border,
                }}
              />

              <span className="font-medium text-app-text">
                {formatPrice(wine.sale_price)}
              </span>
            </div>
          </div>
        </Paper>
      ))}
    </div>
  );
}
