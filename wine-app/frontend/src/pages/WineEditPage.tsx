import { useState } from "react";

import { ArrowBackOutlined } from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router";

import { WineForm } from "../features/wines/components/WineForm";
import { useUpdateWine, useWine } from "../features/wines/hooks/useWines";
import { ApiError } from "../lib/apiClient";

import type { WineCreateInput } from "../features/wines/types/wine";


export function WineEditPage() {
  const { wineId } = useParams();
  const navigate = useNavigate();

  const numericWineId = Number(wineId);

  const {
    data: wine,
    error,
    isPending,
    isError,
  } = useWine(numericWineId);

  const updateWineMutation = useUpdateWine(numericWineId);

  const [submitErrorMessage, setSubmitErrorMessage] = useState<
    string | null
  >(null);

  function handleSubmit(data: WineCreateInput) {
    setSubmitErrorMessage(null);

    updateWineMutation.mutate(data, {
      onSuccess: (updatedWine) => {
        navigate(`/admin/wines/${updatedWine.id}`);
      },

      onError: (mutationError) => {
        setSubmitErrorMessage(
          mutationError instanceof ApiError
            ? mutationError.message
            : "更新に失敗しました。もう一度お試しください。",
        );
      },
    });
  }

  if (isPending) {
    return (
      <div className="rounded-xl border border-app-border bg-app-surface px-6 py-16 text-center text-app-text-secondary">
        ワイン情報を読み込んでいます...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-red-800"
      >
        <p className="font-semibold">ワイン情報の取得に失敗しました。</p>

        <p className="mt-2 text-sm">
          {error instanceof Error ? error.message : "不明なエラーです。"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={`/admin/wines/${wine.id}`}
        className="flex w-fit items-center gap-1 text-sm text-app-text-secondary transition-colors hover:text-app-primary"
      >
        <ArrowBackOutlined fontSize="small" />
        詳細へ戻る
      </Link>

      <h1 className="font-display text-3xl font-medium tracking-wide text-app-text md:text-4xl">
        ワイン編集
      </h1>

      <WineForm
        mode="edit"
        initialWine={wine}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/admin/wines/${wine.id}`)}
        isSubmitting={updateWineMutation.isPending}
        submitErrorMessage={submitErrorMessage}
      />
    </div>
  );
}
