
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function NovoProdutoPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (user.tipo !== 'produtor') {
            router.push('/dashboard');
            return;
        }
    }, [user, router]);

    const [formData, setFormData] = useState({
        nome: "",
        preco: "",
        categoria: "Verdura",
        imagemUrl: "",
        descricao: "",
        estoque: "100",
        unidade: "unid",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        setLoading(true);
        setError("");

        try {
            const sanitizedPrice = formData.preco.toString().replace(',', '.');

            const payload = {
                ...formData,
                preco: Number(sanitizedPrice),
                estoque: Number(formData.estoque),
                produtorId: user.id, // Dynamic from auth
            };

            const res = await fetchWithAuth("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Falha ao cadastrar produto");
            }

            // Redirect to the new Producer Dashboard
            router.push("/produtor");
        } catch (err) {
            setError("Erro ao salvar produto. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Cadastrar Novo Produto</h1>
                    <Link href="/produtor" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                        Voltar
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
                            <input
                                name="nome"
                                required
                                value={formData.nome}
                                onChange={handleChange}
                                placeholder="Ex: Alface Americana"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-black placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                            <input
                                name="preco"
                                type="number"
                                step="0.01"
                                required
                                value={formData.preco}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-black placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                            <select
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white text-black"
                            >
                                <option>Verdura</option>
                                <option>Fruta</option>
                                <option>Legume</option>
                                <option>Grão</option>
                                <option>Laticínio</option>
                                <option>Outros</option>
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estoque</label>
                                <input
                                    name="estoque"
                                    type="number"
                                    value={formData.estoque}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-black placeholder-gray-400"
                                />
                            </div>
                            <div className="w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
                                <input
                                    name="unidade"
                                    value={formData.unidade}
                                    onChange={handleChange}
                                    placeholder="kg"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-black placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
                        <input
                            name="imagemUrl"
                            value={formData.imagemUrl}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-black placeholder-gray-400"
                        />
                        {formData.imagemUrl && (
                            <div className="mt-2 text-xs text-gray-500">
                                Pré-visualização: <img src={formData.imagemUrl} alt="Preview" className="h-16 w-16 object-cover rounded mt-1 border" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                        <textarea
                            name="descricao"
                            rows={3}
                            required
                            value={formData.descricao}
                            onChange={handleChange}
                            placeholder="Descreva seu produto..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-black placeholder-gray-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                            }`}
                    >
                        {loading ? "Cadastrando..." : "Confirmar Cadastro"}
                    </button>
                </form>
            </div>
        </div>
    );
}
