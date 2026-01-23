import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface PatchPayload {
    produtorId: string;
    seloVerdeStatus: 'aprovado' | 'reprovado' | 'pendente';
}

export async function PATCH(request: Request) {
    let body: PatchPayload;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'JSON inválido' },
            { status: 400 }
        );
    }

    const { produtorId, seloVerdeStatus } = body;

    if (!produtorId) {
        return NextResponse.json(
            { error: 'produtorId é obrigatório' },
            { status: 400 }
        );
    }

    // lógica de atualização aqui
    // await Produtor.findByIdAndUpdate(produtorId, { seloVerdeStatus });

    return NextResponse.json(
        { message: 'Status do selo atualizado com sucesso' },
        { status: 200 }
    );
}

