import { useSearchParams } from "react-router";

import { CustomerWineCardGridView } from "../features/wines/components/CustomerWineCardGridView";
import { CustomerWineSearchForm } from "../features/wines/components/CustomerWineSearchForm";
import { CustomerWineTableView } from "../features/wines/components/CustomerWineTableView";
import { WinePagination } from "../features/wines/components/WinePagination";
import {
  WineViewToggle,
  type WineViewMode,
} from "../features/wines/components/WineViewToggle";
import { usePublicWines } from "../features/wines/hooks/usePublicWines";

import type {
  SortOrder,
  WineCustomerSearchParams,
  WineCustomerSortField,
} from "../features/wines/types/wine";


const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;


function getStringParam(
  searchParams: URLSearchParams,
  key: string,
): string | undefined {
  const value = searchParams.get(key)?.trim();

  return value || undefined;
}


function getNumberParam(
  searchParams: URLSearchParams,
  key: string,
): number | undefined {
  const value = getStringParam(searchParams, key);

  if (value === undefined) {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
}


function getPositiveInteger(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: number,
): number {
  const value = getNumberParam(searchParams, key);

  if (value === undefined || !Number.isInteger(value) || value < 1) {
    return defaultValue;
  }

  return value;
}


function getBooleanParam(
  searchParams: URLSearchParams,
  key: string,
): boolean | undefined {
  const value = searchParams.get(key);

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}


function getViewParam(
  searchParams: URLSearchParams,
): WineViewMode {
  return searchParams.get("view") === "card" ? "card" : "list";
}


function buildUrlSearchParams(
  values: WineCustomerSearchParams,
  page: number,
  limit: number,
  view: WineViewMode,
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  if (page !== DEFAULT_PAGE) {
    params.set("page", String(page));
  }

  if (limit !== DEFAULT_LIMIT) {
    params.set("limit", String(limit));
  }

  if (view !== "list") {
    params.set("view", view);
  }

  return params;
}


export function CustomerWineListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = getPositiveInteger(searchParams, "page", DEFAULT_PAGE);
  const limit = getPositiveInteger(searchParams, "limit", DEFAULT_LIMIT);
  const view = getViewParam(searchParams);

  const filters: WineCustomerSearchParams = {
    keyword: getStringParam(searchParams, "keyword"),
    wine_type: getStringParam(searchParams, "wine_type"),
    style_type: getStringParam(searchParams, "style_type"),
    min_sale_price: getNumberParam(searchParams, "min_sale_price"),
    max_sale_price: getNumberParam(searchParams, "max_sale_price"),
    in_stock: getBooleanParam(searchParams, "in_stock"),

    sort_by:
      (getStringParam(searchParams, "sort_by") ??
        "id") as WineCustomerSortField,

    sort_order:
      (getStringParam(searchParams, "sort_order") ?? "desc") as SortOrder,
  };

  const apiParams: WineCustomerSearchParams = {
    ...filters,
    skip: (page - 1) * limit,
    limit,
  };

  const { data, error, isPending, isError, isFetching } =
    usePublicWines(apiParams);

  function handleSearch(values: WineCustomerSearchParams) {
    setSearchParams(
      buildUrlSearchParams(values, DEFAULT_PAGE, limit, view),
    );
  }

  function handleClear() {
    setSearchParams(new URLSearchParams());
  }

  function handlePageChange(nextPage: number) {
    setSearchParams(
      buildUrlSearchParams(filters, nextPage, limit, view),
    );
  }

  function handleLimitChange(nextLimit: number) {
    setSearchParams(
      buildUrlSearchParams(filters, DEFAULT_PAGE, nextLimit, view),
    );
  }

  function handleViewChange(nextView: WineViewMode) {
    const nextParams = new URLSearchParams(searchParams);

    if (nextView === "list") {
      nextParams.delete("view");
    } else {
      nextParams.set("view", nextView);
    }

    setSearchParams(nextParams);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-wide text-app-text md:text-4xl">
          ワイン一覧
        </h1>

        <p className="mt-2 text-sm text-app-text-secondary">
          取り扱いワインの検索・確認ができます。
        </p>
      </div>

      <CustomerWineSearchForm
        key={searchParams.toString()}
        initialValues={filters}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {isPending ? (
        <div className="rounded-xl border border-app-border bg-app-surface px-6 py-16 text-center text-app-text-secondary">
          ワインを読み込んでいます...
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-red-800"
        >
          <p className="font-semibold">ワイン一覧の取得に失敗しました。</p>

          <p className="mt-2 text-sm">
            {error instanceof Error ? error.message : "不明なエラーです。"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-app-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-app-border px-4 py-3">
            <p className="text-sm text-app-text-secondary">
              検索結果：
              <span className="ml-1 font-semibold text-app-text">
                {data.total}件
              </span>

              {isFetching && (
                <span className="ml-3 text-xs text-app-text-secondary">
                  最新データを取得中...
                </span>
              )}
            </p>

            <WineViewToggle view={view} onChange={handleViewChange} />
          </div>

          {view === "list" ? (
            <CustomerWineTableView wines={data.items} />
          ) : (
            <CustomerWineCardGridView wines={data.items} />
          )}

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
