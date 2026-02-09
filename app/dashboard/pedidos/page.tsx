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
    canceladoPor?: "produtor" | "consumidor";
    motivoCancelamento?: string;
    createdAt: string;
}

interface Produtor {
    _id: string;
    nome: string;
    email: string;
    seloVerde?: boolean;
}

export default function ConsumidorPedidosPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [produtores, setProdutores] = useState<Record<string, Produtor>>({});
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        if (!user) return;

        try {
            const res = await fetch(`/api/orders?consumidorId=${user.id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);

                // Fetch producer details for each unique produtorId
                const uniqueProdutorIds = [...new Set(data.map((o: Order) => o.produtorId))] as string[];
                const produtorData: Record<string, Produtor> = {};

                await Promise.all(
                    uniqueProdutorIds.map(async (id) => {
                        try {
                            const res = await fetch(`/api/producers/${id}`);
                            if (res.ok) {
                                const produtor = await res.json();
                                produtorData[id] = produtor;
                            }
                        } catch (error) {
                            console.error(`Erro ao buscar produtor ${id}:`, error);
                        }
                    })
                );

                setProdutores(produtorData);
            } else {
                console.error("Orders API did not return an array", data);
                setOrders([]);
            }
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

        // Initial fetch
        fetchOrders();

        // Set up polling to check for updates every 10 seconds
        const intervalId = setInterval(() => {
            fetchOrders();
        }, 10000); // 10 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, [user, router]);

    const getStatusConfig = (status: Order["status"]) => {
        const configs = {
            novo: { label: "Pedido Recebido", color: "bg-blue-100 text-blue-700", icon: "🆕" },
            em_separacao: { label: "Em Separação", color: "bg-yellow-100 text-yellow-700", icon: "📦" },
            enviado: { label: "Enviado", color: "bg-purple-100 text-purple-700", icon: "🚚" },
            concluido: { label: "Entregue", color: "bg-green-100 text-green-700", icon: "✅" },
            cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: "❌" },
        };
        return configs[status];
    };

    const getStatusSteps = (currentStatus: Order["status"]) => {
        const allSteps = [
            { key: "novo", label: "Recebido" },
            { key: "em_separacao", label: "Em Separação" },
            { key: "enviado", label: "Enviado" },
            { key: "concluido", label: "Entregue" },
        ];

        if (currentStatus === "cancelado") {
            return [];
        }

        const statusOrder = ["novo", "em_separacao", "enviado", "concluido"];
        const currentIndex = statusOrder.indexOf(currentStatus);

        return allSteps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            active: index === currentIndex,
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50">
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

            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Meus Pedidos</h1>
                    <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Nenhum pedido realizado</h3>
                        <p className="text-gray-500 mt-1 mb-4">Explore nossos produtos e faça seu primeiro pedido!</p>
                        <Link
                            href="/dashboard/produtos"
                            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
                        >
                            Explorar Produtos
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const statusConfig = getStatusConfig(order.status);
                            const produtor = produtores[order.produtorId];
                            const statusSteps = getStatusSteps(order.status);

                            return (
                                <div
                                    key={order._id}
                                    className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-6 ${order.status === "cancelado" ? "border-red-200 opacity-75" : "border-gray-100"
                                        }`}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${statusConfig.color}`}>
                                                    {statusConfig.icon} {statusConfig.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Pedido #{order._id.slice(-8)} • {new Date(order.createdAt).toLocaleDateString("pt-BR")} às{" "}
                                                {new Date(order.createdAt).toLocaleTimeString("pt-BR")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-2xl font-bold ${order.status === "cancelado" ? "text-gray-500 line-through" : "text-green-600"}`}>
                                                R$ {order.total.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500">{order.itens.length} {order.itens.length === 1 ? "item" : "itens"}</div>
                                        </div>
                                    </div>

                                    {/* Seller Info */}
                                    {produtor && (
                                        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">
                                                {produtor.nome.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                                                    👨‍🌾 Vendedor: {produtor.nome}
                                                    {produtor.seloVerde && (
                                                        <span title="Produtor Certificado" className="text-green-600">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-600">📧 {produtor.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Status Timeline */}
                                    {statusSteps.length > 0 && (
                                        <div className="mb-4 px-4 py-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                {statusSteps.map((step, index) => (
                                                    <div key={step.key} className="flex items-center flex-1">
                                                        <div className="flex flex-col items-center">
                                                            <div
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step.completed
                                                                    ? "bg-green-600 text-white"
                                                                    : "bg-gray-200 text-gray-400"
                                                                    }`}
                                                            >
                                                                {step.completed ? "✓" : index + 1}
                                                            </div>
                                                            <span className={`text-xs mt-1 font-medium ${step.active ? "text-green-600" : "text-gray-500"}`}>
                                                                {step.label}
                                                            </span>
                                                        </div>
                                                        {index < statusSteps.length - 1 && (
                                                            <div className={`flex-1 h-1 mx-2 rounded ${step.completed ? "bg-green-600" : "bg-gray-200"}`} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Cancellation Info */}
                                    {order.status === "cancelado" && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                                            <p className="text-sm text-red-700 font-medium mb-1">
                                                ❌ Pedido cancelado {order.canceladoPor === "produtor" ? "pelo vendedor" : "por você"}
                                            </p>
                                            {order.motivoCancelamento && (
                                                <p className="text-sm text-red-600">
                                                    <span className="font-medium">Motivo:</span> {order.motivoCancelamento}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Order Items */}
                                    <div className="border-t border-gray-100 pt-4">
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

                                    {/* Status Messages */}
                                    {order.status === "enviado" && (
                                        <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                                            <p className="text-sm text-purple-700">
                                                <strong>🚚 Seu pedido está a caminho!</strong> Em breve você receberá seus produtos frescos.
                                            </p>
                                        </div>
                                    )}

                                    {order.status === "concluido" && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
                                            <p className="text-sm text-green-700">
                                                <strong>✅ Pedido entregue!</strong> Esperamos que você tenha gostado dos produtos.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
