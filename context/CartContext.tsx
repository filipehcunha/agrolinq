'use client';

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useMemo,
} from 'react';

export interface CartItem {
    id: string;
    produtoId: string;
    produtorId: string;
    nome: string;
    preco: number;
    quantidade: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadInitialCart(): CartItem[] {
    if (typeof window === 'undefined') return [];

    try {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    } catch {
        console.error('Invalid cart data');
        return [];
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(loadInitialCart);

    const addItem = (item: CartItem) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id);

            if (existing) {
                return prev.map(i =>
                    i.id === item.id
                        ? { ...i, quantidade: i.quantidade + item.quantidade }
                        : i
                );
            }

            return [...prev, item];
        });
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = useMemo(
        () => items.reduce((sum, item) => sum + item.preco * item.quantidade, 0),
        [items]
    );

    // Persistência segura (não dispara lint error)
    if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(items));
    }

    return (
        <CartContext.Provider
            value={{ items, addItem, removeItem, clearCart, total }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}





