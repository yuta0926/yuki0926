import type {
    FormEvent,
  } from "react";
  
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
  
    const trimmedValue = value.trim();
  
    return trimmedValue || undefined;
  }
  
  
  function getOptionalNumber(
    formData: FormData,
    key: string,
  ): number | undefined {
    const value = getOptionalString(
      formData,
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
        getOptionalString(formData, "keyword");
  
      const wineType =
        getOptionalString(formData, "wine_type");
  
      const styleType =
        getOptionalString(formData, "style_type");
  
      const country =
        getOptionalString(formData, "country");
  
      const producer =
        getOptionalString(formData, "producer");
  
      const grapeVariety =
        getOptionalString(
          formData,
          "grape_variety",
        );
  
      const vintage =
        getOptionalNumber(formData, "vintage");
  
      const location =
        getOptionalString(formData, "location");
  
      const minSalePrice =
        getOptionalNumber(
          formData,
          "min_sale_price",
        );
  
      const maxSalePrice =
        getOptionalNumber(
          formData,
          "max_sale_price",
        );
  
      const inStockValue =
        getOptionalString(formData, "in_stock");
  
      const sortBy =
        getOptionalString(
          formData,
          "sort_by",
        ) as WineSortField | undefined;
  
      const sortOrder =
        getOptionalString(
          formData,
          "sort_order",
        ) as "asc" | "desc" | undefined;
  
  
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
  
      if (producer) {
        values.producer = producer;
      }
  
      if (grapeVariety) {
        values.grape_variety = grapeVariety;
      }
  
      if (vintage !== undefined) {
        values.vintage = vintage;
      }
  
      if (location) {
        values.location = location;
      }
  
      if (minSalePrice !== undefined) {
        values.min_sale_price = minSalePrice;
      }
  
      if (maxSalePrice !== undefined) {
        values.max_sale_price = maxSalePrice;
      }
  
      if (inStockValue === "true") {
        values.in_stock = true;
      }
  
      if (inStockValue === "false") {
        values.in_stock = false;
      }
  
      if (sortBy) {
        values.sort_by = sortBy;
      }
  
      if (sortOrder) {
        values.sort_order = sortOrder;
      }
  
      onSearch(values);
    }
  
  
    return (
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>検索条件</legend>
  
          <div>
            <label htmlFor="keyword">
              キーワード
            </label>
  
            <input
              id="keyword"
              name="keyword"
              type="search"
              defaultValue={
                initialValues.keyword ?? ""
              }
              placeholder="ワイン名、生産者、品種など"
            />
          </div>
  
          <div>
            <label htmlFor="wine_type">
              種類
            </label>
  
            <select
              id="wine_type"
              name="wine_type"
              defaultValue={
                initialValues.wine_type ?? ""
              }
            >
              <option value="">すべて</option>
              <option value="赤">赤</option>
              <option value="白">白</option>
              <option value="オレンジ">
                オレンジ
              </option>
              <option value="ロゼ">ロゼ</option>
            </select>
          </div>
  
          <div>
            <label htmlFor="style_type">
              スタイル
            </label>
  
            <select
              id="style_type"
              name="style_type"
              defaultValue={
                initialValues.style_type ?? ""
              }
            >
              <option value="">すべて</option>
              <option value="Classic">
                Classic
              </option>
              <option value="ナチュール">
                ナチュール
              </option>
            </select>
          </div>
  
          <div>
            <label htmlFor="country">
              生産国
            </label>
  
            <input
              id="country"
              name="country"
              type="text"
              defaultValue={
                initialValues.country ?? ""
              }
            />
          </div>
  
          <div>
            <label htmlFor="producer">
              生産者
            </label>
  
            <input
              id="producer"
              name="producer"
              type="text"
              defaultValue={
                initialValues.producer ?? ""
              }
            />
          </div>
  
          <div>
            <label htmlFor="grape_variety">
              品種
            </label>
  
            <input
              id="grape_variety"
              name="grape_variety"
              type="text"
              defaultValue={
                initialValues.grape_variety ??
                ""
              }
            />
          </div>
  
          <div>
            <label htmlFor="vintage">
              Vintage
            </label>
  
            <input
              id="vintage"
              name="vintage"
              type="number"
              min="0"
              defaultValue={
                initialValues.vintage ?? ""
              }
            />
          </div>
  
          <div>
            <label htmlFor="location">
              保管場所
            </label>
  
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={
                initialValues.location ?? ""
              }
            />
          </div>
  
          <div>
            <label htmlFor="min_sale_price">
              売価・下限
            </label>
  
            <input
              id="min_sale_price"
              name="min_sale_price"
              type="number"
              min="0"
              defaultValue={
                initialValues.min_sale_price ??
                ""
              }
            />
          </div>
  
          <div>
            <label htmlFor="max_sale_price">
              売価・上限
            </label>
  
            <input
              id="max_sale_price"
              name="max_sale_price"
              type="number"
              min="0"
              defaultValue={
                initialValues.max_sale_price ??
                ""
              }
            />
          </div>
  
          <div>
            <label htmlFor="in_stock">
              在庫
            </label>
  
            <select
              id="in_stock"
              name="in_stock"
              defaultValue={
                initialValues.in_stock === true
                  ? "true"
                  : initialValues.in_stock ===
                      false
                    ? "false"
                    : ""
              }
            >
              <option value="">すべて</option>
              <option value="true">
                在庫あり
              </option>
              <option value="false">
                在庫なし
              </option>
            </select>
          </div>
  
          <div>
            <label htmlFor="sort_by">
              並び替え
            </label>
  
            <select
              id="sort_by"
              name="sort_by"
              defaultValue={
                initialValues.sort_by ?? "id"
              }
            >
              <option value="id">
                登録順
              </option>
              <option value="name">
                ワイン名
              </option>
              <option value="vintage">
                Vintage
              </option>
              <option value="sale_price">
                売価
              </option>
              <option value="quantity">
                在庫数
              </option>
              <option value="created_at">
                登録日時
              </option>
            </select>
  
            <select
              aria-label="並び順"
              name="sort_order"
              defaultValue={
                initialValues.sort_order ??
                "desc"
              }
            >
              <option value="desc">
                降順
              </option>
              <option value="asc">
                昇順
              </option>
            </select>
          </div>
  
          <div>
            <button type="submit">
              検索
            </button>
  
            <button
              type="button"
              onClick={onClear}
            >
              条件をクリア
            </button>
          </div>
        </fieldset>
      </form>
    );
  }