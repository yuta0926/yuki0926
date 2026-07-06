import type { ReactNode } from "react";

import { Paper, Typography } from "@mui/material";

import { AiCheckStatusBadge } from "../../../components/common/AiCheckStatusBadge";
import type { Wine } from "../types/wine";


type WineManagementInfoProps = {
  wine: Wine;
};


function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ja-JP");
}


function Row({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
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


export function WineManagementInfo({ wine }: WineManagementInfoProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        管理情報
      </Typography>

      <Row
        label="AIチェック状況"
        value={<AiCheckStatusBadge value={wine.ai_check_status} />}
      />
      <Row label="登録日時" value={formatDateTime(wine.created_at)} />
      <Row label="更新日時" value={formatDateTime(wine.updated_at)} />
    </Paper>
  );
}
