"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface OrderItem {
    produtoId: string;
    nome: string;
    quantidade: number;
    precoUnitario: number;
}

interface Order {
    _id: string;
    consumidorId: string;
    produtorId: string;
    itens: OrderItem[];
    total: number;
    status: "novo" | "em_separacao" | "enviado" | "concluido" | "cancelado";
    produtorNotificado: boolean;
    canceladoPor?: "produtor" | "consumidor";
    motivoCancelamento?: string;
    createdAt: string;
}

export default function ProdutorPedidosPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [cancelModal, setCancelModal] = useState<{ open: boolean; orderId: string | null }>({
        open: false,
        orderId: null,
    });
    const [cancelReason, setCancelReason] = useState("");

    const fetchOrders = async () => {
        if (!user) return;

        try {
            const res = await fetch(`/api/orders?produtorId=${user.id}`);
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (user.tipo !== 'produtor') {
            router.push('/dashboard');
            return;
        }

        // Initial fetch
        fetchOrders();

        // Set up polling to check for new orders every 10 seconds
        const intervalId = setInterval(() => {
            fetchOrders();
        }, 10000); // 10 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, [user, router]);

    const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
        setUpdatingId(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                await fetchOrders();
            }
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelModal.orderId || !cancelReason.trim()) {
            alert("Por favor, informe o motivo do cancelamento");
            return;
        }

        setUpdatingId(cancelModal.orderId);
        try {
            const res = await fetch(`/api/orders/${cancelModal.orderId}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    canceladoPor: "produtor",
                    motivoCancelamento: cancelReason,
                }),
            });

            if (res.ok) {
                await fetchOrders();
                setCancelModal({ open: false, orderId: null });
                setCancelReason("");
                alert("Pedido cancelado com sucesso! O estoque foi restaurado.");
            } else {
                const data = await res.json();
                alert(data.error || "Erro ao cancelar pedido");
            }
        } catch (error) {
            console.error("Erro ao cancelar pedido:", error);
            alert("Erro ao cancelar pedido");
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusConfig = (status: Order["status"]) => {
        const configs = {
            novo: { label: "Novo Pedido", color: "bg-blue-100 text-blue-700", icon: "🆕" },
            em_separacao: { label: "Em Separação", color: "bg-yellow-100 text-yellow-700", icon: "📦" },
            enviado: { label: "Enviado", color: "bg-purple-100 text-purple-700", icon: "🚚" },
            concluido: { label: "Concluído", color: "bg-green-100 text-green-700", icon: "✅" },
            cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: "❌" },
        };
        return configs[status];
    };

    const getNextStatus = (currentStatus: Order["status"]): Order["status"] | null => {
        const flow: Record<Order["status"], Order["status"] | null> = {
            novo: "em_separacao",
            em_separacao: "enviado",
            enviado: "concluido",
            concluido: null,
            cancelado: null,
        };
        return flow[currentStatus];
    };

    const newOrdersCount = orders.filter((o) => o.status === "novo").length;
    const activeOrders = orders.filter((o) => o.status !== "cancelado" && o.status !== "concluido");
    const cancelledOrders = orders.filter((o) => o.status === "cancelado");

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <h1 className="text-xl font-bold text-green-600">
                    <Link href="/produtor">AGROLINQ - Produtor</Link>
                </h1>
                {newOrdersCount > 0 && (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {newOrdersCount} {newOrdersCount === 1 ? "novo pedido" : "novos pedidos"}
                    </div>
                )}
            </header>

            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Meus Pedidos</h1>
                    <Link href="/produtor" className="text-sm text-gray-500 hover:underline">
                        Voltar ao painel
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="mt-2 text-gray-500">Carregando pedidos...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                        <div className="inline-block p-4 rounded-full bg-green-50 text-green-600 mb-4">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Nenhum pedido recebido</h3>
                        <p className="text-gray-500 mt-1">Seus pedidos aparecerão aqui quando os consumidores comprarem seus produtos.</p>
                    </div>
                ) : (
                    <>
                        {/* Active Orders */}
                        {activeOrders.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-700 mb-4">Pedidos Ativos</h2>
                                <div className="space-y-4">
                                    {activeOrders.map((order) => {
                                        const statusConfig = getStatusConfig(order.status);
                                        const nextStatus = getNextStatus(order.status);
                                        const isUpdating = updatingId === order._id;

                                        return (
                                            <div
                                                key={order._id}
                                                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${statusConfig.color}`}>
                                                                {statusConfig.icon} {statusConfig.label}
                                                            </span>
                                                            {order.status === "novo" && !order.produtorNotificado && (
                                                                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">NOVO</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500">
                                                            Pedido #{order._id.slice(-8)} • {new Date(order.createdAt).toLocaleDateString("pt-BR")} às{" "}
                                                            {new Date(order.createdAt).toLocaleTimeString("pt-BR")}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-green-600">R$ {order.total.toFixed(2)}</div>
                                                        <div className="text-xs text-gray-500">{order.itens.length} {order.itens.length === 1 ? "item" : "itens"}</div>
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-100 pt-4 mb-4">
                                                    <h4 className="font-semibold text-gray-700 mb-3">Itens do Pedido:</h4>
                                                    <div className="space-y-2">
                                                        {order.itens.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                                                <div>
                                                                    <span className="font-medium text-gray-800">{item.nome}</span>
                                                                    <span className="text-sm text-gray-500 ml-2">x{item.quantidade}</span>
                                                                </div>
                                                                <span className="font-semibold text-gray-900">
                                                                    R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-100 pt-4 flex gap-3">
                                                    {order.status === "novo" && (
                                                        <button
                                                            onClick={() => setCancelModal({ open: true, orderId: order._id })}
                                                            disabled={isUpdating}
                                                            className={`flex-1 py-3 rounded-lg font-bold text-white shadow-md transition-all ${isUpdating
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : "bg-red-600 hover:bg-red-700 hover:shadow-lg"
                                                                }`}
                                                        >
                                                            ❌ Recusar Pedido
                                                        </button>
                                                    )}
                                                    {nextStatus && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order._id, nextStatus)}
                                                            disabled={isUpdating}
                                                            className={`flex-1 py-3 rounded-lg font-bold text-white shadow-md transition-all ${isUpdating
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                                                                }`}
                                                        >
                                                            {isUpdating ? "Atualizando..." : `Marcar como ${getStatusConfig(nextStatus).label}`}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Cancelled Orders */}
                        {cancelledOrders.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700 mb-4">Pedidos Cancelados</h2>
                                <div className="space-y-4">
                                    {cancelledOrders.map((order) => (
                                        <div
                                            key={order._id}
                                            className="bg-gray-50 rounded-xl border border-gray-200 p-6 opacity-75"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">
                                                            ❌ Cancelado
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            por {order.canceladoPor === "produtor" ? "você" : "consumidor"}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        Pedido #{order._id.slice(-8)} • {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                                                    </p>
                                                    {order.motivoCancelamento && (
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            <span className="font-medium">Motivo:</span> {order.motivoCancelamento}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-gray-500 line-through">R$ {order.total.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Cancel Modal */}
            {cancelModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Recusar Pedido</h3>
                        <p className="text-gray-600 mb-4">
                            Por favor, informe o motivo do cancelamento. O estoque será restaurado automaticamente.
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Ex: Produto fora de estoque, não consigo entregar no prazo..."
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px] focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setCancelModal({ open: false, orderId: null });
                                    setCancelReason("");
                                }}
                                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={!cancelReason.trim()}
                                className={`flex-1 py-2 rounded-lg font-bold text-white transition-colors ${cancelReason.trim()
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Confirmar Cancelamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
