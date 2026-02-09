import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/mongodb";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { nota, comentario } = await request.json();

    if (!nota || nota < 1 || nota > 5) {
      return NextResponse.json(
        { error: "Nota deve ser entre 1 e 5" },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    if (order.status !== "concluido") {
      return NextResponse.json(
        { error: "Apenas pedidos concluídos podem ser avaliados" },
        { status: 400 }
      );
    }

    if (order.avaliacao) {
      return NextResponse.json(
        { error: "Pedido já foi avaliado" },
        { status: 409 }
      );
    }

    order.avaliacao = {
      nota,
      comentario,
      avaliadoEm: new Date(),
    };

    await order.save();

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Erro ao avaliar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao registrar avaliação", details: String(error) },
      { status: 500 }
    );
  }
}
