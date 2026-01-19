"use client";

import { useState } from "react";

const produtosMock = [
  { id: "1", nome: "Alface", preco: 5, distanciaKm: 2.1 },
  { id: "2", nome: "Tomate", preco: 8, distanciaKm: 5.4 },
];

export default function ListaProdutos() {
  const [produtos, setProdutos] = useState(
    [...produtosMock].sort((a, b) => a.distanciaKm - b.distanciaKm)
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Produtos Próximos</h1>
      <ul className="space-y-2">
        {produtos.map(p => (
          <li key={p.id} className="border p-3 rounded">
            <div>{p.nome}</div>
            <div>R$ {p.preco}</div>
            <div>{p.distanciaKm} km</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
