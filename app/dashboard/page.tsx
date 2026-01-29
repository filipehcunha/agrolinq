"use client";

import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

interface Produto {
    _id: string;
    nome: string;
    preco: number;
    categoria: string;
    estoque: number;
    unidade: string;
    imagemUrl?: string;
    produtorId: string;
}

interface Order {
    _id: string;
    status: "novo" | "em_separacao" | "enviado" | "concluido" | "cancelado";
    createdAt: string;
}

export default function DashboardPage() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriaFiltro, setCategoriaFiltro] = useState("");
    const [precoMaximo, setPrecoMaximo] = useState("");
    const { addItem, itemCount } = useCart();
    const [notification, setNotification] = useState("");

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders?consumidorId=consumidor_123");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error("Erro ao carregar pedidos", err);
        }
    };

    useEffect(() => {
        // Fetch products
        fetch("/api/products")
            .then(res => res.json())
            .then(data => {
                setProdutos(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao carregar produtos", err);
                setLoading(false);
            });

        // Initial fetch of orders
        fetchOrders();

        // Set up polling to check for order updates every 10 seconds
        const intervalId = setInterval(() => {
            fetchOrders();
        }, 10000); // 10 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const produtosFiltrados = useMemo(() => {
        return produtos.filter(p => {
            const matchCategoria = !categoriaFiltro || p.categoria.toLowerCase().includes(categoriaFiltro.toLowerCase());
            const matchPreco = !precoMaximo || p.preco <= parseFloat(precoMaximo);
            return matchCategoria && matchPreco;
        });
    }, [produtos, categoriaFiltro, precoMaximo]);

    const limparFiltros = () => {
        setCategoriaFiltro("");
        setPrecoMaximo("");
    };

    const handleAddToCart = (produto: Produto) => {
        addItem({
            produtoId: produto._id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1,
            imagemUrl: produto.imagemUrl,
            produtorId: produto.produtorId,
        });
        setNotification(`${produto.nome} adicionado ao carrinho!`);
        setTimeout(() => setNotification(""), 3000);
    };

    // Calculate order statistics
    const activeOrders = orders.filter(o => o.status !== "cancelado" && o.status !== "concluido");
    const updatedOrders = orders.filter(o =>
        o.status === "em_separacao" || o.status === "enviado"
    );

    const tiposDisponiveis = Array.from(new Set(produtos.map((p) => p.categoria)));
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold text-green-600">
                        <Link href="/">AGROLINQ</Link>
                    </h1>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                        Área do Consumidor
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/dashboard/pedidos" className="relative flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Pedidos
                        {updatedOrders.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {updatedOrders.length}
                            </span>
                        )}
                    </Link>
                    <Link href="/dashboard/carrinho" className="relative flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Carrinho
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                    <span className="text-sm text-gray-600 hidden md:inline">Bem-vindo(a), <span className="font-semibold">Consumidor</span></span>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border-2 border-green-200 shadow-inner">
                        C
                    </div>
                </div>
            </header>

            {notification && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
                    {notification}
                </div>
            )}

            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Portal do Consumidor</h2>
                            <p className="text-gray-500 text-sm">Encontre produtos frescos direto da fonte.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <Link href="/dashboard/pedidos" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-green-200 cursor-pointer">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500">Meus Pedidos</h3>
                                {updatedOrders.length > 0 && (
                                    <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {updatedOrders.length} {updatedOrders.length === 1 ? "atualização" : "atualizações"}
                                    </span>
                                )}
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                            <p className="text-xs text-gray-400 mt-2">
                                {activeOrders.length > 0
                                    ? `${activeOrders.length} ${activeOrders.length === 1 ? "pedido ativo" : "pedidos ativos"}`
                                    : "Nenhum pedido ativo"
                                }
                            </p>
                            {updatedOrders.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-sm text-orange-600 font-medium">
                                        🔔 {updatedOrders.length === 1 ? "Seu pedido foi atualizado!" : "Pedidos foram atualizados!"}
                                    </p>
                                </div>
                            )}
                        </Link>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md border-l-4 border-l-green-500">
                            <h3 className="font-bold text-gray-800 mb-2">Dica de hoje</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Consumir produtos da sua região ajuda a economia local e garante alimentos mais frescos na sua mesa!
                            </p>
                            <button className="text-green-600 text-sm font-bold mt-4 hover:underline">
                                Ver receitas da estação →
                            </button>
                        </div>
                    </div>

                    {/* Produtos Disponíveis */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Produtos Disponíveis</h3>
                        </div>

                        {/* Filtros */}
                        <div className="p-6 bg-gray-50 border-b border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                                    <select
                                        value={categoriaFiltro}
                                        onChange={(e) => setCategoriaFiltro(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Todas</option>
                                        {tiposDisponiveis.map((tipo) => (
                                            <option key={tipo} value={tipo}>
                                                {tipo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Preço Máximo (R$)</label>
                                    <input
                                        type="number"
                                        placeholder="Ex: 50.00"
                                        value={precoMaximo}
                                        onChange={(e) => setPrecoMaximo(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={limparFiltros}
                                        className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                                    >
                                        Limpar Filtros
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Produtos */}
                        <div className="p-6">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                    <p className="mt-2 text-gray-500">Carregando produtos...</p>
                                </div>
                            ) : produtosFiltrados.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-xl">
                                    <div className="inline-block p-4 rounded-full bg-white text-gray-400 mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
                                    <p className="text-gray-500 mt-1">Tente ajustar seus filtros de busca.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {produtosFiltrados.map((produto) => (
                                        <div key={produto._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                            <Link href={`/dashboard/produtos/${produto._id}`}>
                                                <div className="relative h-48 bg-gray-100 flex items-center justify-center cursor-pointer">
                                                    {produto.imagemUrl ? (
                                                        <img src={produto.imagemUrl} alt={produto.nome} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                    <span className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold rounded shadow-sm">
                                                        {produto.categoria}
                                                    </span>
                                                </div>
                                            </Link>
                                            <div className="p-4">
                                                <Link href={`/dashboard/produtos/${produto._id}`}>
                                                    <h4 className="font-bold text-gray-800 text-lg mb-1 hover:text-green-600 cursor-pointer">{produto.nome}</h4>
                                                </Link>
                                                <p className="text-sm text-gray-500 mb-3">Produtor Local</p>
                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Preço por {produto.unidade}</p>
                                                        <p className="text-xl font-bold text-green-600">R$ {produto.preco.toFixed(2)}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddToCart(produto)}
                                                        className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors shadow-sm"
                                                        aria-label="Adicionar ao carrinho"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
