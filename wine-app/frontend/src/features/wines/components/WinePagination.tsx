type WinePaginationProps = {
    page: number;
    limit: number;
    total: number;
    isFetching: boolean;
  
    onPageChange: (
      page: number,
    ) => void;
  
    onLimitChange: (
      limit: number,
    ) => void;
  };
  
  
  export function WinePagination({
    page,
    limit,
    total,
    isFetching,
    onPageChange,
    onLimitChange,
  }: WinePaginationProps) {
    const totalPages = Math.max(
      1,
      Math.ceil(total / limit),
    );
  
    if (total === 0) {
      return null;
    }
  
    return (
      <nav aria-label="ページネーション">
        <button
          type="button"
          disabled={
            page <= 1 || isFetching
          }
          onClick={() =>
            onPageChange(page - 1)
          }
        >
          前へ
        </button>
  
        <span>
          {page} / {totalPages}ページ
        </span>
  
        <button
          type="button"
          disabled={
            page >= totalPages ||
            isFetching
          }
          onClick={() =>
            onPageChange(page + 1)
          }
        >
          次へ
        </button>
  
        <label>
          表示件数
  
          <select
            value={limit}
            onChange={(event) =>
              onLimitChange(
                Number(event.target.value),
              )
            }
          >
            <option value={5}>5件</option>
            <option value={10}>10件</option>
            <option value={20}>20件</option>
            <option value={50}>50件</option>
          </select>
        </label>
      </nav>
    );
  }