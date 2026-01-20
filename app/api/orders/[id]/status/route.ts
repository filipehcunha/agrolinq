import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/dbConnect";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { status } = await req.json();

  const order = await Order.findByIdAndUpdate(
    params.id,
    { status },
    { new: true }
  );

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  return NextResponse.json(order);
}
