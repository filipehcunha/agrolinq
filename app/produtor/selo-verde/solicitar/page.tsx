"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function SolicitarSeloVerdePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [descricao, setDescricao] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || user.tipo !== 'produtor') {
            alert('Apenas produtores podem solicitar o selo verde');
            return;
        }

        if (descricao.length < 50) {
            setMessage('A descrição deve ter no mínimo 50 caracteres');
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await fetchWithAuth('/api/selo-verde', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    descricaoPraticas: descricao
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Solicitação enviada com sucesso! Aguarde a análise do administrador.');
                setDescricao("");
                setTimeout(() => router.push('/produtor'), 2000);
            } else {
                setMessage(data.error || 'Erro ao enviar solicitação');
            }
        } catch (err) {
            setMessage('Erro ao enviar solicitação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">🏅</span>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                            Solicitar Selo Verde
                        </h1>
                        <p className="text-gray-600">
                            Certifique suas práticas sustentáveis e destaque seus produtos
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Descrição das Práticas Sustentáveis *
                                <span className="text-gray-500 font-normal ml-2">({descricao.length}/1000 caracteres)</span>
                            </label>
                            <textarea
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                rows={8}
                                maxLength={1000}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                placeholder="Descreva suas práticas sustentáveis, certificações, métodos de cultivo orgânico, uso de energia renovável, etc. (mínimo 50 caracteres)"
                                required
                            />
                            {descricao.length > 0 && descricao.length < 50 && (
                                <p className="text-sm text-red-600 mt-1">
                                    Ainda faltam {50 - descricao.length} caracteres
                                </p>
                            )}
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || descricao.length < 50}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enviando...' : '🏅 Enviar Solicitação'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
