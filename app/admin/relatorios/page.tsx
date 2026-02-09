"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface PedidosReport {
    pedidosPorStatus: { _id: string; count: number; totalReceita: number }[];
    totalPedidos: number;
    receitaTotal: number;
}

interface ProdutoresSeloVerdeReport {
    totalProdutores: number;
    produtoresComSeloVerde: number;
    percentual: string;
    produtores: { id: string; nome: string; nomeFazenda: string; aprovadoEm: string }[];
}

interface UsuariosReport {
    consumidores: number;
    produtores: number;
    restaurantes: number;
    total: number;
}

export default function AdminRelatoriosPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [tipoRelatorio, setTipoRelatorio] = useState<string>("");
    const [pedidosData, setPedidosData] = useState<PedidosReport | null>(null);
    const [seloVerdeData, setSeloVerdeData] = useState<ProdutoresSeloVerdeReport | null>(null);
    const [usuariosData, setUsuariosData] = useState<UsuariosReport | null>(null);

    useEffect(() => {
        if (!user || user.tipo !== 'admin') {
            router.push('/login');
            return;
        }
    }, [user, router]);

    const carregarRelatorio = async (tipo: string) => {
        setLoading(true);
        setTipoRelatorio(tipo);

        try {
            const res = await fetchWithAuth(`/api/admin/relatorios?tipo=${tipo}`);
            const data = await res.json();

            if (tipo === 'pedidos') {
                setPedidosData(data);
            } else if (tipo === 'produtores-selo-verde') {
                setSeloVerdeData(data);
            } else if (tipo === 'usuarios') {
                setUsuariosData(data);
            }
        } catch (err) {
            console.error("Erro ao carregar relatório:", err);
        } finally {
            setLoading(false);
        }
    };

    const statusLabels: Record<string, string> = {
        novo: "Novos",
        em_separacao: "Em Separação",
        enviado: "Enviados",
        concluido: "Concluídos",
        cancelado: "Cancelados"
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-white rounded-full transition-all text-gray-500 hover:text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            📊 Relatórios
                        </h1>
                        <p className="text-gray-600 mt-1">Visualize estatísticas detalhadas do sistema</p>
                    </div>
                </div>

                {/* Seletor de Relatórios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => carregarRelatorio('pedidos')}
                        className={`p-6 rounded-2xl shadow-md border transition-all ${tipoRelatorio === 'pedidos'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-800 border-gray-100 hover:shadow-lg hover:border-blue-200'
                            }`}
                    >
                        <div className="text-3xl mb-2">📦</div>
                        <h3 className="font-bold text-lg">Pedidos</h3>
                        <p className={`text-sm mt-1 ${tipoRelatorio === 'pedidos' ? 'text-blue-100' : 'text-gray-500'}`}>
                            Status e receita
                        </p>
                    </button>

                    <button
                        onClick={() => carregarRelatorio('produtores-selo-verde')}
                        className={`p-6 rounded-2xl shadow-md border transition-all ${tipoRelatorio === 'produtores-selo-verde'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-gray-800 border-gray-100 hover:shadow-lg hover:border-green-200'
                            }`}
                    >
                        <div className="text-3xl mb-2">🏅</div>
                        <h3 className="font-bold text-lg">Selos Verdes</h3>
                        <p className={`text-sm mt-1 ${tipoRelatorio === 'produtores-selo-verde' ? 'text-green-100' : 'text-gray-500'}`}>
                            Produtores certificados
                        </p>
                    </button>

                    <button
                        onClick={() => carregarRelatorio('usuarios')}
                        className={`p-6 rounded-2xl shadow-md border transition-all ${tipoRelatorio === 'usuarios'
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-800 border-gray-100 hover:shadow-lg hover:border-purple-200'
                            }`}
                    >
                        <div className="text-3xl mb-2">👥</div>
                        <h3 className="font-bold text-lg">Usuários</h3>
                        <p className={`text-sm mt-1 ${tipoRelatorio === 'usuarios' ? 'text-purple-100' : 'text-gray-500'}`}>
                            Distribuição por tipo
                        </p>
                    </button>
                </div>

                {/* Conteúdo dos Relatórios */}
                {loading ? (
                    <div className="bg-white p-12 rounded-2xl shadow-lg text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Carregando relatório...</p>
                    </div>
                ) : (
                    <>
                        {/* Relatório de Pedidos */}
                        {tipoRelatorio === 'pedidos' && pedidosData && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                        <h3 className="font-bold text-gray-700 mb-4">Total de Pedidos</h3>
                                        <p className="text-4xl font-bold text-blue-600">{pedidosData.totalPedidos}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                        <h3 className="font-bold text-gray-700 mb-4">Receita Total</h3>
                                        <p className="text-4xl font-bold text-green-600">R$ {pedidosData.receitaTotal.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-4">Pedidos por Status</h3>
                                    <div className="space-y-3">
                                        {pedidosData.pedidosPorStatus.map((item) => (
                                            <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{statusLabels[item._id] || item._id}</p>
                                                    <p className="text-sm text-gray-500">{item.count} pedido(s)</p>
                                                </div>
                                                <p className="text-lg font-bold text-green-600">R$ {item.totalReceita.toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Relatório de Selo Verde */}
                        {tipoRelatorio === 'produtores-selo-verde' && seloVerdeData && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                        <h3 className="font-bold text-gray-700 mb-4">Total Produtores</h3>
                                        <p className="text-4xl font-bold text-gray-800">{seloVerdeData.totalProdutores}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                        <h3 className="font-bold text-gray-700 mb-4">Com Selo Verde</h3>
                                        <p className="text-4xl font-bold text-green-600">{seloVerdeData.produtoresComSeloVerde}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                        <h3 className="font-bold text-gray-700 mb-4">Percentual</h3>
                                        <p className="text-4xl font-bold text-emerald-600">{seloVerdeData.percentual}%</p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-4">Produtores Certificados</h3>
                                    {seloVerdeData.produtores.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">Nenhum produtor certificado ainda</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {seloVerdeData.produtores.map((produtor) => (
                                                <div key={produtor.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">🏅 {produtor.nome}</p>
                                                        <p className="text-sm text-gray-600">{produtor.nomeFazenda}</p>
                                                    </div>
                                                    <p className="text-xs text-green-700">
                                                        Aprovado em {new Date(produtor.aprovadoEm).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Relatório de Usuários */}
                        {tipoRelatorio === 'usuarios' && usuariosData && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                        <h3 className="font-bold text-gray-700 mb-4">Total</h3>
                                        <p className="text-4xl font-bold text-gray-800">{usuariosData.total}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
                                        <h3 className="font-bold text-gray-700 mb-4">Consumidores</h3>
                                        <p className="text-4xl font-bold text-blue-600">{usuariosData.consumidores}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100">
                                        <h3 className="font-bold text-gray-700 mb-4">Produtores</h3>
                                        <p className="text-4xl font-bold text-green-600">{usuariosData.produtores}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-100">
                                        <h3 className="font-bold text-gray-700 mb-4">Restaurantes</h3>
                                        <p className="text-4xl font-bold text-purple-600">{usuariosData.restaurantes}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!tipoRelatorio && (
                            <div className="bg-white p-12 rounded-2xl shadow-lg text-center border border-gray-100">
                                <div className="text-6xl mb-4">📊</div>
                                <p className="text-gray-500 text-lg">Selecione um tipo de relatório acima para visualizar</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
