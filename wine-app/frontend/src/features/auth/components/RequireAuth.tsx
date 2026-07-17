import type { PropsWithChildren } from "react";

import { Navigate, useLocation } from "react-router";

import { useAuth } from "../context/AuthContext";


export function RequireAuth({ children }: PropsWithChildren) {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-background text-app-text-secondary">
        読み込んでいます...
      </div>
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
}
