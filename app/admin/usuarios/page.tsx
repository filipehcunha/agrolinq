"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface Usuario {
    _id: string;
    nome: string;
    email: string;
    tipo?: string;
    cpf?: string;
    cnpj?: string;
    nomeFazenda?: string;
    nomeEstabelecimento?: string;
    createdAt: string;
}

export default function AdminUsuariosPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [consumidores, setConsumidores] = useState<Usuario[]>([]);
    const [produtores, setProdutores] = useState<Usuario[]>([]);
    const [restaurantes, setRestaurantes] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'consumidor' | 'produtor' | 'restaurante'>('todos');

    useEffect(() => {
        if (!user || user.tipo !== 'admin') {
            router.push('/login');
            return;
        }

        carregarUsuarios();
    }, [user, router]);

    const carregarUsuarios = async () => {
        try {
            const [consRes, prodRes, restRes] = await Promise.all([
                fetchWithAuth('/api/consumers'),
                fetchWithAuth('/api/producers'),
                fetchWithAuth('/api/restaurants')
            ]);

            const [consData, prodData, restData] = await Promise.all([
                consRes.json().catch(() => []),
                prodRes.json().catch(() => []),
                restRes.json().catch(() => [])
            ]);

            setConsumidores(Array.isArray(consData) ? consData : []);
            setProdutores(Array.isArray(prodData) ? prodData : []);
            setRestaurantes(Array.isArray(restData) ? restData : []);
        } catch (err) {
            console.error("Erro ao carregar usuários:", err);
        } finally {
            setLoading(false);
        }
    };

    const usuariosFiltrados = () => {
        if (tipoFiltro === 'consumidor') return consumidores;
        if (tipoFiltro === 'produtor') return produtores;
        if (tipoFiltro === 'restaurante') return restaurantes;
        return [...consumidores, ...produtores, ...restaurantes];
    };

    const getTipoBadge = (tipo: string) => {
        const badges: Record<string, { color: string; label: string }> = {
            consumidor: { color: 'bg-blue-100 text-blue-700', label: '👤 Consumidor' },
            admin: { color: 'bg-red-100 text-red-700', label: '🛡️ Admin' },
            produtor: { color: 'bg-green-100 text-green-700', label: '👨‍🌾 Produtor' },
            restaurante: { color: 'bg-purple-100 text-purple-700', label: '🍽️ Restaurante' }
        };
        return badges[tipo] || badges.consumidor;
    };

    const usuarios = usuariosFiltrados();

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
                            👥 Gerenciar Usuários
                        </h1>
                        <p className="text-gray-600 mt-1">Visualize todos os usuários cadastrados no sistema</p>
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <button
                        onClick={() => setTipoFiltro('todos')}
                        className={`p-6 rounded-2xl shadow-md border transition-all ${tipoFiltro === 'todos'
                                ? 'bg-gray-800 text-white border-gray-800'
                                : 'bg-white text-gray-800 border-gray-100 hover:shadow-lg'
                            }`}
                    >
                        <p className="text-sm font-medium mb-2">Total de Usuários</p>
                        <p className="text-3xl font-bold">{consumidores.length + produtores.length + restaurantes.length}</p>
                    </button>

                    <button
                        onClick={() => setTipoFiltro('consumidor')}
                        className={`p-6 rounded-2xl shadow-md border transition-all ${tipoFiltro === 'consumidor'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-800 border-gray-100 hover:shadow-lg hover:border-blue-200'
                            }`}
                    >
                        <p className="text-sm font-medium mb-2">Consumidores</p>
                        <p className="text-3xl font-bold">{consumidores.length}</p>
                    </button>

                    <button
                        onClick={() => setTipoFiltro('produtor')}
                        className={`p-6 rounded-2xl shadow-md border transition-all ${tipoFiltro === 'produtor'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-gray-800 border-gray-100 hover:shadow-lg hover:border-green-200'
                            }`}
                    >
                        <p className="text-sm font-medium mb-2">Produtores</p>
                        <p className="text-3xl font-bold">{produtores.length}</p>
                    </button>

                    <button
                        onClick={() => setTipoFiltro('restaurante')}
                        className={`p-6 rounded-2xl shadow-md border transition-all ${tipoFiltro === 'restaurante'
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-800 border-gray-100 hover:shadow-lg hover:border-purple-200'
                            }`}
                    >
                        <p className="text-sm font-medium mb-2">Restaurantes</p>
                        <p className="text-3xl font-bold">{restaurantes.length}</p>
                    </button>
                </div>

                {/* Lista de Usuários */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">
                            {tipoFiltro === 'todos' ? 'Todos os Usuários' :
                                tipoFiltro === 'consumidor' ? 'Consumidores' :
                                    tipoFiltro === 'produtor' ? 'Produtores' : 'Restaurantes'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{usuarios.length} usuário(s)</p>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Carregando usuários...</p>
                        </div>
                    ) : usuarios.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">Nenhum usuário encontrado</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {usuarios.map((usuario) => {
                                const badge = getTipoBadge(usuario.tipo || 'consumidor');
                                return (
                                    <div key={usuario._id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-bold text-gray-800 text-lg">{usuario.nome}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-600">📧 {usuario.email}</p>
                                                    {usuario.cpf && (
                                                        <p className="text-sm text-gray-600">🆔 CPF: {usuario.cpf}</p>
                                                    )}
                                                    {usuario.cnpj && (
                                                        <p className="text-sm text-gray-600">🏢 CNPJ: {usuario.cnpj}</p>
                                                    )}
                                                    {usuario.nomeFazenda && (
                                                        <p className="text-sm text-gray-600">🚜 Fazenda: {usuario.nomeFazenda}</p>
                                                    )}
                                                    {usuario.nomeEstabelecimento && (
                                                        <p className="text-sm text-gray-600">🍽️ Estabelecimento: {usuario.nomeEstabelecimento}</p>
                                                    )}
                                                    <p className="text-xs text-gray-400">
                                                        Cadastrado em {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                                                    </p>
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
        </div>
    );
}
