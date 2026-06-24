import { Link, Outlet } from "react-router";

export function AppLayout() {
  return (
    <div>
      <header>
        <Link to="/wines">
          Wine Stocker
        </Link>

        <nav>
          <Link to="/wines">
            ワイン一覧
          </Link>

          {" | "}

          <Link to="/wines/new">
            新規登録
          </Link>
        </nav>
      </header>

      <Outlet />
    </div>
  );
}