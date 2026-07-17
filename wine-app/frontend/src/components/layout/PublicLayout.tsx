import WineBarOutlined from "@mui/icons-material/WineBarOutlined";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { Link, Outlet } from "react-router";

import { designTokens } from "../../theme/theme";


export function PublicLayout() {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          height: designTokens.layout.headerHeight,
          justifyContent: "center",
          color: "text.primary",
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar
          sx={{
            minHeight: `${designTokens.layout.headerHeight}px !important`,
            px: { xs: 2, md: 4 },
          }}
        >
          <Link to="/wines" className="flex items-center gap-3">
            <WineBarOutlined
              sx={{ color: "primary.main", fontSize: 34 }}
            />

            <Typography
              component="span"
              sx={{
                color: "primary.main",
                fontFamily: '"Shippori Mincho", "Yu Mincho", serif',
                fontSize: { xs: 21, md: 27 },
                fontWeight: 600,
              }}
            >
              Wine Stocker
            </Typography>
          </Link>

          <div className="ml-auto">
            <Link
              to="/login"
              className="text-sm text-app-text-secondary transition-colors hover:text-app-primary"
            >
              スタッフの方はこちら
            </Link>
          </div>
        </Toolbar>
      </AppBar>

      <Box component="main">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
          <Outlet />
        </div>
      </Box>
    </Box>
  );
}
