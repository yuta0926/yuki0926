import {
    Navigate,
    Route,
    Routes,
  } from "react-router";
  
  import { AppLayout } from "../components/layout/AppLayout";
  import { NotFoundPage } from "../pages/NotFoundPage";
  import { WineCreatePage } from "../pages/WineCreatePage";
  import { WineDetailPage } from "../pages/WineDetailPage";
  import { WineEditPage } from "../pages/WineEditPage";
  import { WineListPage } from "../pages/WineListPage";
  
  export function AppRouter() {
    return (
      <Routes>
        <Route element={<AppLayout />}>
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
            path="/wines"
            element={<WineListPage />}
          />
  
          <Route
            path="/wines/new"
            element={<WineCreatePage />}
          />
  
          <Route
            path="/wines/:wineId"
            element={<WineDetailPage />}
          />
  
          <Route
            path="/wines/:wineId/edit"
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