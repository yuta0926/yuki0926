import { useState } from "react";

import { ArrowBackOutlined } from "@mui/icons-material";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router";

import { WineBadge } from "../components/common/WineBadge";
import { WineImageCard } from "../components/common/WineImageCard";

import { WineComment } from "../features/wines/components/WineComment";
import { WineHistoryTable } from "../features/wines/components/WineHistoryTable";
import { WineInfoCard } from "../features/wines/components/WineInfoCard";
import { WineManagementInfo } from "../features/wines/components/WineManagementInfo";
import { WinePriceInfo } from "../features/wines/components/WinePriceInfo";
import { WineStockSummary } from "../features/wines/components/WineStockSummary";
import { useDeleteWine, useWine } from "../features/wines/hooks/useWines";
import { designTokens } from "../theme/theme";


export function WineDetailPage() {
  const { wineId } = useParams();
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const numericWineId = Number(wineId);

  const {
    data: wine,
    error,
    isPending,
    isError,
  } = useWine(numericWineId);

  const deleteWineMutation = useDeleteWine();

  function handleDeleteConfirm() {
    deleteWineMutation.mutate(numericWineId, {
      onSuccess: () => {
        navigate("/wines");
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
        to="/wines"
        className="flex w-fit items-center gap-1 text-sm text-app-text-secondary transition-colors hover:text-app-primary"
      >
        <ArrowBackOutlined fontSize="small" />
        一覧へ戻る
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-medium tracking-wide text-app-text md:text-4xl">
            {wine.name}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <WineBadge value={wine.wine_type} />
            <WineBadge value={wine.style_type} />
            <Chip
              label={
                wine.quantity > 0
                  ? `在庫あり ${wine.quantity}本`
                  : "在庫切れ"
              }
              variant="outlined"
              size="small"
              sx={{
                color: wine.quantity > 0
                  ? designTokens.colors.success
                  : designTokens.colors.danger,
                borderColor: wine.quantity > 0
                  ? designTokens.colors.success
                  : designTokens.colors.danger,
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            component={Link}
            to={`/wines/${wine.id}/edit`}
            variant="outlined"
          >
            編集
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            削除
          </Button>

          <Button variant="contained" disabled>
            入出庫登録
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <WineImageCard imageUrl={wine.image_url} alt={wine.name} />
        <WineInfoCard wine={wine} />
        <WineStockSummary wine={wine} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <WinePriceInfo wine={wine} />
        <WineManagementInfo wine={wine} />
        <WineComment wine={wine} />
      </div>

      <WineHistoryTable transactions={wine.recent_transactions} />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>ワインを削除しますか?</DialogTitle>

        <DialogContent>
          <DialogContentText>
            「{wine.name}」を削除します。この操作は取り消せません。
          </DialogContentText>

          {deleteWineMutation.isError && (
            <p className="mt-3 text-sm text-red-700">
              削除に失敗しました。もう一度お試しください。
            </p>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteWineMutation.isPending}
          >
            キャンセル
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteConfirm}
            disabled={deleteWineMutation.isPending}
          >
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
