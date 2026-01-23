import { NextResponse } from 'next/server';
import Produto from '@/models/Produto';

export const dynamic = 'force-dynamic';

interface ProdutoPayload {
    nome: string;
    preco: number;
    descricao?: string;
    categoria?: string;
    produtorId?: string;
}

export async function POST(request: Request) {
    let body: ProdutoPayload;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'JSON inválido' },
            { status: 400 }
        );
    }

    try {
        const produto = await Produto.create(body);
        return NextResponse.json(produto, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: 'Erro ao criar produto.' },
            { status: 500 }
        );
    }
}


