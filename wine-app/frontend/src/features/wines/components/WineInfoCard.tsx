import { Paper, Typography } from "@mui/material";

import type { Wine } from "../types/wine";


type WineInfoCardProps = {
  wine: Wine;
};


function Row({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-app-border py-2 last:border-b-0">
      <span className="text-sm text-app-text-secondary">{label}</span>
      <span className="text-sm font-medium text-app-text">
        {value ?? "-"}
      </span>
    </div>
  );
}


export function WineInfoCard({ wine }: WineInfoCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        基本情報
      </Typography>

      <Row label="原番号" value={wine.original_no} />
      <Row label="発注日" value={wine.order_date} />
      <Row label="カナ" value={wine.name_kana} />
      <Row label="生産国" value={wine.country} />
      <Row label="生産者" value={wine.producer} />
      <Row label="品種" value={wine.grape_variety} />
      <Row label="ヴィンテージ" value={wine.vintage} />
      <Row label="サイズ" value={wine.size} />
      <Row label="管理番号" value={wine.management_code} />
    </Paper>
  );
}
