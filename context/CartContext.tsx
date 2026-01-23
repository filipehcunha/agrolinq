
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface CartItem {
    produtoId: string;
    nome: string;
    preco: number;
    quantidade: number;
    imagemUrl?: string;
    produtorId: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (produtoId: string) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
    
        if (!savedCart) return;
    
        try {
            const parsed = JSON.parse(savedCart);
            setItems(() => parsed);
        } catch {
            console.error('Failed to parse cart from local storage');
        }
    }, []);


    // Save to localStorage whenever items change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("agrolinq_cart", JSON.stringify(items));
        }
    }, [items, isLoaded]);
    const addItem = (newItem: CartItem) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.produtoId === newItem.produtoId);
            if (existing) {
                return prev.map((i) =>
                    i.produtoId === newItem.produtoId
                        ? { ...i, quantidade: i.quantidade + newItem.quantidade }
                        : i
                );
            }
            return [...prev, newItem];
        });
    };

    const removeItem = (produtoId: string) => {
        setItems((prev) => prev.filter((i) => i.produtoId !== produtoId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    const itemCount = items.reduce((acc, item) => acc + item.quantidade, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, itemCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

