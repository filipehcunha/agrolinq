
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
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 });
    }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        await dbConnect();
        const body = await request.json();

        const produto = await Produto.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true
        });

        if (!produto) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }

        return NextResponse.json(produto);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        await dbConnect();
        const produto = await Produto.findByIdAndDelete(params.id);

        if (!produto) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Produto removido com sucesso' });
    } catch (error) {
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
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
    }
}

