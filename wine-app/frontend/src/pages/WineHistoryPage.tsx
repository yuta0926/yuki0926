import {
  Chip,
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";

import { useSearchParams } from "react-router";

import { WinePagination } from "../features/wines/components/WinePagination";
import { WineTransactionHistoryTable } from "../features/wines/components/WineTransactionHistoryTable";
import { useTransactions } from "../features/wines/hooks/useWines";

import type { TransactionType } from "../features/wines/types/wine";


const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;


const TRANSACTION_TYPE_OPTIONS: {
  value: TransactionType | "";
  label: string;
}[] = [
  { value: "", label: "すべて" },
  { value: "in", label: "入庫" },
  { value: "out", label: "出庫" },
  { value: "move", label: "移動" },
  { value: "adjust", label: "調整" },
];


function getPositiveInteger(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: number,
): number {
  const value = Number(searchParams.get(key));

  if (!Number.isInteger(value) || value < 1) {
    return defaultValue;
  }

  return value;
}


function getTransactionTypeParam(
  searchParams: URLSearchParams,
): TransactionType | undefined {
  const value = searchParams.get("transaction_type");

  if (
    value === "in" ||
    value === "out" ||
    value === "move" ||
    value === "adjust"
  ) {
    return value;
  }

  return undefined;
}


function getWineIdParam(
  searchParams: URLSearchParams,
): number | undefined {
  const value = Number(searchParams.get("wine_id"));

  return Number.isInteger(value) && value > 0 ? value : undefined;
}


export function WineHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = getPositiveInteger(
    searchParams,
    "page",
    DEFAULT_PAGE,
  );

  const limit = getPositiveInteger(
    searchParams,
    "limit",
    DEFAULT_LIMIT,
  );

  const transactionType = getTransactionTypeParam(searchParams);
  const wineId = getWineIdParam(searchParams);

  const {
    data,
    error,
    isPending,
    isError,
    isFetching,
  } = useTransactions({
    wine_id: wineId,
    transaction_type: transactionType,
    skip: (page - 1) * limit,
    limit,
  });

  function handleClearWineFilter() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("wine_id");
    nextParams.delete("page");
    setSearchParams(nextParams);
  }

  function handleTransactionTypeChange(
    event: SelectChangeEvent,
  ) {
    const nextParams = new URLSearchParams(searchParams);
    const value = event.target.value;

    if (value) {
      nextParams.set("transaction_type", value);
    } else {
      nextParams.delete("transaction_type");
    }

    nextParams.delete("page");

    setSearchParams(nextParams);
  }

  function handlePageChange(nextPage: number) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  }

  function handleLimitChange(nextLimit: number) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("limit", String(nextLimit));
    nextParams.delete("page");
    setSearchParams(nextParams);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-wide text-app-text md:text-4xl">
          入出庫履歴
        </h1>

        <p className="mt-2 text-sm text-app-text-secondary">
          全ワインの入庫・出庫・移動・棚卸調整の履歴を新しい順に確認できます。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={transactionType ?? ""}
            onChange={handleTransactionTypeChange}
            displayEmpty
          >
            {TRANSACTION_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {wineId && (
          <Chip
            label={`ワイン絞り込み中: ${data?.items[0]?.wine_name ?? `ID ${wineId}`}`}
            onDelete={handleClearWineFilter}
            size="small"
          />
        )}
      </div>

      {isPending ? (
        <div className="rounded-xl border border-app-border bg-app-surface px-6 py-16 text-center text-app-text-secondary">
          履歴を読み込んでいます...
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-red-800"
        >
          <p className="font-semibold">
            入出庫履歴の取得に失敗しました。
          </p>

          <p className="mt-2 text-sm">
            {error instanceof Error
              ? error.message
              : "不明なエラーです。"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-app-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-app-border px-4 py-3">
            <p className="text-sm text-app-text-secondary">
              該当件数：
              <span className="ml-1 font-semibold text-app-text">
                {data.total}件
              </span>

              {isFetching && (
                <span className="ml-3 text-xs text-app-text-secondary">
                  最新データを取得中...
                </span>
              )}
            </p>
          </div>

          <WineTransactionHistoryTable transactions={data.items} />

          <WinePagination
            page={page}
            limit={limit}
            total={data.total}
            isFetching={isFetching}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      )}
    </div>
  );
}
