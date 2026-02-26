"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface RestauranteData {
    nome: string;
    email: string;
    cnpj: string;
    nomeEstabelecimento?: string;
    descricaoEstabelecimento?: string;
    localizacao?: string;
    telefone?: string;
    whatsapp?: string;
    categoriasProdutosInteresse?: string[];
    raioEntregaKm?: number;
}

export default function RestaurantProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [formData, setFormData] = useState<RestauranteData>({
        nome: "",
        email: "",
        cnpj: "",
        nomeEstabelecimento: "",
        descricaoEstabelecimento: "",
        localizacao: "",
        telefone: "",
        whatsapp: "",
        categoriasProdutosInteresse: [],
        raioEntregaKm: 50
    });

    useEffect(() => {
        if (user?.id) {
            fetch(`/api/restaurants/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setFormData({
                            nome: data.nome || "",
                            email: data.email || "",
                            cnpj: data.cnpj || "",
                            nomeEstabelecimento: data.nomeEstabelecimento || "",
                            descricaoEstabelecimento: data.descricaoEstabelecimento || "",
                            localizacao: data.localizacao || "",
                            telefone: data.telefone || "",
                            whatsapp: data.whatsapp || "",
                            categoriasProdutosInteresse: data.categoriasProdutosInteresse || [],
                            raioEntregaKm: data.raioEntregaKm || 50
                        });
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Erro ao carregar perfil:", err);
                    setLoading(false);
                });
        }
    }, [user?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch(`/api/restaurants/${user?.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
            } else {
                setMessage({ type: "error", text: data.error || "Erro ao atualizar perfil." });
            }
        } catch (err) {
            console.error("Erro ao salvar perfil:", err);
            setMessage({ type: "error", text: "Erro ao conectar com o servidor." });
        } finally {
            setSaving(false);
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
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar ao Painel
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Perfil do Restaurante</h1>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
                        }`}>
                        {message.type === "success" ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Responsável</label>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">E-mail (fixo)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    className="w-full px-4 py-2 border border-gray-100 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed outline-none"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">CNPJ (fixo)</label>
                                <input
                                    type="text"
                                    value={formData.cnpj}
                                    className="w-full px-4 py-2 border border-gray-100 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed outline-none"
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Nome do Estabelecimento</label>
                                <input
                                    type="text"
                                    value={formData.nomeEstabelecimento}
                                    onChange={(e) => setFormData({ ...formData, nomeEstabelecimento: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Ex: Restaurante Sabor de Casa"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Descrição do Negócio</label>
                            <textarea
                                value={formData.descricaoEstabelecimento}
                                onChange={(e) => setFormData({ ...formData, descricaoEstabelecimento: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                                rows={4}
                                placeholder="Conte um pouco sobre sua culinária e o que você prioriza na compra de produtos..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Telefone Contato</label>
                                <input
                                    type="text"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">WhatsApp (p/ Pedidos)</label>
                                <input
                                    type="text"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    placeholder="11999999999"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Localização</label>
                            <input
                                type="text"
                                value={formData.localizacao}
                                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="Endereço, Cidade - UF"
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
                                disabled={saving}
                            >
                                Descartar Alterações
                            </button>
                            <button
                                type="submit"
                                className={`px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Perfil'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
