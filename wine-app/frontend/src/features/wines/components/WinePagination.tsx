import {
  FormControl,
  MenuItem,
  Pagination,
  Select,
  Typography,
} from "@mui/material";


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
    <div className="flex flex-col items-center justify-between gap-4 border-t border-app-border bg-app-surface px-4 py-4 md:flex-row">
      <Typography
        variant="body2"
        color="text.secondary"
      >
        全 {total} 件
      </Typography>

      <Pagination
        page={page}
        count={totalPages}
        disabled={isFetching}
        shape="rounded"
        variant="outlined"
        color="primary"
        onChange={(_, nextPage) =>
          onPageChange(nextPage)
        }
      />

      <div className="flex items-center gap-2">
        <Typography
          variant="body2"
          color="text.secondary"
        >
          表示件数
        </Typography>

        <FormControl
          size="small"
          sx={{
            minWidth: 90,

            "& .MuiOutlinedInput-root": {
              minHeight: 40,
            },
          }}
        >
          <Select
            value={limit}
            onChange={(event) =>
              onLimitChange(
                Number(
                  event.target.value,
                ),
              )
            }
          >
            <MenuItem value={5}>
              5件
            </MenuItem>

            <MenuItem value={10}>
              10件
            </MenuItem>

            <MenuItem value={20}>
              20件
            </MenuItem>

            <MenuItem value={50}>
              50件
            </MenuItem>
          </Select>
        </FormControl>
      </div>
    </div>
  );
}