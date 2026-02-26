"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { formatCurrency, getAvatarInitials, getFallbackName } from "@/lib/formatters";

interface Produto {
    _id: string;
    nome: string;
    preco: number;
    categoria: string;
    estoque: number;
    unidade: string;
    imagemUrl?: string;
    produtorId: string;
    seloVerde?: boolean;
    distanciaKm?: number;
    nomeProdutor?: string;
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
    const { user, isLoading: authLoading } = useAuth();
    const [notification, setNotification] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Estados para proximidade
    const [ordenarProximidade, setOrdenarProximidade] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [localizando, setLocalizando] = useState(false);

    const fetchOrders = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/orders?consumidorId=${user.id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                console.error("Orders API did not return an array", data);
                setOrders([]);
            }
        } catch (err) {
            console.error("Erro ao carregar pedidos", err);
        }
    }, [user?.id]);

    const fetchProdutos = useCallback(async () => {
        setLoading(true);
        if (error) setError(null);
        try {
            let url = "/api/products";
            const params = new URLSearchParams();

            if (ordenarProximidade && userLocation) {
                url = "/api/products/nearby";
                params.append("lat", userLocation.lat.toString());
                params.append("lng", userLocation.lng.toString());
                params.append("radius", "100");
                if (categoriaFiltro) params.append("categoria", categoriaFiltro);
                if (precoMaximo) params.append("maxPrice", precoMaximo);
            }

            const queryString = params.toString();
            const finalUrl = queryString ? `${url}?${queryString}` : url;

            const res = await fetch(finalUrl);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `API Error ${res.status}`);
            }

            let produtosData = [];
            if (Array.isArray(data)) {
                produtosData = data;
            } else if (data && Array.isArray(data.produtos)) {
                produtosData = data.produtos;
            }

            setProdutos(produtosData);
        } catch (err) {
            console.error("Error fetching products", err);
            setError("Falha ao carregar produtos. Verifique sua conexão.");
            setProdutos([]);
        } finally {
            setLoading(false);
        }
    }, [ordenarProximidade, userLocation, categoriaFiltro, precoMaximo, error]);

    useEffect(() => {
        fetchProdutos();

        if (user?.id) {
            fetchOrders();
            const intervalId = setInterval(() => {
                fetchOrders();
            }, 10000);
            return () => clearInterval(intervalId);
        }
    }, [user?.id, fetchProdutos, fetchOrders]);

    const handleToggleProximidade = () => {
        if (!ordenarProximidade) {
            if (!userLocation) {
                setLocalizando(true);
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                        setOrdenarProximidade(true);
                        setLocalizando(false);
                    },
                    (error) => {
                        console.error("Erro ao obter localização:", error);
                        setNotification("Não foi possível obter sua localização.");
                        setTimeout(() => setNotification(""), 3000);
                        setLocalizando(false);
                    }
                );
            } else {
                setOrdenarProximidade(true);
            }
        } else {
            setOrdenarProximidade(false);
        }
    };

    const produtosFiltrados = useMemo(() => {
        if (ordenarProximidade && userLocation) return produtos;

        return produtos.filter(p => {
            const matchCategoria = !categoriaFiltro || p.categoria.toLowerCase().includes(categoriaFiltro.toLowerCase());
            const matchPreco = !precoMaximo || p.preco <= parseFloat(precoMaximo);
            return matchCategoria && matchPreco;
        });
    }, [produtos, categoriaFiltro, precoMaximo, ordenarProximidade, userLocation]);

    const limparFiltros = () => {
        setCategoriaFiltro("");
        setPrecoMaximo("");
        setOrdenarProximidade(false);
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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user?.tipo === 'restaurante' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user?.tipo === 'restaurante' ? 'Área Comercial' : 'Área do Consumidor'}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/dashboard/produtos" className="relative flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Produtos
                    </Link>
                    <Link href="/dashboard/pedidos" className="relative flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 0 -2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Pedidos
                        {updatedOrders.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {updatedOrders.length}
                            </span>
                        )}
                    </Link>
                    {user?.tipo === 'restaurante' && (
                        <Link href="/dashboard/restaurante/orcamentos" className="relative flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Orçamentos
                        </Link>
                    )}
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
                    <span className="text-sm text-gray-600 hidden md:inline">Bem-vindo(a), <span className="font-semibold">{getFallbackName(user?.nome, "Consumidor")}</span></span>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border-2 border-green-200 shadow-inner">
                        {getAvatarInitials(user?.nome || "")}
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
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                            <button onClick={fetchProdutos} className="text-sm font-bold underline hover:no-underline">Tentar novamente</button>
                        </div>
                    )}

                    {(authLoading || (loading && produtos.length === 0)) ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium">Carregando seu portal...</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            {user?.tipo === 'restaurante' ? 'Portal do Restaurante' : 'Portal do Consumidor'}
                                        </h2>
                                        <p className="text-gray-500 text-sm">
                                            {user?.tipo === 'restaurante'
                                                ? 'Abasteça seu estabelecimento com os melhores produtos locais.'
                                                : 'Encontre produtos frescos direto da fonte.'}
                                        </p>
                                    </div>
                                    {user?.tipo === 'restaurante' && (
                                        <div className="flex gap-3">
                                            <Link href="/dashboard/restaurante/perfil" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm hover:border-green-500 hover:text-green-600 transition-all flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Meu Perfil
                                            </Link>
                                            <Link href="/dashboard/restaurante/produtos" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 transition-all flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                Compras Atacado
                                            </Link>
                                        </div>
                                    )}
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

                                {user?.tipo === 'restaurante' ? (
                                    <Link href="/dashboard/restaurante/produtos" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md border-l-4 border-l-green-500 cursor-pointer">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-medium text-gray-500">Reposição Rápida</h3>
                                        </div>
                                        <p className="text-lg font-bold text-gray-900 leading-tight">Catálogo de Atacado & Orçamentos</p>
                                        <p className="text-xs text-gray-400 mt-2">Peça cotações em lote e otimize seu estoque.</p>
                                        <div className="mt-4 flex gap-2">
                                            <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded">Novo: Orçamentos em Lote</span>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md border-l-4 border-l-green-500">
                                        <h3 className="font-bold text-gray-800 mb-2">Dica de hoje</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Consumir produtos da sua região ajuda a economia local e garante alimentos mais frescos na sua mesa!
                                        </p>
                                        <button className="text-green-600 text-sm font-bold mt-4 hover:underline">
                                            Ver receitas da estação →
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Produtos Disponíveis */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800">Produtos Disponíveis</h3>
                                </div>

                                {/* Filtros */}
                                <div className="p-6 bg-gray-50 border-b border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                                            <select
                                                value={categoriaFiltro}
                                                onChange={(e) => setCategoriaFiltro(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm"
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={handleToggleProximidade}
                                                disabled={localizando}
                                                className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm border ${ordenarProximidade
                                                    ? "bg-green-100 border-green-200 text-green-700"
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {localizando ? (
                                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                )}
                                                {ordenarProximidade ? "Perto de você" : "Ordenar por Proximidade"}
                                            </button>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={limparFiltros}
                                                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors text-sm"
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
                                                <div key={produto._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow relative">
                                                    {produto.distanciaKm !== undefined && (
                                                        <div className="absolute top-2 left-2 z-10 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            </svg>
                                                            {produto.distanciaKm} km
                                                        </div>
                                                    )}
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
                                                        <div className="cursor-pointer">
                                                            <div className="flex items-center gap-1 mb-3">
                                                                <p className="text-sm text-gray-500 truncate">{produto.nomeProdutor || "Produtor Local"}</p>
                                                                {produto.seloVerde && (
                                                                    <span title="Produtor Certificado" className="text-green-600 shrink-0">
                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Link href={`/dashboard/produtos/${produto._id}`}>
                                                                <h3 className="font-bold text-gray-800 text-lg mb-1 hover:text-green-600 transition-colors line-clamp-1">{produto.nome}</h3>
                                                            </Link>
                                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                                <div>
                                                                    <p className="text-xs text-gray-500">Preço por {produto.unidade}</p>
                                                                    <p className="text-xl font-bold text-green-600">{formatCurrency(produto.preco)}</p>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleAddToCart(produto);
                                                                    }}
                                                                    className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
