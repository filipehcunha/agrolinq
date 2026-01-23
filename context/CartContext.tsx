'use client';

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useMemo,
} from 'react';

export interface CartItem {
  id: string; // interno, gerado pelo carrinho
  produtoId: string;
  produtorId: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagemUrl?: string;
}

export type AddCartItem = Omit<CartItem, 'id'>;

interface CartContextType {
      items: CartItem[];
      addItem: (item: AddCartItem) => void;
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

    const addItem = (item: AddCartItem) => {
          setItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex(
              (i) => i.produtoId === item.produtoId
            );
        
            // Caso 1: produto já está no carrinho → soma quantidade
            if (existingItemIndex !== -1) {
              const updatedItems = [...prevItems];
        
              updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantidade:
                  updatedItems[existingItemIndex].quantidade + item.quantidade,
              };
        
              return updatedItems;
    }

    // Caso 2: produto novo → cria item com id interno
    return [
      ...prevItems,
      {
        ...item,
        id: crypto.randomUUID(),
      },
    ];
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








