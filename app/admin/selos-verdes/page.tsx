"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface SeloVerde {
    _id: string;
    produtorId: string;
    status: 'pendente' | 'aprovado' | 'rejeitado';
    descricaoPraticas: string;
    createdAt: string;
    motivoRejeicao?: string;
}

export default function AdminSelosVerdesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [solicitacoes, setSolicitacoes] = useState<SeloVerde[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.tipo !== 'admin') {
            router.push('/login');
            return;
        }
        loadSolicitacoes();
    }, [user, router]);

    const loadSolicitacoes = async () => {
        try {
            const res = await fetchWithAuth('/api/selo-verde?status=pendente');
            const data = await res.json();
            setSolicitacoes(data);
        } catch (err) {
            console.error("Erro ao carregar solicitações:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAprovar = async (id: string) => {
        setActionLoading(id);
        try {
            const res = await fetchWithAuth(`/api/selo-verde/${id}/aprovar`, {
                method: 'PATCH'
            });

            if (res.ok) {
                alert('Selo verde aprovado com sucesso!');
                loadSolicitacoes();
            } else {
                const error = await res.json();
                alert(error.error || 'Erro ao aprovar selo');
            }
        } catch (err) {
            alert('Erro ao aprovar selo');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejeitar = async (id: string) => {
        const motivo = prompt('Motivo da rejeição:');
        if (!motivo) return;

        setActionLoading(id);
        try {
            const res = await fetchWithAuth(`/api/selo-verde/${id}/rejeitar`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motivoRejeicao: motivo })
            });

            if (res.ok) {
                alert('Solicitação rejeitada');
                loadSolicitacoes();
            } else {
                const error = await res.json();
                alert(error.error || 'Erro ao rejeitar');
            }
        } catch (err) {
            alert('Erro ao rejeitar');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-white rounded-full transition-all text-gray-500 hover:text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            🏅 Gerenciar Selos Verdes
                        </h1>
                        <p className="text-gray-600 mt-1">Aprovar ou rejeitar solicitações de certificação</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
                    </div>
                ) : solicitacoes.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl shadow-lg border border-gray-100 text-center">
                        <p className="text-gray-500 text-lg">Nenhuma solicitação pendente</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {solicitacoes.map((solicitacao) => (
                            <div key={solicitacao._id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">Produtor ID: {solicitacao.produtorId.slice(-8)}</h3>
                                        <p className="text-sm text-gray-500">{new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                                        Pendente
                                    </span>
                                </div>

                                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
                                    <h4 className="font-semibold text-gray-700 mb-2">Descrição das Práticas Sustentáveis:</h4>
                                    <p className="text-gray-700 text-sm">{solicitacao.descricaoPraticas}</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAprovar(solicitacao._id)}
                                        disabled={actionLoading === solicitacao._id}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === solicitacao._id ? 'Processando...' : '✅ Aprovar'}
                                    </button>
                                    <button
                                        onClick={() => handleRejeitar(solicitacao._id)}
                                        disabled={actionLoading === solicitacao._id}
                                        className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === solicitacao._id ? 'Processando...' : '❌ Rejeitar'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
