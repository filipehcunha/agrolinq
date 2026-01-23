'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
    id: string;
    nome: string;
    preco: number;
    quantidade: number;
}

interface CartContextType {
    items: CartItem[];
    setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
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

    return (
        <CartContext.Provider value={{ items, setItems }}>
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



