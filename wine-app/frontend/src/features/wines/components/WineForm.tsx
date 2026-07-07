import { useState } from "react";

import {
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import type { Wine, WineCreateInput } from "../types/wine";


type WineFormValues = {
  original_no: string;
  order_date: string;

  wine_type: string;
  style_type: string;

  name: string;
  name_kana: string;

  country: string;
  producer: string;
  grape_variety: string;

  vintage: string;
  size: string;

  retail_price: string;
  purchase_price: string;
  quantity: string;
  sale_price: string;

  location: string;
  management_code: string;
  reserved_quantity: string;

  image_url: string;
  comment: string;

  ai_check_status: string;
};


const EMPTY_VALUES: WineFormValues = {
  original_no: "",
  order_date: "",
  wine_type: "",
  style_type: "",
  name: "",
  name_kana: "",
  country: "",
  producer: "",
  grape_variety: "",
  vintage: "",
  size: "",
  retail_price: "",
  purchase_price: "",
  quantity: "0",
  sale_price: "",
  location: "",
  management_code: "",
  reserved_quantity: "0",
  image_url: "",
  comment: "",
  ai_check_status: "未確認",
};


function toFormValues(wine: Wine): WineFormValues {
  return {
    original_no: wine.original_no?.toString() ?? "",
    order_date: wine.order_date ?? "",
    wine_type: wine.wine_type ?? "",
    style_type: wine.style_type ?? "",
    name: wine.name,
    name_kana: wine.name_kana ?? "",
    country: wine.country ?? "",
    producer: wine.producer ?? "",
    grape_variety: wine.grape_variety ?? "",
    vintage: wine.vintage?.toString() ?? "",
    size: wine.size ?? "",
    retail_price: wine.retail_price?.toString() ?? "",
    purchase_price: wine.purchase_price?.toString() ?? "",
    quantity: wine.quantity.toString(),
    sale_price: wine.sale_price?.toString() ?? "",
    location: wine.location ?? "",
    management_code: wine.management_code ?? "",
    reserved_quantity: wine.reserved_quantity.toString(),
    image_url: wine.image_url ?? "",
    comment: wine.comment ?? "",
    ai_check_status: wine.ai_check_status ?? "",
  };
}


function toOptionalString(value: string): string | null {
  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}


function toOptionalNumber(value: string): number | null {
  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : null;
}


function toWineCreateInput(values: WineFormValues): WineCreateInput {
  return {
    original_no: toOptionalNumber(values.original_no),
    order_date: toOptionalString(values.order_date),
    wine_type: toOptionalString(values.wine_type),
    style_type: toOptionalString(values.style_type),
    name: values.name.trim(),
    name_kana: toOptionalString(values.name_kana),
    country: toOptionalString(values.country),
    producer: toOptionalString(values.producer),
    grape_variety: toOptionalString(values.grape_variety),
    vintage: toOptionalNumber(values.vintage),
    size: toOptionalString(values.size),
    retail_price: toOptionalNumber(values.retail_price),
    purchase_price: toOptionalNumber(values.purchase_price),
    quantity: toOptionalNumber(values.quantity) ?? 0,
    sale_price: toOptionalNumber(values.sale_price),
    location: toOptionalString(values.location),
    management_code: toOptionalString(values.management_code),
    reserved_quantity: toOptionalNumber(values.reserved_quantity) ?? 0,
    image_url: toOptionalString(values.image_url),
    comment: toOptionalString(values.comment),
    ai_check_status: toOptionalString(values.ai_check_status),
  };
}


type FormErrors = Partial<Record<keyof WineFormValues, string>>;


function validate(values: WineFormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.name.trim() === "") {
    errors.name = "ワイン名を入力してください。";
  }

  const numericFields: (keyof WineFormValues)[] = [
    "original_no",
    "vintage",
    "retail_price",
    "purchase_price",
    "quantity",
    "sale_price",
    "reserved_quantity",
  ];

  for (const field of numericFields) {
    const raw = values[field].trim();

    if (raw === "") {
      continue;
    }

    const parsed = Number(raw);

    if (!Number.isInteger(parsed) || parsed < 0) {
      errors[field] = "0以上の整数を入力してください。";
    }
  }

  return errors;
}


