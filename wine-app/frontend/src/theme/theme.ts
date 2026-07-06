import {
  alpha,
  createTheme,
} from "@mui/material/styles";


export const designTokens = {
  colors: {
    background: "#F8F7F2",
    surface: "#FFFEFA",
    surfaceMuted: "#F4F2EC",

    primary: "#183F2D",
    primaryHover: "#123322",
    primarySoft: "#EDF2ED",

    textPrimary: "#22241F",
    textSecondary: "#62655D",
    textMuted: "#8A8C84",

    border: "#E4E1D8",
    borderStrong: "#D4D0C5",

    success: "#3F6B4F",
    warning: "#A56B2A",
    danger: "#A84848",
  },

  wine: {
    red: {
      text: "#934444",
      background: "#FBEFEF",
      border: "#E8CACA",
    },

    white: {
      text: "#526B48",
      background: "#F0F4EC",
      border: "#CCD8C5",
    },

    orange: {
      text: "#9A682F",
      background: "#FBF1E4",
      border: "#E8CFAE",
    },

    rose: {
      text: "#A15C68",
      background: "#F9EDEF",
      border: "#E8CBD1",
    },

    sparkling: {
      text: "#7A6A35",
      background: "#F6F0DA",
      border: "#DED19A",
    },
  },

  style: {
    classic: {
      text: "#62645E",
      background: "#F1F1EC",
      border: "#E0E0D8",
    },

    natural: {
      text: "#456148",
      background: "#EDF2E9",
      border: "#D5DFD0",
    },
  },

  aiStatus: {
    confirmed: {
      text: "#3F6B4F",
      background: "#EAF2EC",
      border: "#C9DBCD",
    },

    unconfirmed: {
      text: "#62655D",
      background: "#F1F1EC",
      border: "#E0E0D8",
    },

    needsReview: {
      text: "#9A682F",
      background: "#FBF1E4",
      border: "#E8CFAE",
    },

    needsFix: {
      text: "#934444",
      background: "#FBEFEF",
      border: "#E8CACA",
    },
  },

  transactionType: {
    in: {
      text: "#526B48",
      background: "#F0F4EC",
      border: "#CCD8C5",
    },

    out: {
      text: "#934444",
      background: "#FBEFEF",
      border: "#E8CACA",
    },

    move: {
      text: "#3E6E6B",
      background: "#EAF3F2",
      border: "#C6DEDC",
    },

    adjust: {
      text: "#7A6A35",
      background: "#F6F0DA",
      border: "#DED19A",
    },
  },

  layout: {
    headerHeight: 88,
    sidebarWidth: 228,
  },

  radius: {
    small: 6,
    medium: 10,
    large: 14,
  },
} as const;


export const appTheme = createTheme({
  cssVariables: true,

  palette: {
    mode: "light",

    primary: {
      main: designTokens.colors.primary,
      dark: designTokens.colors.primaryHover,
      light: designTokens.colors.primarySoft,
      contrastText: "#FFFFFF",
    },

    background: {
      default: designTokens.colors.background,
      paper: designTokens.colors.surface,
    },

    text: {
      primary: designTokens.colors.textPrimary,
      secondary: designTokens.colors.textSecondary,
    },

    divider: designTokens.colors.border,

    success: {
      main: designTokens.colors.success,
    },

    warning: {
      main: designTokens.colors.warning,
    },

    error: {
      main: designTokens.colors.danger,
    },
  },

  typography: {
    fontFamily: [
      '"Noto Sans JP"',
      '"Hiragino Kaku Gothic ProN"',
      '"Yu Gothic"',
      "sans-serif",
    ].join(","),

    h1: {
      fontFamily: [
        '"Shippori Mincho"',
        '"Yu Mincho"',
        "serif",
      ].join(","),

      fontSize: "2.25rem",
      fontWeight: 500,
      lineHeight: 1.35,
      letterSpacing: "0.04em",
    },

    h2: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },

    body1: {
      fontSize: "0.875rem",
    },

    body2: {
      fontSize: "0.8125rem",
    },

    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.02em",
    },
  },

  shape: {
    borderRadius: designTokens.radius.medium,
  },

  shadows: [
    "none",
    "0 2px 8px rgb(38 44 38 / 4%)",
    "0 4px 16px rgb(38 44 38 / 5%)",
    "0 8px 24px rgb(38 44 38 / 8%)",
    ...Array(21).fill(
      "0 8px 24px rgb(38 44 38 / 8%)",
    ),
  ] as typeof createTheme extends (
    ...args: never[]
  ) => infer T
    ? T extends { shadows: infer S }
      ? S
      : never
    : never,

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor:
            designTokens.colors.background,
        },

        body: {
          margin: 0,
          backgroundColor:
            designTokens.colors.background,
          color:
            designTokens.colors.textPrimary,
          WebkitFontSmoothing: "antialiased",
        },

        "*": {
          boxSizing: "border-box",
        },
      },
    },

MuiButton: {
  defaultProps: {
    disableElevation: true,
  },

  styleOverrides: {
    root: {
      minHeight: 44,
      borderRadius:
        designTokens.radius.medium,
      paddingInline: 20,

      "&.MuiButton-containedPrimary:hover": {
        backgroundColor:
          designTokens.colors.primaryHover,
      },

      "&.MuiButton-outlined": {
        borderColor:
          designTokens.colors.borderStrong,
      },

      "&.MuiButton-outlined:hover": {
        borderColor:
          designTokens.colors.primary,
        backgroundColor:
          designTokens.colors.primarySoft,
      },
    },
  },
},

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },

        rounded: {
          borderRadius:
            designTokens.radius.large,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius:
            designTokens.radius.medium,
          backgroundColor:
            designTokens.colors.surface,

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor:
              designTokens.colors.borderStrong,
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor:
              designTokens.colors.textMuted,
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor:
              designTokens.colors.primary,
            borderWidth: 1,
          },

          "&.Mui-focused": {
            boxShadow: `0 0 0 3px ${alpha(
              designTokens.colors.primary,
              0.1,
            )}`,
          },
        },
      },
    },

    MuiFormLabel: {
      styleOverrides: {
        root: {
          color:
            designTokens.colors.textSecondary,
          fontSize: "0.75rem",
          fontWeight: 500,
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          border: `1px solid ${designTokens.colors.border}`,
          borderRadius:
            designTokens.radius.large,
          boxShadow:
            "0 4px 16px rgb(38 44 38 / 5%)",
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#FAF9F5",
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor:
            designTokens.colors.border,
        },

        head: {
          height: 54,
          color:
            designTokens.colors.textPrimary,
          fontSize: "0.75rem",
          fontWeight: 600,
          whiteSpace: "nowrap",
        },

        body: {
          height: 56,
          color:
            designTokens.colors.textPrimary,
          fontSize: "0.8125rem",
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#FAFBF7",
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          height: 26,
          borderRadius:
            designTokens.radius.small,
          fontSize: "0.75rem",
          fontWeight: 500,
        },
      },
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderColor:
            designTokens.colors.border,
        },
      },
    },
  },
});