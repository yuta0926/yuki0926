import { Paper, Typography } from "@mui/material";

import { formatPrice } from "../utils/formatPrice";

import type { Wine } from "../types/wine";


type WinePriceInfoProps = {
  wine: Wine;
};


function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-app-border py-2 last:border-b-0">
      <span className="text-sm text-app-text-secondary">{label}</span>
      <span className="text-sm font-medium text-app-text">{value}</span>
    </div>
  );
}


export function WinePriceInfo({ wine }: WinePriceInfoProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        価格情報
      </Typography>

      <Row label="小売価格" value={formatPrice(wine.retail_price)} />
      <Row label="仕入価格" value={formatPrice(wine.purchase_price)} />
      <Row label="売価" value={formatPrice(wine.sale_price)} />
    </Paper>
  );
}
