import { useEffect, useRef, useState } from "react";

import {
  ArrowBackOutlined,
  UploadFileOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Link } from "react-router";

import { useImportWines } from "../features/wines/hooks/useWines";
import { ApiError } from "../lib/apiClient";

const ACCEPTED_FILE_TYPES = [
  ".xlsx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export function WineImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const importWinesMutation = useImportWines();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<
    string | null
  >(null);

  function handleSelectButtonClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setSubmitErrorMessage(null);
    importWinesMutation.reset();
    setSelectedFile(file);
  }

  function handleImport() {
    if (!selectedFile) {
      return;
    }

    setSubmitErrorMessage(null);

    importWinesMutation.mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
      },
      onError: (error) => {
        setSubmitErrorMessage(
          error instanceof ApiError
            ? error.message
            : "アップロードに失敗しました。もう一度お試しください。",
        );
      },
    });
  }

  const result = importWinesMutation.data;

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result]);

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/admin/wines"
        className="flex w-fit items-center gap-1 text-sm text-app-text-secondary transition-colors hover:text-app-primary"
      >
        <ArrowBackOutlined fontSize="small" />
        一覧へ戻る
      </Link>

      <h1 className="font-display text-3xl font-medium tracking-wide text-app-text md:text-4xl">
        Excel一括登録
      </h1>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          ファイル形式について
        </Typography>

        <div className="flex flex-col gap-1 text-sm text-app-text-secondary">
          <p>
            必須列は「ワイン名」のみです。それ以外の列は空欄のまま登録できます。
          </p>
          <ul className="list-disc pl-5">
            <li>種類: 赤ワイン / 白ワイン / オレンジワイン / ロゼ</li>
            <li>スタイル: Classic / ナチュール</li>
            <li>サイズ: Bottle / HalfBottle / Glass</li>
            <li>Vintage: 4桁の年、またはNVの場合は空欄</li>
            <li>本数: 空欄の場合は0本として登録</li>
            <li>AI確認ステータス: 確認済み / 要確認 / 要修正、または空欄</li>
          </ul>
          <p>
            名前が空欄の行はスキップされます。既存データやファイル内で重複する行(ワイン名・生産者・Vintage・サイズ・保管場所が一致)も登録されずエラーとして返されます。
          </p>
        </div>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          ファイルを選択
        </Typography>

        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Excelファイルを選択"
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outlined"
              onClick={handleSelectButtonClick}
              disabled={importWinesMutation.isPending}
              startIcon={<UploadFileOutlined />}
            >
              {selectedFile ? "ファイルを変更" : "ファイルを選択"}
            </Button>

            {selectedFile && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {selectedFile.name}
              </Typography>
            )}
          </div>

          {submitErrorMessage && (
            <Alert severity="error">{submitErrorMessage}</Alert>
          )}

          <Button
            type="button"
            variant="contained"
            onClick={handleImport}
            disabled={
              !selectedFile || importWinesMutation.isPending
            }
            startIcon={
              importWinesMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            sx={{ alignSelf: "flex-start" }}
          >
            アップロードして登録
          </Button>
        </div>
      </Paper>

      {result && (
        <Paper ref={resultRef} variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>
            登録結果
          </Typography>

          <Alert
            severity={result.skipped_count > 0 ? "warning" : "success"}
            sx={{ mb: result.errors.length > 0 ? 2 : 0 }}
          >
            {`インポートが完了しました。作成: ${result.created_count}件 / スキップ: ${result.skipped_count}件`}
          </Alert>

          {result.errors.length > 0 && (
            <TableContainer>
              <Table
                size="small"
                aria-label="インポートエラー一覧"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>行番号</TableCell>
                    <TableCell>エラー内容</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {result.errors.map((rowError) => (
                    <TableRow key={rowError.row}>
                      <TableCell>{rowError.row}</TableCell>
                      <TableCell>{rowError.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </div>
  );
}
