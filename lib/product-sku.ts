function cleanSkuPart(value?: string | null) {
  return (value ?? "").trim().toUpperCase().replace(/[^\p{L}\p{N}]/gu, "");
}

export function getCategorySkuCode(category?: string | null, categoryNames: string[] = []) {
  const name = cleanSkuPart(category);
  const others = categoryNames.map(cleanSkuPart).filter((other) => other !== name);
  let length = Math.min(3, name.length);
  while (length < Math.min(14, name.length) && others.some((other) => other.slice(0, length) === name.slice(0, length))) {
    length++;
  }
  return name.slice(0, length);
}

export function getSkuPrefix(category?: string | null, color?: string | null, size?: string | null, categoryNames: string[] = []) {
  return [getCategorySkuCode(category, categoryNames), cleanSkuPart(color).slice(0, 14), cleanSkuPart(size).slice(0, 14)]
    .filter(Boolean)
    .join("-");
}

export function formatSku(prefix: string, suffix: string) {
  return [prefix, suffix].filter(Boolean).join("-");
}
