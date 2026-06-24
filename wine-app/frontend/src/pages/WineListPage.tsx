import {
    useSearchParams,
  } from "react-router";
  
  import { WinePagination } from "../features/wines/components/WinePagination";
  import { WineSearchForm } from "../features/wines/components/WineSearchForm";
  import { WineTable } from "../features/wines/components/WineTable";
  import { useWines } from "../features/wines/hooks/useWines";
  
  import type {
    SortOrder,
    WineSearchParams,
    WineSortField,
  } from "../features/wines/types/wine";
  
  
  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 5;
  
  
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
    const value = getStringParam(
      searchParams,
      key,
    );
  
    if (value === undefined) {
      return undefined;
    }
  
    const numberValue = Number(value);
  
    return Number.isFinite(numberValue)
      ? numberValue
      : undefined;
  }
  
  
  function getPositiveInteger(
    searchParams: URLSearchParams,
    key: string,
    defaultValue: number,
  ): number {
    const value = getNumberParam(
      searchParams,
      key,
    );
  
    if (
      value === undefined ||
      !Number.isInteger(value) ||
      value < 1
    ) {
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
  
  
  function buildUrlSearchParams(
    values: WineSearchParams,
    page: number,
    limit: number,
  ): URLSearchParams {
    const params = new URLSearchParams();
  
    Object.entries(values).forEach(
      ([key, value]) => {
        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {
          return;
        }
  
        params.set(
          key,
          String(value),
        );
      },
    );
  
    if (page !== DEFAULT_PAGE) {
      params.set(
        "page",
        String(page),
      );
    }
  
    if (limit !== DEFAULT_LIMIT) {
      params.set(
        "limit",
        String(limit),
      );
    }
  
    return params;
  }
  
  
  export function WineListPage() {
    const [
      searchParams,
      setSearchParams,
    ] = useSearchParams();
  
  
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
  
  
    const filters: WineSearchParams = {
      keyword: getStringParam(
        searchParams,
        "keyword",
      ),
  
      wine_type: getStringParam(
        searchParams,
        "wine_type",
      ),
  
      style_type: getStringParam(
        searchParams,
        "style_type",
      ),
  
      country: getStringParam(
        searchParams,
        "country",
      ),
  
      producer: getStringParam(
        searchParams,
        "producer",
      ),
  
      grape_variety: getStringParam(
        searchParams,
        "grape_variety",
      ),
  
      vintage: getNumberParam(
        searchParams,
        "vintage",
      ),
  
      location: getStringParam(
        searchParams,
        "location",
      ),
  
      min_sale_price: getNumberParam(
        searchParams,
        "min_sale_price",
      ),
  
      max_sale_price: getNumberParam(
        searchParams,
        "max_sale_price",
      ),
  
      in_stock: getBooleanParam(
        searchParams,
        "in_stock",
      ),
  
      sort_by:
        (
          getStringParam(
            searchParams,
            "sort_by",
          ) ?? "id"
        ) as WineSortField,
  
      sort_order:
        (
          getStringParam(
            searchParams,
            "sort_order",
          ) ?? "desc"
        ) as SortOrder,
    };
  
  
    const apiParams: WineSearchParams = {
      ...filters,
  
      skip: (page - 1) * limit,
      limit,
    };
  
  
    const {
      data,
      error,
      isPending,
      isError,
      isFetching,
    } = useWines(apiParams);
  
  
    function handleSearch(
      values: WineSearchParams,
    ) {
      const nextParams =
        buildUrlSearchParams(
          values,
          DEFAULT_PAGE,
          limit,
        );
  
      setSearchParams(nextParams);
    }
  
  
    function handleClear() {
      setSearchParams(
        new URLSearchParams(),
      );
    }
  
  
    function handlePageChange(
      nextPage: number,
    ) {
      setSearchParams(
        buildUrlSearchParams(
          filters,
          nextPage,
          limit,
        ),
      );
    }
  
  
    function handleLimitChange(
      nextLimit: number,
    ) {
      setSearchParams(
        buildUrlSearchParams(
          filters,
          DEFAULT_PAGE,
          nextLimit,
        ),
      );
    }
  
  
    return (
      <main>
        <header>
          <h1>ワイン一覧</h1>
        </header>
  
        <WineSearchForm
          key={searchParams.toString()}
          initialValues={filters}
          onSearch={handleSearch}
          onClear={handleClear}
        />
  
        {isPending ? (
          <p>ワインを読み込んでいます...</p>
        ) : isError ? (
          <div role="alert">
            <p>
              ワイン一覧の取得に失敗しました。
            </p>
  
            <p>
              {error instanceof Error
                ? error.message
                : "不明なエラーです。"}
            </p>
          </div>
        ) : (
          <>
            <div>
              <p>
                検索結果：
                {data.total}件
              </p>
  
              {isFetching && (
                <p>
                  最新のデータを取得中です...
                </p>
              )}
            </div>
  
            <WineTable
              wines={data.items}
            />
  
            <WinePagination
              page={page}
              limit={limit}
              total={data.total}
              isFetching={isFetching}
              onPageChange={
                handlePageChange
              }
              onLimitChange={
                handleLimitChange
              }
            />
          </>
        )}
      </main>
    );
  }