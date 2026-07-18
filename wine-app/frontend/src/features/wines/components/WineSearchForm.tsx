import type {
  FormEvent,
} from "react";

import {
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from "@mui/material";

import {
  RestartAlt,
  Search,
} from "@mui/icons-material";

import type {
  WineSearchParams,
  WineSortField,
} from "../types/wine";


type WineSearchFormProps = {
  initialValues: WineSearchParams;

  onSearch: (
    values: WineSearchParams,
  ) => void;

  onClear: () => void;
};


function getOptionalString(
  formData: FormData,
  key: string,
): string | undefined {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed || undefined;
}


export function WineSearchForm({
  initialValues,
  onSearch,
  onClear,
}: WineSearchFormProps) {
  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget,
    );

    const values: WineSearchParams = {};

    const keyword =
      getOptionalString(
        formData,
        "keyword",
      );

    const wineType =
      getOptionalString(
        formData,
        "wine_type",
      );

    const styleType =
      getOptionalString(
        formData,
        "style_type",
      );

    const country =
      getOptionalString(
        formData,
        "country",
      );

    const location =
      getOptionalString(
        formData,
        "location",
      );

    const inStock =
      getOptionalString(
        formData,
        "in_stock",
      );

    const sortBy =
      getOptionalString(
        formData,
        "sort_by",
      ) as WineSortField | undefined;

    const sortOrder =
      getOptionalString(
        formData,
        "sort_order",
      ) as
        | "asc"
        | "desc"
        | undefined;

    if (keyword) {
      values.keyword = keyword;
    }

    if (wineType) {
      values.wine_type = wineType;
    }

    if (styleType) {
      values.style_type = styleType;
    }

    if (country) {
      values.country = country;
    }

    if (location) {
      values.location = location;
    }

    if (inStock === "true") {
      values.in_stock = true;
    }

    if (inStock === "false") {
      values.in_stock = false;
    }

    values.sort_by = sortBy ?? "id";
    values.sort_order =
      sortOrder ?? "desc";

    onSearch(values);
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      variant="outlined"
      sx={{
        p: {
          xs: 2,
          md: 2.5,
        },

        borderColor: "divider",
        boxShadow: 2,
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[minmax(200px,2fr)_repeat(5,minmax(130px,1fr))_auto]">
        <TextField
          name="keyword"
          label="キーワード"
          defaultValue={
            initialValues.keyword ?? ""
          }
          placeholder="ワイン名・生産者名で検索"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search
                    fontSize="small"
                  />
                </InputAdornment>
              ),
            },
          }}
        />

        <FormControl fullWidth size="small">
          <InputLabel id="wine-type-label">
            種類
          </InputLabel>

          <Select
            labelId="wine-type-label"
            name="wine_type"
            label="種類"
            defaultValue={
              initialValues.wine_type ??
              ""
            }
          >
            <MenuItem value="">
              すべて
            </MenuItem>

            <MenuItem value="赤">
              赤
            </MenuItem>

            <MenuItem value="白">
              白
            </MenuItem>

            <MenuItem value="オレンジ">
              オレンジ
            </MenuItem>

            <MenuItem value="ロゼ">
              ロゼ
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel id="style-type-label">
            スタイル
          </InputLabel>

          <Select
            labelId="style-type-label"
            name="style_type"
            label="スタイル"
            defaultValue={
              initialValues.style_type ??
              ""
            }
          >
            <MenuItem value="">
              すべて
            </MenuItem>

            <MenuItem value="Classic">
              Classic
            </MenuItem>

            <MenuItem value="ナチュール">
              ナチュール
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          name="country"
          label="生産国"
          defaultValue={
            initialValues.country ?? ""
          }
          placeholder="すべて"
          fullWidth
        />

        <TextField
          name="location"
          label="保管場所"
          defaultValue={
            initialValues.location ?? ""
          }
          placeholder="すべて"
          fullWidth
        />

        <FormControl fullWidth size="small">
          <InputLabel id="stock-label">
            在庫
          </InputLabel>

          <Select
            labelId="stock-label"
            name="in_stock"
            label="在庫"
            defaultValue={
              initialValues.in_stock ===
              true
                ? "true"
                : initialValues.in_stock ===
                    false
                  ? "false"
                  : ""
            }
          >
            <MenuItem value="">
              すべて
            </MenuItem>

            <MenuItem value="true">
              在庫あり
            </MenuItem>

            <MenuItem value="false">
              在庫なし
            </MenuItem>
          </Select>
        </FormControl>

        <div className="flex gap-2">
          <Button
            type="submit"
            variant="contained"
            startIcon={<Search />}
          >
            検索
          </Button>

          <Button
            type="button"
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={onClear}
          >
            リセット
          </Button>
        </div>

        <input
          type="hidden"
          name="sort_by"
          value={
            initialValues.sort_by ??
            "id"
          }
        />

        <input
          type="hidden"
          name="sort_order"
          value={
            initialValues.sort_order ??
            "desc"
          }
        />
      </div>
    </Paper>
  );
}