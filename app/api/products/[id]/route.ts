
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Produto from '@/models/Produto';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        await dbConnect();
        const produto = await Produto.findById(params.id);

        if (!produto) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }

        return NextResponse.json(produto);
    } catch {
        return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 });
    }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        await dbConnect();

        // Auth check
        const userId = request.headers.get('x-user-id');
        const userTipo = request.headers.get('x-user-tipo');

        if (!userId || userTipo !== 'produtor') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Find and validate ownership
        const produto = await Produto.findById(params.id);
        if (!produto) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }

        if (produto.produtorId !== userId) {
            return NextResponse.json({ error: 'Sem permissão para editar este produto' }, { status: 403 });
        }

        const body = await request.json();
        const produtoAtualizado = await Produto.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true
        });

        return NextResponse.json(produtoAtualizado);
    } catch {
        return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        await dbConnect();

        // Auth check
        const userId = request.headers.get('x-user-id');
        const userTipo = request.headers.get('x-user-tipo');

        if (!userId || userTipo !== 'produtor') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Find and validate ownership
        const produto = await Produto.findById(params.id);
        if (!produto) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }

        if (produto.produtorId !== userId) {
            return NextResponse.json({ error: 'Sem permissão para deletar este produto' }, { status: 403 });
        }

        await Produto.findByIdAndDelete(params.id);
        return NextResponse.json({ message: 'Produto removido com sucesso' });
    } catch {
        return NextResponse.json({ error: 'Erro ao deletar produto' }, { status: 500 });
    }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        await dbConnect();
        const body = await request.json();

        // Validate estoque if provided
        if (body.estoque !== undefined && body.estoque < 0) {
            return NextResponse.json({ error: 'Estoque não pode ser negativo' }, { status: 400 });
        }

        const produto = await Produto.findByIdAndUpdate(
            params.id,
            body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!produto) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }

        return NextResponse.json(produto);
    } catch {
        return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
    }
}

