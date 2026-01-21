import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consumidor from '@/models/Consumidor';
import Produtor from '@/models/Produtor';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    await dbConnect();

    try {
        const { status } = await request.json();

        if (!['ativo', 'bloqueado'].includes(status)) {
            return NextResponse.json(
                { error: 'Status inválido.' },
                { status: 400 }
            );
        }

        // Buscar usuário (Consumidor ou Produtor)
        let user = await Consumidor.findById(params.id);

        if (!user) {
            user = await Produtor.findById(params.id);
        }

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado.' },
                { status: 404 }
            );
        }

        // Atualizar status
        user.status = status;
        await user.save();

        return NextResponse.json(
            { message: `Usuário ${status} com sucesso.` },
            { status: 200 }
        );
    } catch (error) {
        console.error('Erro ao bloquear usuário:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor.' },
            { status: 500 }
        );
    }
}
