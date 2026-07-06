import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteWine,
  getWine,
  getWines,
} from "../api/winesApi";

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

  detail: (wineId: number) => [
    ...wineQueryKeys.all,
    "detail",
    wineId,
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

export function useWine(
  wineId: number,
) {
  return useQuery({
    queryKey: wineQueryKeys.detail(wineId),

    queryFn: () => getWine(wineId),
  });
}

export function useDeleteWine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (wineId: number) =>
      deleteWine(wineId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: wineQueryKeys.lists(),
      });
    },
  });
}