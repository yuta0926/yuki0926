import {
  GridViewOutlined,
  ViewListOutlined,
} from "@mui/icons-material";

import {
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";


export type WineViewMode = "list" | "card";


type WineViewToggleProps = {
  view: WineViewMode;
  onChange: (view: WineViewMode) => void;
};


export function WineViewToggle({
  view,
  onChange,
}: WineViewToggleProps) {
  return (
    <ToggleButtonGroup
      value={view}
      exclusive
      size="small"
      aria-label="表示切替"
      onChange={(_event, nextView: WineViewMode | null) => {
        if (nextView) {
          onChange(nextView);
        }
      }}
    >
      <ToggleButton value="list" aria-label="リスト表示">
        <ViewListOutlined
          fontSize="small"
          sx={{ mr: 0.75 }}
        />
        リスト表示
      </ToggleButton>

      <ToggleButton value="card" aria-label="カード表示">
        <GridViewOutlined
          fontSize="small"
          sx={{ mr: 0.75 }}
        />
        カード表示
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
