import { create } from "zustand";

export type CartItem = {
    productId: string;
    name: string;
    price: number;
    category: string;
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

export function addItem(item: Omit<CartItem,"quantity" >) {
    useCartStore.setState(state => {
        const existing = state.items.find(i => item.productId === i.productId);
        if (existing) {
            return {
                items: state.items.map(i => item.productId === i.productId ? { ...i, quantity: i.quantity + 1 } : i)
            }
        }
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

export function incrementQuantity(productId: string) {
    useCartStore.setState(state => {
        return {
            items: state.items.map(i =>
                i.productId === productId
                    ? (i.stock > i.quantity ? { ...i, quantity: i.quantity + 1 } : i)
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

export function clearCart(){
    useCartStore.setState({items:[]});
}
