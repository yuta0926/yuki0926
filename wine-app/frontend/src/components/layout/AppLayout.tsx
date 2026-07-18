import Add from "@mui/icons-material/Add";
import NotificationsNone from "@mui/icons-material/NotificationsNone";
import SwapHorizOutlined from "@mui/icons-material/SwapHorizOutlined";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import WineBarOutlined from "@mui/icons-material/WineBarOutlined";

import LogoutOutlined from "@mui/icons-material/LogoutOutlined";

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Toolbar,
  Typography,
} from "@mui/material";

import { useState, type MouseEvent } from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router";

import { useAuth } from "../../features/auth/context/AuthContext";
import {
  designTokens,
} from "../../theme/theme";

function HelpOutlineIcon() {
  return (
    <SvgIcon>
      <path d="M11 18h2v-2h-2v2Zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4Z" />
    </SvgIcon>
  );
}

const navigationItems = [
  {
    label: "ワイン一覧",
    icon: <WineBarOutlined />,
    path: "/admin/wines",
  },
  {
    label: "入出庫履歴",
    icon: <SwapHorizOutlined />,
    path: "/admin/history",
  },
];


export function AppLayout() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();

  const [
    userMenuAnchor,
    setUserMenuAnchor,
  ] = useState<HTMLElement | null>(null);

  async function handleLogout() {
    setUserMenuAnchor(null);
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor:
          "background.default",
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) =>
            theme.zIndex.drawer + 1,

          height:
            designTokens.layout
              .headerHeight,

          justifyContent: "center",

          color: "text.primary",
          backgroundColor:
            "background.paper",

          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar
          sx={{
            minHeight:
              `${designTokens.layout.headerHeight}px !important`,

            px: {
              xs: 2,
              md: 4,
            },
          }}
        >
          <div className="flex items-center gap-3">
            <WineBarOutlined
              sx={{
                color: "primary.main",
                fontSize: 34,
              }}
            />

            <Typography
              component="span"
              sx={{
                color: "primary.main",
                fontFamily:
                  '"Shippori Mincho", "Yu Mincho", serif',

                fontSize: {
                  xs: 21,
                  md: 27,
                },

                fontWeight: 600,
              }}
            >
              Wine Stocker
            </Typography>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() =>
                navigate("/admin/wines/new")
              }
              sx={{
                display: {
                  xs: "none",
                  sm: "inline-flex",
                },
              }}
            >
              新規登録
            </Button>

            <IconButton
              aria-label="通知"
              color="inherit"
            >
              <NotificationsNone />
            </IconButton>

            <IconButton
              aria-label="ヘルプ"
              color="inherit"
            >
              <HelpOutlineIcon />
            </IconButton>

            <IconButton
              aria-label="アカウントメニュー"
              onClick={(
                event: MouseEvent<HTMLElement>,
              ) =>
                setUserMenuAnchor(
                  event.currentTarget,
                )
              }
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "primary.main",
                  fontSize: 13,
                }}
              >
                WS
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() =>
                setUserMenuAnchor(null)
              }
            >
              {session?.user.email && (
                <MenuItem
                  disabled
                  sx={{
                    opacity: "1 !important",
                    fontSize: 13,
                    color: "text.secondary",
                  }}
                >
                  {session.user.email}
                </MenuItem>
              )}

              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutOutlined fontSize="small" />
                </ListItemIcon>
                ログアウト
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",
            lg: "block",
          },

          width:
            designTokens.layout
              .sidebarWidth,

          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width:
              designTokens.layout
                .sidebarWidth,

            top:
              designTokens.layout
                .headerHeight,

            height: `calc(100% - ${designTokens.layout.headerHeight}px)`,

            backgroundColor:
              "background.paper",

            borderRight: 1,
            borderColor: "divider",
          },
        }}
      >
        <div className="flex h-full flex-col py-6">
          <List disablePadding>
            {navigationItems.map(
              (item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                >
                  {({
                    isActive,
                  }) => (
                    <ListItemButton
                      selected={isActive}
                      sx={{
                        minHeight: 58,
                        mx: 1,
                        mb: 0.5,
                        px: 2.5,
                        borderRadius: 1,

                        borderLeft:
                          "3px solid transparent",

                        "&.Mui-selected": {
                          color:
                            "primary.main",

                          backgroundColor:
                            "primary.light",

                          borderLeftColor:
                            "primary.main",

                          "&:hover": {
                            backgroundColor:
                              "primary.light",
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: "inherit",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>

                      <ListItemText
                        primary={item.label}
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: 14,
                              fontWeight: isActive ? 600 : 400,
                            },
                          },
                        }}
                      />
                    </ListItemButton>
                  )}
                </NavLink>
              ),
            )}
          </List>

          <div className="mt-auto px-3">
            <Divider sx={{ mb: 2 }} />

            <Button
              fullWidth
              variant="outlined"
              startIcon={
                <UploadFileOutlined />
              }
              onClick={() =>
                navigate("/admin/wines/import")
              }
              sx={{
                color: "text.secondary",
              }}
            >
              インポート / エクスポート
            </Button>
          </div>
        </div>
      </Drawer>

      <Box
        component="main"
        sx={{
          minHeight: "100vh",

          pt: `${designTokens.layout.headerHeight}px`,

          ml: {
            xs: 0,
            lg: `${designTokens.layout.sidebarWidth}px`,
          },
        }}
      >
        <div className="mx-auto w-full px-4 py-8 md:px-8">
          <Outlet />
        </div>
      </Box>
    </Box>
  );
}