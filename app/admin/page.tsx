"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface Metrics {
    totalUsuarios: number;
    totalProdutos: number;
    totalPedidos: number;
    receitaTotal: number;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (user.tipo !== 'admin') {
            router.push('/dashboard');
            return;
        }

        fetchWithAuth('/api/admin/relatorios')
            .then(res => res.json())
            .then(data => {
                setMetrics(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao carregar métricas:", err);
                setLoading(false);
            });
    }, [user, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        🛡️ Painel Administrativo
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Olá, <span className="font-semibold">{user?.nome}</span></span>
                        <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Sair
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* Quick Stats */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Total Usuários</p>
                                        <p className="text-3xl font-bold text-gray-800">{metrics?.totalUsuarios || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Total Produtos</p>
                                        <p className="text-3xl font-bold text-gray-800">{metrics?.totalProdutos || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Total Pedidos</p>
                                        <p className="text-3xl font-bold text-gray-800">{metrics?.totalPedidos || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Receita Total</p>
                                        <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                            R$ {(metrics?.receitaTotal || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Link href="/admin/selos-verdes" className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all group">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="text-3xl">🏅</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Selos Verdes</h3>
                                <p className="text-gray-600">Aprovar e gerenciar solicitações de certificação sustentável</p>
                            </Link>

                            <Link href="/admin/relatorios" className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all group">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="text-3xl">📊</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Relatórios</h3>
                                <p className="text-gray-600">Visualizar estatísticas e relatórios detalhados</p>
                            </Link>

                            <Link href="/admin/usuarios" className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all group">
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="text-3xl">👥</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Usuários</h3>
                                <p className="text-gray-600">Gerenciar consumidores, produtores e restaurantes</p>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
