import { Button, Paper, Typography } from "@mui/material";

import { designTokens } from "../../../theme/theme";
import type { Wine } from "../types/wine";
import type { MovableTransactionType } from "./WineTransactionDialog";


type WineStockSummaryProps = {
  wine: Wine;
  onAction: (type: MovableTransactionType) => void;
};


export function WineStockSummary({ wine, onAction }: WineStockSummaryProps) {
  const inStock = wine.quantity > 0;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h2" sx={{ mb: 2 }}>
        在庫サマリー
      </Typography>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-app-text-secondary">現在庫数</span>
          <span className="text-2xl font-semibold text-app-text">
            {wine.quantity}
            <span className="ml-1 text-sm font-normal text-app-text-secondary">
              本
            </span>
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-sm text-app-text-secondary">状態</span>
          <span
            className="text-sm font-medium"
            style={{
              color: inStock ? undefined : designTokens.colors.danger,
            }}
          >
            {inStock ? "在庫あり" : "在庫切れ"}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-sm text-app-text-secondary">販売可能数</span>
          <span className="text-sm font-medium text-app-text">
            {wine.available_quantity}本
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-sm text-app-text-secondary">予約数</span>
          <span className="text-sm font-medium text-app-text">
            {wine.reserved_quantity}本
          </span>
        </div>

        <div className="flex items-baseline justify-between border-t border-app-border pt-3">
          <span className="text-sm text-app-text-secondary">保管場所</span>
          <span className="text-sm font-medium text-app-text">
            {wine.location ?? "-"}
          </span>
        </div>

        <div className="flex gap-2 border-t border-app-border pt-3">
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => onAction("in")}
          >
            入庫
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            disabled={wine.quantity === 0}
            onClick={() => onAction("out")}
          >
            出庫
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            disabled={wine.quantity === 0}
            onClick={() => onAction("move")}
          >
            移動
          </Button>
        </div>
      </div>
    </Paper>
  );
}
