"use client";

import { useState, useMemo } from "react";

const produtosMock = [
  { id: "1", nome: "Alface", preco: 5, distanciaKm: 2.1, tipo: "Verdura" },
  { id: "2", nome: "Tomate", preco: 8, distanciaKm: 5.4, tipo: "Fruta" },
  { id: "3", nome: "Cenoura", preco: 4, distanciaKm: 3.0, tipo: "Legume" },
  { id: "4", nome: "Banana", preco: 6, distanciaKm: 1.5, tipo: "Fruta" },
  { id: "5", nome: "Rúcula", preco: 5.5, distanciaKm: 2.5, tipo: "Verdura" },
  { id: "6", nome: "Batata", preco: 7, distanciaKm: 8.0, tipo: "Legume" },
];

export default function ListaProdutos() {
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPrecoMax, setFiltroPrecoMax] = useState("");

  const produtosFiltrados = useMemo(() => {
    return produtosMock
      .filter((produto) => {
        const matchTipo = filtroTipo ? produto.tipo === filtroTipo : true;
        const matchPreco = filtroPrecoMax
          ? produto.preco <= Number(filtroPrecoMax)
          : true;
        return matchTipo && matchPreco;
      })
      .sort((a, b) => a.distanciaKm - b.distanciaKm);
  }, [filtroTipo, filtroPrecoMax]);

  const tiposDisponiveis = Array.from(
    new Set(produtosMock.map((p) => p.tipo))
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Produtos Próximos</h1>

      {/* Filtros */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            id="tipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
          >
            <option value="">Todos</option>
            {tiposDisponiveis.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-1">
            Preço Máximo (R$)
          </label>
          <input
            type="number"
            id="preco"
            value={filtroPrecoMax}
            onChange={(e) => setFiltroPrecoMax(e.target.value)}
            placeholder="Ex: 10"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
          />
        </div>

        <div className="flex-1"></div>

        <button
          onClick={() => { setFiltroTipo(""); setFiltroPrecoMax("") }}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Limpar Filtros
        </button>
      </div>

      <ul className="space-y-2">
        {produtosFiltrados.map((p) => (
          <li key={p.id} className="border p-3 rounded flex justify-between items-center bg-white shadow-sm">
            <div>
              <div className="font-medium">{p.nome}</div>
              <div className="text-sm text-gray-500">{p.tipo}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-700">R$ {p.preco.toFixed(2)}</div>
              <div className="text-xs text-gray-500">{p.distanciaKm} km</div>
            </div>
          </li>
        ))}
      </ul>

      {produtosFiltrados.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum produto encontrado com os filtros selecionados.
        </div>
      )}
    </div>
  );
}
