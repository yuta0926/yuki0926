import { useQuery } from "@tanstack/react-query";

import { getPublicWine, getPublicWines } from "../api/publicWinesApi";

import type { WineCustomerSearchParams } from "../types/wine";


export const publicWineQueryKeys = {
  all: ["public-wines"] as const,

  lists: () => [
    ...publicWineQueryKeys.all,
    "list",
  ] as const,

  list: (params: WineCustomerSearchParams) => [
    ...publicWineQueryKeys.lists(),
    params,
  ] as const,

  detail: (wineId: number) => [
    ...publicWineQueryKeys.all,
    "detail",
    wineId,
  ] as const,
};


export function usePublicWines(
  params: WineCustomerSearchParams,
) {
  return useQuery({
    queryKey: publicWineQueryKeys.list(params),

    queryFn: () => getPublicWines(params),

    placeholderData: (previousData) => previousData,
  });
}


export function usePublicWine(
  wineId: number,
) {
  return useQuery({
    queryKey: publicWineQueryKeys.detail(wineId),

    queryFn: () => getPublicWine(wineId),
  });
}
