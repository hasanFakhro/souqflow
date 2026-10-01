const catalogSlugSeparator = "--";

export function createCatalogPathSegment(
  name: string | null | undefined,
  userId: string
) {
  const nameSlug = (name ?? "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return `${nameSlug || "store"}${catalogSlugSeparator}${userId}`;
}

export function getCatalogSellerId(pathSegment: string) {
  const separatorIndex = pathSegment.lastIndexOf(catalogSlugSeparator);

  if (separatorIndex === -1) {
    return pathSegment;
  }

  return pathSegment.slice(separatorIndex + catalogSlugSeparator.length) || pathSegment;
}
