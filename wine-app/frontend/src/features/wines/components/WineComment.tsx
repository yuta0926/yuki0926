import { Paper, Typography } from "@mui/material";

import { designTokens } from "../../../theme/theme";
import type { Wine } from "../types/wine";


type WineCommentProps = {
  wine: Wine;
};


export function WineComment({ wine }: WineCommentProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h2" sx={{ mb: 2 }}>
        コメント・メモ
      </Typography>

      {wine.comment ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-app-text">
          {wine.comment}
        </p>
      ) : (
        <p
          className="text-sm"
          style={{ color: designTokens.colors.textMuted }}
        >
          コメントは登録されていません。
        </p>
      )}
    </Paper>
  );
}
