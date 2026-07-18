import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import { RequireAuth } from "../features/auth/components/RequireAuth";
import { AppLayout } from "../components/layout/AppLayout";
import { PublicLayout } from "../components/layout/PublicLayout";
import { CustomerWineDetailPage } from "../pages/CustomerWineDetailPage";
import { CustomerWineListPage } from "../pages/CustomerWineListPage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { WineCreatePage } from "../pages/WineCreatePage";
import { WineDetailPage } from "../pages/WineDetailPage";
import { WineEditPage } from "../pages/WineEditPage";
import { WineImportPage } from "../pages/WineImportPage";
import { WineListPage } from "../pages/WineListPage";

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to="/wines"
            replace
          />
        }
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* 顧客向け(認証不要) */}
      <Route element={<PublicLayout />}>
        <Route
          path="/wines"
          element={<CustomerWineListPage />}
        />

        <Route
          path="/wines/:wineId"
          element={<CustomerWineDetailPage />}
        />
      </Route>

      {/* 管理者向け(認証必須) */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route
          path="/admin"
          element={
            <Navigate
              to="/admin/wines"
              replace
            />
          }
        />

        <Route
          path="/admin/wines"
          element={<WineListPage />}
        />

        <Route
          path="/admin/wines/new"
          element={<WineCreatePage />}
        />

        <Route
          path="/admin/wines/import"
          element={<WineImportPage />}
        />

        <Route
          path="/admin/wines/:wineId"
          element={<WineDetailPage />}
        />

        <Route
          path="/admin/wines/:wineId/edit"
          element={<WineEditPage />}
        />
      </Route>

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}
