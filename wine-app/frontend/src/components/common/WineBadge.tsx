import { Chip } from "@mui/material";

import {
  designTokens,
} from "../../theme/theme";


type WineBadgeProps = {
  value: string | null;
};


type BadgeColors = {
  text: string;
  background: string;
  border: string;
};


function getWineColors(
  value: string,
): BadgeColors {
  if (value.includes("赤")) {
    return designTokens.wine.red;
  }

  if (value.includes("白")) {
    return designTokens.wine.white;
  }

  if (value.includes("オレンジ")) {
    return designTokens.wine.orange;
  }

  if (value.includes("ロゼ")) {
    return designTokens.wine.rose;
  }

  if (value.includes("スパークリング")) {
    return designTokens.wine.sparkling;
  }

  if (value === "ナチュール") {
    return designTokens.style.natural;
  }

  return designTokens.style.classic;
}


export function WineBadge({
  value,
}: WineBadgeProps) {
  if (!value) {
    return <>-</>;
  }

  const colors = getWineColors(value);

  return (
    <Chip
      label={value}
      variant="outlined"
      size="small"
      sx={{
        color: colors.text,
        backgroundColor:
          colors.background,
        borderColor: colors.border,
      }}
    />
  );
}