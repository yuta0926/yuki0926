import { useState } from "react";

import { ArrowBackOutlined } from "@mui/icons-material";
import { Link, useNavigate } from "react-router";

import { WineForm } from "../features/wines/components/WineForm";
import { useCreateWine } from "../features/wines/hooks/useWines";
import { ApiError } from "../lib/apiClient";

import type { WineCreateInput } from "../features/wines/types/wine";


export function WineCreatePage() {
  const navigate = useNavigate();
  const createWineMutation = useCreateWine();

  const [submitErrorMessage, setSubmitErrorMessage] = useState<
    string | null
  >(null);

  function handleSubmit(data: WineCreateInput) {
    setSubmitErrorMessage(null);

    createWineMutation.mutate(data, {
      onSuccess: (wine) => {
        navigate(`/wines/${wine.id}`);
      },

      onError: (error) => {
        setSubmitErrorMessage(
          error instanceof ApiError
            ? error.message
            : "登録に失敗しました。もう一度お試しください。",
        );
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/wines"
        className="flex w-fit items-center gap-1 text-sm text-app-text-secondary transition-colors hover:text-app-primary"
      >
        <ArrowBackOutlined fontSize="small" />
        一覧へ戻る
      </Link>

      <h1 className="font-display text-3xl font-medium tracking-wide text-app-text md:text-4xl">
        ワイン新規登録
      </h1>

      <WineForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/wines")}
        isSubmitting={createWineMutation.isPending}
        submitErrorMessage={submitErrorMessage}
      />
    </div>
  );
}
