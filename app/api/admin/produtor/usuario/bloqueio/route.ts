import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consumidor from '@/models/Consumidor';
import Produtor from '@/models/Produtor';

export const dynamic = 'force-dynamic';

interface BloqueioPayload {
    usuarioId: string;
    bloqueado: boolean;
}

export async function PATCH(request: Request) {
    let body: BloqueioPayload;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'JSON inválido' },
            { status: 400 }
        );
    }

    const { usuarioId, bloqueado } = body;

    if (!usuarioId) {
        return NextResponse.json(
            { error: 'usuarioId é obrigatório' },
            { status: 400 }
        );
    }

    // lógica de bloqueio/desbloqueio
    // await Usuario.findByIdAndUpdate(usuarioId, { bloqueado });

    return NextResponse.json(
        { message: 'Status de bloqueio atualizado com sucesso' },
        { status: 200 }
    );
}