type WineFormProps = {
  mode: "create" | "edit";
  initialWine?: Wine;
  onSubmit: (data: WineCreateInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitErrorMessage?: string | null;
};


export function WineForm({
  mode,
  initialWine,
  onSubmit,
  onCancel,
  isSubmitting,
  submitErrorMessage,
}: WineFormProps) {
  const [values, setValues] = useState<WineFormValues>(
    initialWine ? toFormValues(initialWine) : EMPTY_VALUES,
  );

  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(
    field: keyof WineFormValues,
  ): (
    event: { target: { value: string } },
  ) => void {
    return (event) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(toWineCreateInput(values));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {submitErrorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800"
        >
          {submitErrorMessage}
        </div>
      )}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          基本情報
        </Typography>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextField
            label="ワイン名"
            required
            value={values.name}
            onChange={handleChange("name")}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />

          <TextField
            label="カナ"
            value={values.name_kana}
            onChange={handleChange("name_kana")}
            fullWidth
          />

          <TextField
            label="原番号"
            type="number"
            value={values.original_no}
            onChange={handleChange("original_no")}
            error={!!errors.original_no}
            helperText={errors.original_no}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="wine-type-label">種類</InputLabel>
            <Select
              labelId="wine-type-label"
              label="種類"
              value={values.wine_type}
              onChange={handleChange("wine_type")}
            >
              <MenuItem value="">未設定</MenuItem>
              <MenuItem value="赤">赤</MenuItem>
              <MenuItem value="白">白</MenuItem>
              <MenuItem value="オレンジ">オレンジ</MenuItem>
              <MenuItem value="ロゼ">ロゼ</MenuItem>
              <MenuItem value="スパークリング">スパークリング</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="style-type-label">スタイル</InputLabel>
            <Select
              labelId="style-type-label"
              label="スタイル"
              value={values.style_type}
              onChange={handleChange("style_type")}
            >
              <MenuItem value="">未設定</MenuItem>
              <MenuItem value="Classic">Classic</MenuItem>
              <MenuItem value="ナチュール">ナチュール</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="ヴィンテージ"
            type="number"
            value={values.vintage}
            onChange={handleChange("vintage")}
            error={!!errors.vintage}
            helperText={errors.vintage}
            fullWidth
          />

          <TextField
            label="生産国"
            value={values.country}
            onChange={handleChange("country")}
            fullWidth
          />

          <TextField
            label="生産者"
            value={values.producer}
            onChange={handleChange("producer")}
            fullWidth
          />

          <TextField
            label="品種"
            value={values.grape_variety}
            onChange={handleChange("grape_variety")}
            fullWidth
          />

          <TextField
            label="サイズ"
            placeholder="Bottle、Magnumなど"
            value={values.size}
            onChange={handleChange("size")}
            fullWidth
          />

          <TextField
            label="発注日"
            type="date"
            value={values.order_date}
            onChange={handleChange("order_date")}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </div>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          価格・在庫情報
        </Typography>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextField
            label="小売価格"
            type="number"
            value={values.retail_price}
            onChange={handleChange("retail_price")}
            error={!!errors.retail_price}
            helperText={errors.retail_price}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">¥</InputAdornment>
                ),
              },
            }}
            fullWidth
          />

          <TextField
            label="仕入価格"
            type="number"
            value={values.purchase_price}
            onChange={handleChange("purchase_price")}
            error={!!errors.purchase_price}
            helperText={errors.purchase_price}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">¥</InputAdornment>
                ),
              },
            }}
            fullWidth
          />

          <TextField
            label="売価"
            type="number"
            value={values.sale_price}
            onChange={handleChange("sale_price")}
            error={!!errors.sale_price}
            helperText={errors.sale_price}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">¥</InputAdornment>
                ),
              },
            }}
            fullWidth
          />

          <TextField
            label="在庫数"
            type="number"
            required
            value={values.quantity}
            onChange={handleChange("quantity")}
            error={!!errors.quantity}
            helperText={
              errors.quantity ??
              (mode === "edit"
                ? "在庫数の変更は入出庫登録から行うことを推奨します。"
                : undefined)
            }
            fullWidth
          />

          <TextField
            label="予約数"
            type="number"
            value={values.reserved_quantity}
            onChange={handleChange("reserved_quantity")}
            error={!!errors.reserved_quantity}
            helperText={errors.reserved_quantity}
            fullWidth
          />

          <TextField
            label="保管場所"
            value={values.location}
            onChange={handleChange("location")}
            fullWidth
          />

          <TextField
            label="管理番号"
            value={values.management_code}
            onChange={handleChange("management_code")}
            fullWidth
          />
        </div>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          画像・コメント・管理情報
        </Typography>

        <div className="flex flex-col gap-4">
          <TextField
            label="画像URL"
            value={values.image_url}
            onChange={handleChange("image_url")}
            fullWidth
          />

          <TextField
            label="コメント・メモ"
            value={values.comment}
            onChange={handleChange("comment")}
            multiline
            minRows={3}
            fullWidth
          />

          <FormControl sx={{ maxWidth: 240 }}>
            <InputLabel id="ai-check-status-label">
              AIチェック状況
            </InputLabel>
            <Select
              labelId="ai-check-status-label"
              label="AIチェック状況"
              value={values.ai_check_status}
              onChange={handleChange("ai_check_status")}
            >
              <MenuItem value="未確認">未確認</MenuItem>
              <MenuItem value="要確認">要確認</MenuItem>
              <MenuItem value="確認済み">確認済み</MenuItem>
              <MenuItem value="要修正">要修正</MenuItem>
            </Select>
          </FormControl>
        </div>
      </Paper>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          {mode === "create" ? "登録する" : "更新する"}
        </Button>
      </div>
    </form>
  );
}
