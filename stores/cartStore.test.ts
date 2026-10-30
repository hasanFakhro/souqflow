import assert from "node:assert/strict";
import test from "node:test";
import { addItem, incrementQuantity, decrementQuantity, clearCart, getCartStore } from "./cartStore";

const item = { productId: "product-1", name: "Coffee", unitPrice: 5, costPrice: 2, category: null, stock: 2 };

test("catalog carts stay separate from other sellers and the seller dashboard", () => {
  clearCart(); clearCart("catalog:a"); clearCart("catalog:b");
  addItem(item, { scope: "catalog:a" });
  addItem({ ...item, name: "Other store" }, { scope: "catalog:b" });
  incrementQuantity(item.productId, { scope: "catalog:a" });
  assert.equal(getCartStore("catalog:a").getState().items[0].quantity, 2);
  assert.equal(getCartStore("catalog:b").getState().items[0].quantity, 1);
  assert.equal(getCartStore().getState().items.length, 0);
  clearCart("catalog:a");
  assert.equal(getCartStore("catalog:b").getState().items.length, 1);
});

test("manual carts enforce stock limits while customer requests can exceed stock", () => {
  clearCart(); clearCart("catalog:requests");
  addItem(item); incrementQuantity(item.productId); incrementQuantity(item.productId);
  assert.equal(getCartStore().getState().items[0].quantity, 2);
  addItem({ ...item, stock: 0 }, { scope: "catalog:requests", allowBeyondStock: true });
  incrementQuantity(item.productId, { scope: "catalog:requests", allowBeyondStock: true });
  assert.equal(getCartStore("catalog:requests").getState().items[0].quantity, 2);
  decrementQuantity(item.productId, "catalog:requests");
  decrementQuantity(item.productId, "catalog:requests");
  assert.equal(getCartStore("catalog:requests").getState().items.length, 0);
  assert.equal(getCartStore().getState().items.length, 1);
});
