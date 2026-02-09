import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SeloVerde from '@/models/SeloVerde';

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
                { error: 'Apenas administradores podem rejeitar selos' },
                { status: 403 }
            );
        }

        const params = await context.params;
        const body = await request.json();
        const { motivoRejeicao } = body;

        if (!motivoRejeicao) {
            return NextResponse.json(
                { error: 'Motivo da rejeição é obrigatório' },
                { status: 400 }
            );
        }

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

        solicitacao.status = 'rejeitado';
        solicitacao.avaliadoPor = userId;
        solicitacao.avaliadoEm = new Date();
        solicitacao.motivoRejeicao = motivoRejeicao;
        await solicitacao.save();

        return NextResponse.json({
            message: 'Solicitação rejeitada',
            solicitacao
        });

    } catch (error) {
        console.error("Erro ao rejeitar selo:", error);
        return NextResponse.json(
            { error: 'Erro ao rejeitar selo', details: String(error) },
            { status: 500 }
        );
    }
}
