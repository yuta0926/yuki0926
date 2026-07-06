import { useState } from "react";

import { OpenInFullOutlined } from "@mui/icons-material";
import { Dialog, IconButton, Paper } from "@mui/material";

import { WineImage } from "./WineImage";


type WineImageCardProps = {
  imageUrl: string | null | undefined;
  alt: string;
};


export function WineImageCard({
  imageUrl,
  alt,
}: WineImageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Paper variant="outlined" sx={{ position: "relative", overflow: "hidden" }}>
      <WineImage
        imageUrl={imageUrl}
        alt={alt}
        className="h-56 w-full md:h-64"
      />

      {imageUrl && (
        <IconButton
          aria-label="画像を拡大"
          size="small"
          onClick={() => setIsExpanded(true)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
            },
          }}
        >
          <OpenInFullOutlined fontSize="small" />
        </IconButton>
      )}

      <Dialog
        open={isExpanded}
        onClose={() => setIsExpanded(false)}
        maxWidth="md"
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={alt}
            className="max-h-[80vh] w-full object-contain"
          />
        )}
      </Dialog>
    </Paper>
  );
}
