import { ArrowBackOutlined } from "@mui/icons-material";
import { Chip, Paper, Typography } from "@mui/material";
import { Link, useParams } from "react-router";

import { WineBadge } from "../components/common/WineBadge";
import { WineImageCard } from "../components/common/WineImageCard";

import { usePublicWine } from "../features/wines/hooks/usePublicWines";
import { formatPrice } from "../features/wines/utils/formatPrice";
import { designTokens } from "../theme/theme";


function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="flex items-center justify-between border-b border-app-border py-2.5 last:border-b-0">
      <span className="text-sm text-app-text-secondary">{label}</span>
      <span className="text-sm font-medium text-app-text">
        {value ?? "-"}
      </span>
    </div>
  );
}


export function CustomerWineDetailPage() {
  const { wineId } = useParams();
  const numericWineId = Number(wineId);

  const { data: wine, error, isPending, isError } =
    usePublicWine(numericWineId);

  if (isPending) {
    return (
      <div className="rounded-xl border border-app-border bg-app-surface px-6 py-16 text-center text-app-text-secondary">
        ワイン情報を読み込んでいます...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-red-800"
      >
        <p className="font-semibold">ワイン情報の取得に失敗しました。</p>

        <p className="mt-2 text-sm">
          {error instanceof Error ? error.message : "不明なエラーです。"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/wines"
        className="flex w-fit items-center gap-1 text-sm text-app-text-secondary transition-colors hover:text-app-primary"
      >
        <ArrowBackOutlined fontSize="small" />
        一覧へ戻る
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-medium tracking-wide text-app-text md:text-4xl">
          {wine.name}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <WineBadge value={wine.wine_type} />
          <WineBadge value={wine.style_type} />

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
        </div>
      </div>

      <div
        className={`grid grid-cols-1 gap-6 ${
          wine.image_url ? "md:grid-cols-3" : ""
        }`}
      >
        {wine.image_url && (
          <WineImageCard imageUrl={wine.image_url} alt={wine.name} />
        )}

        <Paper
          variant="outlined"
          sx={{ p: 3 }}
          className={wine.image_url ? "md:col-span-2" : ""}
        >
          <Typography variant="h2" sx={{ mb: 2 }}>
            基本情報
          </Typography>

          <InfoRow label="かな" value={wine.name_kana} />
          <InfoRow label="生産国" value={wine.country} />
          <InfoRow label="生産者" value={wine.producer} />
          <InfoRow label="品種" value={wine.grape_variety} />
          <InfoRow label="Vintage" value={wine.vintage} />
          <InfoRow label="サイズ" value={wine.size} />
          <InfoRow label="価格" value={formatPrice(wine.sale_price)} />
        </Paper>
      </div>
    </div>
  );
}
