import { apiClient } from "../../../lib/apiClient";

import type {
  ImageUploadResponse,
  InventoryTransactionCreateInput,
  Wine,
  WineCreateInput,
  WineListResponse,
  WineSearchParams,
  WineUpdateInput,
} from "../types/wine";


function buildSearchParams(
  params: WineSearchParams,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams;
}


export async function getWines(
  params: WineSearchParams = {},
): Promise<WineListResponse> {
  const searchParams = buildSearchParams(params);
  const queryString = searchParams.toString();

  const path = queryString
    ? `/api/wines?${queryString}`
    : "/api/wines";

  return apiClient<WineListResponse>(path);
}


export async function getWine(
  wineId: number,
): Promise<Wine> {
  return apiClient<Wine>(
    `/api/wines/${wineId}`,
  );
}


export async function createWine(
  data: WineCreateInput,
): Promise<Wine> {
  return apiClient<Wine>(
    "/api/wines",
    {
      method: "POST",
      body: data,
    },
  );
}


export async function updateWine(
  wineId: number,
  data: WineUpdateInput,
): Promise<Wine> {
  return apiClient<Wine>(
    `/api/wines/${wineId}`,
    {
      method: "PATCH",
      body: data,
    },
  );
}


export async function createWineTransaction(
  wineId: number,
  data: InventoryTransactionCreateInput,
): Promise<Wine> {
  return apiClient<Wine>(
    `/api/wines/${wineId}/transactions`,
    {
      method: "POST",
      body: data,
    },
  );
}


export async function uploadWineImage(
  file: File,
): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<ImageUploadResponse>(
    "/api/images",
    {
      method: "POST",
      body: formData,
    },
  );
}


export async function deleteWine(
  wineId: number,
): Promise<void> {
  await apiClient<null>(
    `/api/wines/${wineId}`,
    {
      method: "DELETE",
    },
  );
}