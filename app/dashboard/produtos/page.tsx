
"use client";

import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

interface Produto {
  _id: string;
  nome: string;
  preco: number;
  categoria: string;
  imagemUrl?: string;
  produtorId: string;
  unidade: string;
  estoque: number;
  seloVerde?: boolean;
}

export default function ListaProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [notification, setNotification] = useState("");

  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPrecoMax, setFiltroPrecoMax] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProdutos(data);
        } else {
          console.error("API did not return an array", data);
          setProdutos([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar produtos:", err);
        setProdutos([]);
        setLoading(false);
      });
  }, []);

  const produtosFiltrados = useMemo(() => {
    if (!Array.isArray(produtos)) return [];
    return produtos
      .filter((produto) => {
        const matchTipo = filtroTipo ? produto.categoria === filtroTipo : true;
        const matchPreco = filtroPrecoMax
          ? produto.preco <= Number(filtroPrecoMax)
          : true;
        return matchTipo && matchPreco;
      });
  }, [produtos, filtroTipo, filtroPrecoMax]);

  const tiposDisponiveis = Array.from(
    new Set(produtos.map((p) => p.categoria))
  );

  const handleAddToCart = (produto: Produto) => {
    if (produto.estoque === 0) {
      setNotification(`${produto.nome} está fora de estoque!`);
      setTimeout(() => setNotification(""), 3000);
      return;
    }

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-green-600">
          <Link href="/dashboard">AGROLINQ</Link>
        </h1>
        <Link href="/dashboard/carrinho" className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Carrinho
        </Link>
      </header>

      <div className="p-6 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Produtos Disponíveis</h1>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">Voltar ao painel</Link>
        </div>

        {notification && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
            {notification}
          </div>
        )}

        {/* Filtros */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              id="tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-2.5 border"
            >
              <option value="">Todas</option>
              {tiposDisponiveis.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-2">
              Preço Máximo (R$)
            </label>
            <input
              type="number"
              id="preco"
              value={filtroPrecoMax}
              onChange={(e) => setFiltroPrecoMax(e.target.value)}
              placeholder="Ex: 20"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-2.5 border"
            />
          </div>

          <button
            onClick={() => { setFiltroTipo(""); setFiltroPrecoMax("") }}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Limpar Filtros
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-500">Carregando produtos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtosFiltrados.map((p) => (
              <div key={p._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                <Link href={`/dashboard/produtos/${p._id}`}>
                  <div className="h-48 bg-gray-100 relative cursor-pointer">
                    {p.imagemUrl ? (
                      <img src={p.imagemUrl} alt={p.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                      {p.categoria}
                    </span>
                  </div>
                </Link>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <Link href={`/dashboard/produtos/${p._id}`}>
                      <h3 className="font-bold text-gray-800 text-lg mb-1 hover:text-green-600 transition-colors cursor-pointer">{p.nome}</h3>
                    </Link>
                    <div className="flex items-center gap-1 mb-3">
                      <p className="text-sm text-gray-500">Produtor Local</p>
                      {p.seloVerde && (
                        <span title="Produtor Certificado" className="text-green-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                    {p.estoque > 0 ? (
                      <p className="text-xs text-green-600 font-medium">
                        {p.estoque} {p.unidade} disponíveis
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 font-bold">Fora de estoque</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <div>
                      <span className="block text-xs text-gray-500">Preço por {p.unidade}</span>
                      <span className="text-lg font-bold text-green-600">R$ {p.preco.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={p.estoque === 0}
                      className={`p-2 rounded-lg shadow-sm transition-colors ${p.estoque === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      aria-label="Adicionar ao carrinho"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && produtosFiltrados.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <div className="inline-block p-4 rounded-full bg-gray-50 text-gray-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
            <p className="text-gray-500 mt-1">Tente ajustar seus filtros de busca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
