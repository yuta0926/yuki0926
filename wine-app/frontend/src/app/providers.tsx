import type {
  PropsWithChildren,
} from "react";

import {
  CssBaseline,
} from "@mui/material";

import {
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";

import {
  QueryClientProvider,
} from "@tanstack/react-query";

import { AuthProvider } from "../features/auth/context/AuthContext";
import { queryClient } from "../lib/queryClient";
import { appTheme } from "../theme/theme";


export function AppProviders({
  children,
}: PropsWithChildren) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />

        <QueryClientProvider
          client={queryClient}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}