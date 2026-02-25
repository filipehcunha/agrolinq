"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    id: string;
    nome: string;
    email: string;
    tipo: "consumidor" | "produtor" | "restaurante" | "admin";
    cpf?: string;
    cnpj?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window !== "undefined") {
            const savedUser = localStorage.getItem("agrolinq_user");
            if (savedUser) {
                try {
                    return JSON.parse(savedUser);
                } catch {
                    localStorage.removeItem("agrolinq_user");
                }
            }
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Use timeout to move state update out of the synchronous effect body
        // and avoid cascading render warnings during hydration.
        const timer = setTimeout(() => setIsLoading(false), 0);
        return () => clearTimeout(timer);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("agrolinq_user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("agrolinq_user");
        localStorage.removeItem("agrolinq_cart");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
