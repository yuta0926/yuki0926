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

  if (value === "ナチュール") {
    return {
      text: "#456148",
      background: "#EDF2E9",
      border: "#D5DFD0",
    };
  }

  return {
    text: "#62645E",
    background: "#F1F1EC",
    border: "#E0E0D8",
  };
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