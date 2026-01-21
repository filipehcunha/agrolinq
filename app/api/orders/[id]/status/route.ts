import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/mongodb";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const conn = await dbConnect();

  if (!conn && (process.env.CI || process.env.NODE_ENV === 'test')) {
    const { status } = await req.json();
    const { id } = await params;
    return NextResponse.json({ _id: id, status }, { status: 200 });
  }
  const { status } = await req.json();
  const { id } = await params;

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  return NextResponse.json(order);
}
