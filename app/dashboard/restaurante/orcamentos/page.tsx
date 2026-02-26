"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Proposta {
    _id: string;
    itens: {
        produtoId: string;
        nome: string;
        quantidade: number;
    }[];
    status: string;
    respostas?: {
        produtorId: string;
        precoTotal: number;
        observacao?: string;
        respondidoEm: string;
    }[];
    createdAt: string;
}

export default function RestaurantQuotesPage() {
    const { user } = useAuth();
    const [propostas, setPropostas] = useState<Proposta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        fetch(`/api/propostas?solicitanteId=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPropostas(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao buscar propostas:", err);
                setLoading(false);
            });
    }, [user?.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "solicitada": return "bg-blue-100 text-blue-700 border-blue-200";
            case "respondida": return "bg-green-100 text-green-700 border-green-200";
            case "aceita": return "bg-emerald-600 text-white border-emerald-700";
            case "recusada": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <Link href="/dashboard" className="text-sm font-black uppercase tracking-widest text-green-600 hover:text-green-700 transition-colors flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Voltar ao Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Meus Orçamentos</h1>
                        <p className="text-slate-500 font-medium">Acompanhe suas solicitações de compra em lote</p>
                    </div>
                    <Link href="/dashboard/restaurante/produtos" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-green-200 transition-all active:scale-95 text-center">
                        Nova Solicitação
                    </Link>
                </header>

                <div className="grid gap-6">
                    {propostas.length === 0 ? (
                        <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase">Nenhum orçamento solicitado</h2>
                            <p className="text-slate-400 font-medium mt-2">Seus orçamentos para compras em lote aparecerão aqui.</p>
                        </div>
                    ) : (
                        propostas.map((prop) => (
                            <div key={prop._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-8">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID da Solicitação</span>
                                                <span className="font-mono text-sm font-bold text-slate-600">#{prop._id.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(prop.status)}`}>
                                                {prop.status}
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data do Pedido</span>
                                            <span className="font-bold text-slate-900">{new Date(prop.createdAt).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Lista de Produtos</h3>
                                        <div className="flex flex-wrap gap-x-8 gap-y-4">
                                            {prop.itens.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <span className="text-sm font-bold text-slate-800 uppercase">{item.quantidade}x</span>
                                                    <span className="text-sm font-medium text-slate-600 uppercase tracking-tight">{item.nome}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {prop.respostas && prop.respostas.length > 0 ? (
                                        <div className="space-y-4 mt-8">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Respostas dos Produtores ({prop.respostas.length})
                                            </h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {prop.respostas.map((resp, idx) => (
                                                    <div key={idx} className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-tighter">Estimativa de Preço</span>
                                                                <span className="text-2xl font-black text-emerald-950 tabular-nums">R$ {resp.precoTotal.toFixed(2)}</span>
                                                            </div>
                                                            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                                                                Aceitar
                                                            </button>
                                                        </div>
                                                        {resp.observacao && (
                                                            <p className="text-xs text-emerald-700 italic border-l-2 border-emerald-200 pl-3 py-1 font-medium bg-white/40 rounded-r-lg">
                                                                &quot;{resp.observacao}&quot;
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-slate-400 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 border-dashed">
                                            <div className="w-2 h-2 rounded-full bg-slate-200 animate-pulse"></div>
                                            <p className="text-xs font-bold uppercase tracking-widest">Aguardando cotações dos produtores...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
