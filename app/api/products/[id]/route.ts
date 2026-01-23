
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Produto from '@/models/Produto';
export const dynamic = 'force-dynamic';

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
        return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
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
    } catch {
        return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
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
    } catch {
        return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }
}

