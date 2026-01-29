import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Produto from "@/models/Produto";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        const { canceladoPor, motivoCancelamento } = body;

        if (!canceladoPor || !motivoCancelamento) {
            return NextResponse.json(
                { error: "canceladoPor e motivoCancelamento são obrigatórios" },
                { status: 400 }
            );
        }

        // Find the order
        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
        }

        // Check if order can be cancelled
        if (order.status === "concluido") {
            return NextResponse.json(
                { error: "Não é possível cancelar um pedido já concluído" },
                { status: 400 }
            );
        }

        if (order.status === "cancelado") {
            return NextResponse.json(
                { error: "Este pedido já foi cancelado" },
                { status: 400 }
            );
        }

        // Start transaction to restore inventory
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Restore inventory for all items
            for (const item of order.itens) {
                await Produto.findByIdAndUpdate(
                    item.produtoId,
                    { $inc: { estoque: item.quantidade } },
                    { session }
                );
            }

            // Update order status
            order.status = "cancelado";
            order.canceladoPor = canceladoPor;
            order.motivoCancelamento = motivoCancelamento;
            order.canceladoEm = new Date();
            await order.save({ session });

            await session.commitTransaction();

            return NextResponse.json({
                message: "Pedido cancelado com sucesso",
                order,
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error("Erro ao cancelar pedido:", error);
        return NextResponse.json(
            { error: "Erro ao cancelar pedido" },
            { status: 500 }
        );
    }
}
