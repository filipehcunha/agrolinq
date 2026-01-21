import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Produtor from '@/models/Produtor';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    await dbConnect();

    try {
        const { status } = await request.json();

        if (!['aprovado', 'reprovado'].includes(status)) {
            return NextResponse.json(
                { error: 'Status inválido.' },
                { status: 400 }
            );
        }

        // Buscar produtor
        const produtor = await Produtor.findById(params.id);

        if (!produtor) {
            return NextResponse.json(
                { error: 'Produtor não encontrado.' },
                { status: 404 }
            );
        }

        // Atualizar status do selo
        produtor.seloVerdeStatus = status;
        await produtor.save();

        return NextResponse.json(
            { message: `Selo ${status} com sucesso.` },
            { status: 200 }
        );
    } catch (error) {
        console.error('Erro ao atualizar selo:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor.' },
            { status: 500 }
        );
    }
}
