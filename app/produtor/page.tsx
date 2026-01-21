"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Produto {
    _id: string;
    nome: string;
    preco: number;
    categoria: string;
    estoque: number;
    unidade: string;
    imagemUrl?: string;
}

function MeusProdutosTable() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock produtorId for MVP
        fetch("/api/products?produtorId=produtor_123")
            .then(res => res.json())
            .then(data => {
                setProdutos(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao carregar produtos do produtor", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Meus Produtos</h3>
                <Link
                    href="/produtor/produtos/novo"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Novo Produto
                </Link>
            </div>
            <div className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="pb-4 font-medium text-gray-500 text-sm">Produto</th>
                                <th className="pb-4 font-medium text-gray-500 text-sm">Categoria</th>
                                <th className="pb-4 font-medium text-gray-500 text-sm">Preço</th>
                                <th className="pb-4 font-medium text-gray-500 text-sm">Estoque</th>
                                <th className="pb-4 font-medium text-gray-500 text-sm text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400">Carregando...</td>
                                </tr>
                            ) : produtos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400">Nenhum produto cadastrado.</td>
                                </tr>
                            ) : (
                                produtos.map((p) => (
                                    <tr key={p._id} className="hover:bg-green-50/50 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {p.imagemUrl ? (
                                                        <img src={p.imagemUrl} alt={p.nome} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-800">{p.nome}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm text-gray-600">{p.categoria}</td>
                                        <td className="py-4 text-sm font-medium text-gray-800">R$ {p.preco.toFixed(2)} / {p.unidade}</td>
                                        <td className="py-4 text-sm text-gray-600">{p.estoque} {p.unidade}</td>
                                        <td className="py-4 text-right">
                                            <button className="text-gray-400 hover:text-green-600 transition-colors p-1" title="Editar (Em breve)">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function ProdutorDashboard() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold text-green-600">
                        <Link href="/">AGROLINQ</Link>
                    </h1>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                        Área do Produtor
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 hidden md:inline">Bem-vindo(a), <span className="font-semibold">Produtor</span></span>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border-2 border-green-200 shadow-inner">
                        P
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Painel do Produtor</h2>
                        <p className="text-gray-500 text-sm">Gerencie seus produtos, vendas e entregas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500">Total de Vendas</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">R$ 1.250,00</p>
                            <p className="text-xs text-green-600 mt-2 font-medium">+15% em relação ao mês anterior</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500">Pedidos Ativos</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">3</p>
                            <p className="text-xs text-gray-400 mt-2">2 em separação</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500">Mensagens</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">5</p>
                            <p className="text-xs text-green-500 mt-2 font-medium">2 novas mensagens</p>
                        </div>
                    </div>

                    <MeusProdutosTable />
                </div>
            </main>
        </div>
    );
}
