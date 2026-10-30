function cleanSkuPart(value?: string | null) {
  return (value ?? "").trim().toUpperCase().replace(/[^\p{L}\p{N}]/gu, "");
}

export function getCategorySkuCode(category?: string | null, length = 3) {
  return cleanSkuPart(category).slice(0, Math.min(14, Math.max(3, length)));
}

export function getSkuPrefix(category?: string | null, color?: string | null, size?: string | null, categoryLength = 3) {
  return [getCategorySkuCode(category, categoryLength), cleanSkuPart(color).slice(0, 14), cleanSkuPart(size).slice(0, 14)]
    .filter(Boolean)
    .join("-");
}

export function formatSku(prefix: string, suffix: string) {
  return [prefix, suffix].filter(Boolean).join("-");
}

export async function findAvailableSku(
  category: string | null,
  color: string | null,
  size: string | null,
  suffix: string,
  isTaken: (sku: string) => Promise<boolean>,
) {
  const maxLength = Math.max(3, getCategorySkuCode(category, 14).length);
  for (let length = 3; length <= maxLength; length++) {
    const sku = formatSku(getSkuPrefix(category, color, size, length), suffix);
    if (!(await isTaken(sku))) return sku;
  }
  return null;
}
