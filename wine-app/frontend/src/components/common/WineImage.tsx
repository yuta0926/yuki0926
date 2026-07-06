import { useState } from "react";

import { ImageNotSupportedOutlined } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

import { designTokens } from "../../theme/theme";


type WineImageProps = {
  imageUrl: string | null | undefined;
  alt: string;
  className?: string;
};


export function WineImage({
  imageUrl,
  alt,
  className,
}: WineImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    return (
      <Box
        className={className}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          backgroundColor: designTokens.colors.surfaceMuted,
          color: designTokens.colors.textMuted,
        }}
      >
        <ImageNotSupportedOutlined fontSize="small" />

        <Typography
          variant="body2"
          sx={{ color: designTokens.colors.textMuted }}
        >
          画像未登録
        </Typography>
      </Box>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`object-cover ${className ?? ""}`}
    />
  );
}
