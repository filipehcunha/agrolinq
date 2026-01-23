export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Produto from '@/models/Produto';

interface ProdutoPayload {
    nome: string;
    preco: number;
    descricao?: string;
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const produtorId = searchParams.get('produtorId');
        const categoria = searchParams.get('categoria');

        const query: any = {};
        if (produtorId) query.produtorId = produtorId;
        if (categoria) query.categoria = categoria;

        const produtos = await Produto.find(query).sort({ createdAt: -1 });
        return NextResponse.json(produtos);
    } catch (error) {
        console.error("DEBUG: Error fetching products:", error);
        return NextResponse.json({ error: 'Erro ao buscar produtos', details: String(error) }, { status: 500 });
    }
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



