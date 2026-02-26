import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Restaurante from "@/models/Restaurante";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const restaurante = await Restaurante.findById(id).select("-senhaHash");

        if (!restaurante) {
            return NextResponse.json(
                { error: "Restaurante não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(restaurante);
    } catch (error) {
        console.error("Erro ao buscar restaurante:", error);
        return NextResponse.json(
            { error: "Erro ao buscar restaurante" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        // Remove sensitive or read-only fields
        delete body.email;
        delete body.cnpj;
        delete body.senhaHash;
        delete body.tipo;

        const restaurante = await Restaurante.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        ).select("-senhaHash");

        if (!restaurante) {
            return NextResponse.json(
                { error: "Restaurante não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(restaurante);
    } catch (error: unknown) {
        console.error("Erro ao atualizar restaurante:", error);

        if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
            const err = error as unknown as { errors: Record<string, { message: string }> };
            const messages = Object.values(err.errors).map((val) => val.message);
            return NextResponse.json({ error: 'Erro de validação', details: messages }, { status: 400 });
        }

        return NextResponse.json(
            { error: "Erro ao atualizar restaurante", details: String(error) },
            { status: 500 }
        );
    }
}
