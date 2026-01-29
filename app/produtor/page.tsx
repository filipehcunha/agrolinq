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

interface Order {
    _id: string;
    status: string;
    total: number;
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
                                            <Link href="/produtor/produtos" className="text-green-600 hover:text-green-700 transition-colors p-1 text-sm font-medium">
                                                Gerenciar
                                            </Link>
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
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showSeloVerdeModal, setShowSeloVerdeModal] = useState(false);

    useEffect(() => {
        // Fetch real orders data
        fetch("/api/orders?produtorId=produtor_123")
            .then(res => res.json())
            .then(data => {
                setOrders(data);
                setLoadingOrders(false);
            })
            .catch(err => {
                console.error("Erro ao carregar pedidos:", err);
                setLoadingOrders(false);
            });
    }, []);

    const newOrdersCount = orders.filter(o => o.status === "novo").length;
    const activeOrdersCount = orders.filter(o => o.status === "novo" || o.status === "em_separacao").length;
    const totalSales = orders.reduce((acc, order) => acc + order.total, 0);

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
                    {newOrdersCount > 0 && (
                        <Link
                            href="/produtor/pedidos"
                            className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-red-600 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {newOrdersCount} {newOrdersCount === 1 ? "novo pedido" : "novos pedidos"}
                        </Link>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                        >
                            <span className="text-sm text-gray-600 hidden md:inline">Bem-vindo(a), <span className="font-semibold">Produtor</span></span>
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border-2 border-green-200 shadow-inner">
                                P
                            </div>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                <Link
                                    href="/produtor/produtos"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    Meus Produtos
                                </Link>
                                <Link
                                    href="/produtor/pedidos"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Meus Pedidos
                                    {newOrdersCount > 0 && (
                                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {newOrdersCount}
                                        </span>
                                    )}
                                </Link>
                                <button
                                    onClick={() => {
                                        setShowSeloVerdeModal(true);
                                        setMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="flex-1 text-left">Solicitar Selo Verde</span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Novo</span>
                                </button>
                                <div className="border-t border-gray-100 my-2"></div>
                                <Link
                                    href="/produtor/produtos/novo"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Novo Produto
                                </Link>
                                <div className="border-t border-gray-100 my-2"></div>
                                <Link
                                    href="/"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sair
                                </Link>
                            </div>
                        )}
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
                            <p className="text-3xl font-bold text-gray-900">
                                {loadingOrders ? "..." : `R$ ${totalSales.toFixed(2)}`}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">{orders.length} {orders.length === 1 ? "pedido" : "pedidos"} no total</p>
                        </div>

                        <Link href="/produtor/pedidos" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-pointer">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500">Pedidos Ativos</h3>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-gray-900">
                                    {loadingOrders ? "..." : activeOrdersCount}
                                </p>
                                {newOrdersCount > 0 && (
                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                                        {newOrdersCount} novo{newOrdersCount > 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Clique para ver detalhes</p>
                        </Link>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500">Produtos Ativos</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">-</p>
                            <p className="text-xs text-gray-400 mt-2">Veja na tabela abaixo</p>
                        </div>
                    </div>

                    <MeusProdutosTable />
                </div>
            </main>

            {/* Green Seal Modal */}
            {showSeloVerdeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Selo Verde AgroLinq</h2>
                                        <p className="text-green-100 text-sm">Certificação de Produção Sustentável</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSeloVerdeModal(false)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Benefits */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Benefícios do Selo Verde</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">Destaque Visual</p>
                                            <p className="text-xs text-gray-600">Seus produtos aparecem com selo verde</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">Mais Confiança</p>
                                            <p className="text-xs text-gray-600">Consumidores preferem produtos certificados</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">Prioridade nas Buscas</p>
                                            <p className="text-xs text-gray-600">Apareça primeiro para consumidores</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">Melhores Preços</p>
                                            <p className="text-xs text-gray-600">Produtos sustentáveis valem mais</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Requirements */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h3 className="text-sm font-bold text-blue-900 mb-2">📋 Requisitos para Certificação</h3>
                                <ul className="space-y-1 text-sm text-blue-800">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        <span>Produção orgânica ou práticas sustentáveis comprovadas</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        <span>Documentação de certificações (se houver)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        <span>Fotos da propriedade e processo produtivo</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        <span>Análise e aprovação pela equipe AgroLinq (2-5 dias úteis)</span>
                                    </li>
                                </ul>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSeloVerdeModal(false)}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={() => {
                                        alert("Funcionalidade em desenvolvimento! Em breve você poderá enviar sua solicitação de certificação.");
                                        setShowSeloVerdeModal(false);
                                    }}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Solicitar Certificação
                                </button>
                            </div>

                            {/* Note */}
                            <p className="text-xs text-gray-500 text-center mt-4">
                                💡 A certificação é <strong>gratuita</strong> e válida por 1 ano
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
