
"use client";

import { useCart, CartItem } from "@/context/CartContext";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CarrinhoPage() {
  const { items, removeItem, clearCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);

    // Group items by producer
    const itemsByProducer: { [key: string]: CartItem[] } = {};
    items.forEach(item => {
      if (!itemsByProducer[item.produtorId]) {
        itemsByProducer[item.produtorId] = [];
      }
      itemsByProducer[item.produtorId].push(item);
    });

    try {
      const promises = Object.keys(itemsByProducer).map(async (produtorId) => {
        const producerItems = itemsByProducer[produtorId];
        const producerTotal = producerItems.reduce((acc, i) => acc + (i.preco * i.quantidade), 0);

        const payload = {
          consumidorId: "consumidor_123", // Fixed ID for MVP
          produtorId: produtorId,
          itens: producerItems.map(i => ({
            produtoId: i.produtoId,
            nome: i.nome,
            quantidade: i.quantidade,
            precoUnitario: i.preco
          })),
          total: producerTotal
        };

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Falha ao criar pedido");
      });

      await Promise.all(promises);

      clearCart();
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao processar seu pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="inline-block p-4 rounded-full bg-green-50 text-green-600 mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-500 mb-6">Explore nossos produtos frescos e apoie os produtores locais.</p>
          <Link href="/dashboard/produtos" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition">
            Explorar Produtos
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido Realizado!</h2>
          <p className="text-gray-600 mb-6">Seus pedidos foram enviados aos produtores. Você pode acompanhar o status no seu painel.</p>
          <p className="text-sm text-gray-400">Redirecionando para o painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/produtos" className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Seu Carrinho</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.produtoId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.imagemUrl ? (
                    <img src={item.imagemUrl} alt={item.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.nome}</h3>
                  <p className="text-sm text-gray-500">Quantidade: {item.quantidade}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">R$ {(item.preco * item.quantidade).toFixed(2)}</div>
                  <button
                    onClick={() => removeItem(item.produtoId)}
                    className="text-xs text-red-500 hover:text-red-700 mt-1 font-medium"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Resumo do Pedido</h3>

              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Entrega</span>
                  <span className="text-green-600">Grátis</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-lg">Total</span>
                  <span className="font-bold text-green-600 text-xl">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                  }`}
              >
                {loading ? "Processando..." : "Finalizar Pedido"}
              </button>

              <p className="text-xs text-center text-gray-400 mt-4">
                Ao finalizar, você concorda com nossos termos de serviço.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
