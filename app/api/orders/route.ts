import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  const order = await Order.create({
    consumidorId: body.consumidorId,
    produtorId: body.produtorId,
    itens: body.itens,
    total: body.total,
    status: "novo",
  });

  return NextResponse.json(order, { status: 201 });
}
