import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SeloVerde from '@/models/SeloVerde';
import Produtor from '@/models/Produtor';

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const userId = request.headers.get('x-user-id');
        const userTipo = request.headers.get('x-user-tipo');

        if (userTipo !== 'admin') {
            return NextResponse.json(
                { error: 'Apenas administradores podem aprovar selos' },
                { status: 403 }
            );
        }

        const params = await context.params;
        const solicitacao = await SeloVerde.findById(params.id);

        if (!solicitacao) {
            return NextResponse.json(
                { error: 'Solicitação não encontrada' },
                { status: 404 }
            );
        }

        if (solicitacao.status !== 'pendente') {
            return NextResponse.json(
                { error: 'Esta solicitação já foi avaliada' },
                { status: 400 }
            );
        }

        // Atualizar solicitação
        solicitacao.status = 'aprovado';
        solicitacao.avaliadoPor = userId;
        solicitacao.avaliadoEm = new Date();
        await solicitacao.save();

        // Atualizar produtor
        await Produtor.findByIdAndUpdate(solicitacao.produtorId, {
            seloVerde: true,
            seloVerdeAprovadoEm: new Date()
        });

        return NextResponse.json({
            message: 'Selo verde aprovado com sucesso!',
            solicitacao
        });

    } catch (error) {
        console.error("Erro ao aprovar selo:", error);
        return NextResponse.json(
            { error: 'Erro ao aprovar selo', details: String(error) },
            { status: 500 }
        );
    }
}
