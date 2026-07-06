export function formatPrice(
  value: number | null,
): string {
  if (value === null) {
    return "-";
  }

  return `¥${value.toLocaleString(
    "ja-JP",
  )}`;
}
