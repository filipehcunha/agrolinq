"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
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
    nomeProdutor?: string;
    seloVerde?: boolean;
}

export default function RestaurantBulkProductsPage() {
    const { user } = useAuth();
    const { addItem } = useCart();
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState("");
    const [search, setSearch] = useState("");
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [notification, setNotification] = useState("");
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

    useEffect(() => {
        fetch("/api/products")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProdutos(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao carregar produtos:", err);
                setLoading(false);
            });
    }, []);

    const produtosFiltrados = useMemo(() => {
        return produtos.filter(p => {
            const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase());
            const matchTipo = !filtroTipo || p.categoria === filtroTipo;
            return matchSearch && matchTipo;
        });
    }, [produtos, search, filtroTipo]);

    const handleQuantityChange = (id: string, val: number) => {
        setQuantities({ ...quantities, [id]: Math.max(0, val) });
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === produtosFiltrados.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(produtosFiltrados.map(p => p._id)));
        }
    };

    const handleAddBulk = (produto: Produto) => {
        const qtde = quantities[produto._id] || 1;
        if (qtde <= 0) return;

        addItem({
            produtoId: produto._id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: qtde,
            imagemUrl: produto.imagemUrl,
            produtorId: produto.produtorId,
        });

        setNotification(`${qtde}x ${produto.nome} adicionados ao carrinho!`);
        setTimeout(() => setNotification(""), 3000);
    };

    const tiposDisponiveis = Array.from(new Set(produtos.map(p => p.categoria)));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="bg-green-600 text-white px-6 py-4 sticky top-0 z-20 shadow-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-green-700 rounded-full transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold uppercase tracking-tight">Catálogo de Atacado</h1>
                            <p className="text-xs text-green-100 font-medium">Focado em grandes volumes e reposição rápida</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 items-center gap-2 border border-white/20">
                            <svg className="w-4 h-4 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar produto..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-green-200 text-white"
                            />
                        </div>
                        <select
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            className="bg-white/10 backdrop-blur-sm border border-white/20 text-sm rounded-lg px-3 py-1 outline-none focus:ring-1 focus:ring-white text-white appearance-none cursor-pointer"
                        >
                            <option value="" className="text-gray-800">Todas Categorias</option>
                            {tiposDisponiveis.map(t => (
                                <option key={t} value={t} className="text-gray-800">{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {notification && (
                <div className="fixed top-20 right-6 bg-green-700 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce border-2 border-white/20 backdrop-blur-sm">
                    {notification}
                </div>
            )}

            <main className="max-w-7xl mx-auto p-6">
                <div className="bg-white border border-green-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-green-50 border-b border-green-100 font-bold text-green-800 text-sm">
                                    <th className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.size > 0 && selectedIds.size === produtosFiltrados.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-green-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-4">Produto</th>
                                    <th className="px-6 py-4">Categoria</th>
                                    <th className="px-6 py-4">Estoque Atual</th>
                                    <th className="px-6 py-4 text-right">Preço Unitário</th>
                                    <th className="px-6 py-4 w-48 text-center">Quantidade p/ Compra</th>
                                    <th className="px-6 py-4 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {produtosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic font-medium">
                                            Nenhum produto encontrado com os filtros selecionados.
                                        </td>
                                    </tr>
                                ) : (
                                    produtosFiltrados.map((p) => (
                                        <tr key={p._id} className={`hover:bg-green-50/30 transition-colors group ${selectedIds.has(p._id) ? 'bg-green-50/50' : ''}`}>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(p._id)}
                                                    onChange={() => toggleSelect(p._id)}
                                                    className="rounded border-green-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 group-hover:border-green-200 transition-colors">
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
                                                    <div>
                                                        <span className="font-bold text-gray-800 block group-hover:text-green-700 transition-colors uppercase text-sm tracking-tight">{p.nome}</span>
                                                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{p.unidade}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    {p.categoria}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${p.estoque > 50 ? 'bg-green-500' : p.estoque > 10 ? 'bg-orange-400' : 'bg-red-500'}`}></span>
                                                    <span className="text-sm font-semibold text-gray-600">{p.estoque} {p.unidade}s</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-gray-900 tabular-nums">R$ {p.preco.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white group-hover:border-green-200 transition-colors shadow-sm">
                                                    <button
                                                        onClick={() => handleQuantityChange(p._id, (quantities[p._id] || 1) - 1)}
                                                        className="px-3 py-1 bg-gray-50 hover:bg-green-100 text-gray-500 hover:text-green-700 border-right border-gray-200 transition-colors font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={quantities[p._id] || 1}
                                                        onChange={(e) => handleQuantityChange(p._id, parseInt(e.target.value) || 0)}
                                                        className="w-16 text-center text-sm font-black text-green-800 border-none outline-none [-webkit-appearance:none] [-moz-appearance:textfield]"
                                                    />
                                                    <button
                                                        onClick={() => handleQuantityChange(p._id, (quantities[p._id] || 1) + 1)}
                                                        className="px-3 py-1 bg-gray-50 hover:bg-green-100 text-gray-500 hover:text-green-700 border-left border-gray-200 transition-colors font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleAddBulk(p)}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-black py-2 px-4 rounded-lg text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95 border-b-4 border-green-800"
                                                >
                                                    Adicionar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row justify-between items-center p-8 bg-green-50 border border-green-100 rounded-2xl gap-6">
                    <div>
                        <h3 className="font-black text-green-900 uppercase tracking-tight text-lg mb-1">Precisa de quantidades maiores?</h3>
                        <p className="text-sm text-green-700 font-medium">Entre em contato direto com os produtores para negociar contratos de médio/longo prazo.</p>
                    </div>
                    <Link href="/dashboard/mensagens" className="bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 text-xs">
                        Enviar Mensagem
                    </Link>
                </div>
            </main>

            {/* Floating Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-40 border border-green-700/50 backdrop-blur-md flex items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex flex-col">
                        <span className="text-sm font-black uppercase tracking-widest text-green-300">{selectedIds.size} Itens selecionados</span>
                        <span className="text-[10px] font-medium text-green-100/70 uppercase">Pronto para solicitar orçamento</span>
                    </div>
                    <div className="h-8 w-px bg-green-700/50"></div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-wider hover:text-green-300 transition-colors"
                        >
                            Limpar
                        </button>
                        <button
                            onClick={() => setShowQuoteModal(true)}
                            className="bg-green-500 hover:bg-green-400 text-green-950 px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            Solicitar Orçamento
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Quote Review Modal */}
            {showQuoteModal && (
                <div className="fixed inset-0 bg-green-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="bg-green-600 p-6 text-white flex justify-between items-center bg-gradient-to-r from-green-600 to-emerald-600">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Revisar Solicitação de Orçamento</h2>
                                <p className="text-[10px] text-green-100 uppercase font-black tracking-widest mt-1">Sua mensagem será enviada para os produtores selecionados</p>
                            </div>
                            <button onClick={() => setShowQuoteModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="space-y-6">
                                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-4">
                                    <div className="p-3 bg-green-600 rounded-xl text-white">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-green-800 font-medium">Os produtores receberão sua lista de produtos e entrarão em contato com propostas personalizadas de preço e frete.</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Itens Selecionados</h3>
                                    <div className="divide-y divide-gray-100">
                                        {produtos.filter(p => selectedIds.has(p._id)).map(p => (
                                            <div key={p._id} className="py-4 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex-shrink-0 border border-gray-100 overflow-hidden">
                                                        {p.imagemUrl ? <img src={p.imagemUrl} alt={p.nome} className="w-full h-full object-cover" /> : null}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-800 text-sm uppercase block line-clamp-1">{p.nome}</span>
                                                        <span className="text-[10px] text-gray-400 font-black uppercase">{p.categoria}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm font-black text-green-700">{quantities[p._id] || 1} {p.unidade}s</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">Quant. solicitada</span>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleSelect(p._id)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                            <button
                                onClick={() => setShowQuoteModal(false)}
                                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-500 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={isSubmittingQuote || selectedIds.size === 0}
                                onClick={async () => {
                                    setIsSubmittingQuote(true);
                                    try {
                                        const quoteData = {
                                            solicitanteId: user?.id,
                                            itens: produtos
                                                .filter(p => selectedIds.has(p._id))
                                                .map(p => ({
                                                    produtoId: p._id,
                                                    nome: p.nome,
                                                    quantidade: quantities[p._id] || 1
                                                }))
                                        };

                                        const res = await fetch('/api/propostas', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(quoteData)
                                        });

                                        if (res.ok) {
                                            setNotification("Solicitação de orçamento enviada com sucesso!");
                                            setSelectedIds(new Set());
                                            setShowQuoteModal(false);
                                            setTimeout(() => setNotification(""), 3000);
                                        } else {
                                            alert("Erro ao enviar orçamento");
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert("Falha na conexão");
                                    } finally {
                                        setIsSubmittingQuote(false);
                                    }
                                }}
                                className="flex-2 bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                            >
                                {isSubmittingQuote ? 'Enviando...' : 'Confirmar e Enviar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
