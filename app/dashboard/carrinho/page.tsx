"use client";

import { useState } from "react";

export default function Carrinho() {
  const [itens, setItens] = useState([
    { id: "1", nome: "Alface", preco: 5, qtd: 2 },
  ]);

  const total = itens.reduce(
    (sum, i) => sum + i.preco * i.qtd,
    0
  );

  function remover(id: string) {
    setItens(itens.filter(i => i.id !== id));
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Carrinho</h1>

      {itens.map(i => (
        <div key={i.id} className="flex justify-between mb-2">
          <span>{i.nome} (x{i.qtd})</span>
          <span>R$ {i.preco * i.qtd}</span>
          <button onClick={() => remover(i.id)}>Remover</button>
        </div>
      ))}

      <hr className="my-4" />
      <div className="font-bold">Total: R$ {total}</div>
    </div>
  );
}
