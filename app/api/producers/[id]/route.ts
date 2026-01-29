import { NextResponse } from "next/server";
import Produtor from "@/models/Produtor";
import dbConnect from "@/lib/mongodb";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        // Mock data for development (produtor_123)
        if (id === "produtor_123") {
            return NextResponse.json({
                _id: "produtor_123",
                nome: "João Silva",
                email: "joao.silva@fazenda.com",
                nomeFazenda: "Fazenda Orgânica São João",
                descricaoFazenda: "Produção orgânica de hortaliças e frutas há mais de 20 anos. Certificação orgânica e práticas sustentáveis.",
                localizacao: "Holambra, SP",
                fotoFazenda: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
                telefone: "(19) 98765-4321",
                whatsapp: "5519987654321"
            });
        }

        const produtor = await Produtor.findById(id).select("-senhaHash");

        if (!produtor) {
            return NextResponse.json(
                { error: "Produtor não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(produtor);
    } catch (error) {
        console.error("Erro ao buscar produtor:", error);
        return NextResponse.json(
            { error: "Erro ao buscar produtor" },
            { status: 500 }
        );
    }
}
