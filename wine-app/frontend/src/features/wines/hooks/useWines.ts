import { useQuery } from "@tanstack/react-query";

import { getWines } from "../api/winesApi";

import type {
  WineSearchParams,
} from "../types/wine";

export const wineQueryKeys = {
  all: ["wines"] as const,

  lists: () => [
    ...wineQueryKeys.all,
    "list",
  ] as const,

  list: (params: WineSearchParams) => [
    ...wineQueryKeys.lists(),
    params,
  ] as const,
};

export function useWines(
  params: WineSearchParams,
) {
  return useQuery({
    queryKey: wineQueryKeys.list(params),

    queryFn: () => getWines(params),

    // ページ切替中に前ページのデータを一時表示する
    placeholderData: (previousData) =>
      previousData,
  });
}