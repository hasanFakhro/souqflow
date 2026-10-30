export function isLowStock(quantity: number, lowStockAt: number | null) {
  return quantity <= 0 || (lowStockAt !== null && quantity <= lowStockAt);
}
