import { apiClient } from "../../../lib/apiClient";

import type {
  WineCustomer,
  WineCustomerListResponse,
  WineCustomerSearchParams,
} from "../types/wine";


function buildSearchParams(
  params: WineCustomerSearchParams,
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


export async function getPublicWines(
  params: WineCustomerSearchParams = {},
): Promise<WineCustomerListResponse> {
  const searchParams = buildSearchParams(params);
  const queryString = searchParams.toString();

  const path = queryString
    ? `/api/public/wines?${queryString}`
    : "/api/public/wines";

  return apiClient<WineCustomerListResponse>(path);
}


export async function getPublicWine(
  wineId: number,
): Promise<WineCustomer> {
  return apiClient<WineCustomer>(
    `/api/public/wines/${wineId}`,
  );
}
