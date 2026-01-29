
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Produto from '@/models/Produto';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const produtorId = searchParams.get('produtorId');
        const categoria = searchParams.get('categoria');

        const query: Record<string, string> = {};
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
    try {
        await dbConnect();
        const body = await request.json();

        // Validations (basic)
        if (!body.nome || !body.preco || !body.produtorId) {
            return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
        }

        const produto = await Produto.create(body);
        return NextResponse.json(produto, { status: 201 });
    } catch (error) {
        console.error("DEBUG: Error creating product:", error);
        return NextResponse.json({ error: 'Erro ao criar produto', details: String(error) }, { status: 500 });
    }
}
