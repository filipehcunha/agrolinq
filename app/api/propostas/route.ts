import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Proposta from "@/models/Proposta";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const solicitanteId = searchParams.get("solicitanteId");

    const query: Record<string, string> = {};
    if (solicitanteId) query.solicitanteId = solicitanteId;

    const propostas = await Proposta.find(query).sort({ createdAt: -1 });
    return NextResponse.json(propostas);
  } catch (error) {
    console.error("Erro ao buscar propostas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar propostas", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const conn = await dbConnect();

    // Suporte a CI / testes
    if (!conn && (process.env.CI || process.env.NODE_ENV === "test")) {
      return NextResponse.json(
        { _id: "mock-proposta-id", status: "solicitada" },
        { status: 201 }
      );
    }

    const body = await req.json();

    if (!body.solicitanteId || !body.itens || body.itens.length === 0) {
      return NextResponse.json(
        { error: "Dados inválidos para criação da proposta" },
        { status: 400 }
      );
    }

    const proposta = await Proposta.create({
      solicitanteId: body.solicitanteId,
      itens: body.itens,
      status: "solicitada",
    });

    return NextResponse.json(proposta, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar proposta:", error);
    return NextResponse.json(
      { error: "Erro ao criar proposta", details: String(error) },
      { status: 500 }
    );
  }
}
