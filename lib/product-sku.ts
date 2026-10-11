export function getSkuPrefix(category?: string | null, color?: string | null, size?: string | null) {
  return [category, color, size]
    .map((value) => (value ?? "").trim().toUpperCase().replace(/[^\p{L}\p{N}]/gu, "").slice(0, 14))
    .filter(Boolean)
    .join("-");
}

export function formatSku(prefix: string, suffix: string) {
  return [prefix, suffix].filter(Boolean).join("-");
}
