
import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/mongodb";

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        await dbConnect();
        const body = await request.json();

        const order = await Order.findByIdAndUpdate(
            params.id,
            body,
            { new: true, runValidators: true }
        );

        if (!order) {
            return NextResponse.json(
                { error: "Pedido não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar pedido", details: String(error) },
            { status: 500 }
        );
    }
}
