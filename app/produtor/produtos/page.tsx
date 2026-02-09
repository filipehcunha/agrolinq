"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Produto {
    _id: string;
    nome: string;
    preco: number;
    categoria: string;
    imagemUrl?: string;
    estoque: number;
    unidade: string;
}

export default function ProdutorProdutosPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editEstoque, setEditEstoque] = useState("");

    useEffect(() => {
        // Check if user is logged in and is a producer
        if (!user) {
            router.push('/login');
            return;
        }
        if (user.tipo !== 'produtor') {
            router.push('/dashboard');
            return;
        }
        fetchProdutos();
    }, [user, router]);

    const fetchProdutos = async () => {
        if (!user) return;

        try {
            const res = await fetch(`/api/products?produtorId=${user.id}`);
            const data = await res.json();
            setProdutos(data);
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEstoque = async (produtoId: string) => {
        try {
            const res = await fetch(`/api/products/${produtoId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estoque: Number(editEstoque) }),
            });

            if (res.ok) {
                await fetchProdutos();
                setEditingId(null);
                setEditEstoque("");
            }
        } catch (error) {
            console.error("Erro ao atualizar estoque:", error);
        }
    };

    const getStockStatus = (estoque: number) => {
        if (estoque === 0) return { label: "Esgotado", color: "bg-red-100 text-red-700" };
        if (estoque < 10) return { label: "Estoque Baixo", color: "bg-yellow-100 text-yellow-700" };
        return { label: "Em Estoque", color: "bg-green-100 text-green-700" };
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <h1 className="text-xl font-bold text-green-600">
                    <Link href="/produtor">AGROLINQ - Produtor</Link>
                </h1>
                <Link
                    href="/produtor/produtos/novo"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    + Novo Produto
                </Link>
            </header>

            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Meus Produtos</h1>
                    <Link href="/produtor" className="text-sm text-gray-500 hover:underline">
                        Voltar ao painel
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="mt-2 text-gray-500">Carregando produtos...</p>
                    </div>
                ) : produtos.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                        <div className="inline-block p-4 rounded-full bg-green-50 text-green-600 mb-4">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Nenhum produto cadastrado</h3>
                        <p className="text-gray-500 mt-1 mb-4">Comece cadastrando seu primeiro produto.</p>
                        <Link
                            href="/produtor/produtos/novo"
                            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
                        >
                            Cadastrar Produto
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {produtos.map((produto) => {
                            const stockStatus = getStockStatus(produto.estoque);
                            const isEditing = editingId === produto._id;

                            return (
                                <div
                                    key={produto._id}
                                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6"
                                >
                                    <div className="flex items-start gap-6">
                                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {produto.imagemUrl ? (
                                                <img src={produto.imagemUrl} alt={produto.nome} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg">{produto.nome}</h3>
                                                    <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                        {produto.categoria}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-green-600">R$ {produto.preco.toFixed(2)}</div>
                                                    <div className="text-xs text-gray-500">por {produto.unidade}</div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium text-gray-700">Estoque:</span>
                                                        <span className={`text-xs font-bold px-2 py-1 rounded ${stockStatus.color}`}>
                                                            {stockStatus.label}
                                                        </span>
                                                    </div>
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={editEstoque}
                                                                onChange={(e) => setEditEstoque(e.target.value)}
                                                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                                                placeholder={String(produto.estoque)}
                                                            />
                                                            <button
                                                                onClick={() => handleUpdateEstoque(produto._id)}
                                                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                                                            >
                                                                Salvar
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(null);
                                                                    setEditEstoque("");
                                                                }}
                                                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-gray-900">
                                                                {produto.estoque} {produto.unidade}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(produto._id);
                                                                    setEditEstoque(String(produto.estoque));
                                                                }}
                                                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                                                            >
                                                                Atualizar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
