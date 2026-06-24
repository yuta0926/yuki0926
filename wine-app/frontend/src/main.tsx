import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App";
import { AppProviders } from "./app/providers";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("root要素が見つかりません。");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
);