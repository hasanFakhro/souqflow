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


export const useCartStore = create<CartState>(() => {
    return {
        items: []
    }
});

export function addItem(item: Omit<CartItem, "quantity">, { allowBeyondStock = false } = {}) {
    useCartStore.setState(state => {
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

export function removeItem(productId: string) {
    useCartStore.setState(state => {
        return {
            items: state.items.filter(i => i.productId !== productId)
        }
    })
}

export function incrementQuantity(productId: string, { allowBeyondStock = false } = {}) {
    useCartStore.setState(state => {
        return {
            items: state.items.map(i =>
                i.productId === productId
                    ? (allowBeyondStock || i.stock > i.quantity ? { ...i, quantity: i.quantity + 1 } : i)
                    : i
            )
        };
    });
}

export function decrementQuantity(productId: string) {
    const target = useCartStore.getState().items.find(i => i.productId === productId);
    if (target && target.quantity <= 1) {
        removeItem(productId);
        return;
    }
    useCartStore.setState(state => ({
        items: state.items.map(i =>
            i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
        )
    }));
}

export function clearCart() {
    useCartStore.setState({ items: [] });
}
