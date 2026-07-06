import { Chip } from "@mui/material";

import {
  designTokens,
} from "../../theme/theme";


type AiCheckStatusBadgeProps = {
  value: string | null;
};


type BadgeColors = {
  text: string;
  background: string;
  border: string;
};


function getStatusColors(
  value: string,
): BadgeColors {
  if (value === "確認済み") {
    return designTokens.aiStatus.confirmed;
  }

  if (value === "要確認") {
    return designTokens.aiStatus.needsReview;
  }

  if (value === "要修正") {
    return designTokens.aiStatus.needsFix;
  }

  return designTokens.aiStatus.unconfirmed;
}


export function AiCheckStatusBadge({
  value,
}: AiCheckStatusBadgeProps) {
  if (!value) {
    return <>-</>;
  }

  const colors = getStatusColors(value);

  return (
    <Chip
      label={value}
      variant="outlined"
      size="small"
      sx={{
        color: colors.text,
        backgroundColor: colors.background,
        borderColor: colors.border,
      }}
    />
  );
}
