import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consumidor from '@/models/Consumidor';

export async function GET(request: Request) {
    try {
        // Verificar se é admin
        const userTipo = request.headers.get('x-user-tipo');

        if (userTipo !== 'admin') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        await dbConnect();

        const consumidores = await Consumidor.find({})
            .select('nome email cpf tipo createdAt')
            .sort({ createdAt: -1 });

        return NextResponse.json(consumidores);
    } catch (error) {
        console.error('Erro ao buscar consumidores:', error);
        return NextResponse.json({ error: 'Erro ao buscar consumidores' }, { status: 500 });
    }
}
