import { create } from "zustand";

export type CartItem = {
    productId: string;
    name: string;
    unitPrice: number;
    costPrice: number;
    category: string | null;
    quantity: number;
    stock: number;
}

type CartState = {
    items: CartItem[];
}


const carts = new Map<string, ReturnType<typeof createCartStore>>();
function createCartStore() {
    return create<CartState>(() => ({ items: [] }));
}
export function getCartStore(scope = "manual") {
    let cart = carts.get(scope);
    if (!cart) { cart = createCartStore(); carts.set(scope, cart); }
    return cart;
}
export function useCartStore<T>(selector: (state: CartState) => T, scope = "manual") {
    return getCartStore(scope)(selector);
}

export function addItem(item: Omit<CartItem, "quantity">, { allowBeyondStock = false, scope = "manual" } = {}) {
    getCartStore(scope).setState(state => {
        const existing = state.items.find(i => i.productId === item.productId);
        if (existing) {
            if (!allowBeyondStock && existing.quantity >= existing.stock) return state;
            return {
                items: state.items.map(i =>
                    i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
                ),
            };
        }
        if (!allowBeyondStock && item.stock <= 0) return state;
        return { items: [...state.items, { ...item, quantity: 1 }] };
    });
}

export function removeItem(productId: string, scope = "manual") {
    getCartStore(scope).setState(state => {
        return {
            items: state.items.filter(i => i.productId !== productId)
        }
    })
}

export function incrementQuantity(productId: string, { allowBeyondStock = false, scope = "manual" } = {}) {
    getCartStore(scope).setState(state => {
        return {
            items: state.items.map(i =>
                i.productId === productId
                    ? (allowBeyondStock || i.stock > i.quantity ? { ...i, quantity: i.quantity + 1 } : i)
                    : i
            )
        };
    });
}

export function decrementQuantity(productId: string, scope = "manual") {
    const target = getCartStore(scope).getState().items.find(i => i.productId === productId);
    if (target && target.quantity <= 1) {
        removeItem(productId, scope);
        return;
    }
    getCartStore(scope).setState(state => ({
        items: state.items.map(i =>
            i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
        )
    }));
}

export function clearCart(scope = "manual") {
    getCartStore(scope).setState({ items: [] });
}
