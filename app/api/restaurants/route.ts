import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Restaurante from '@/models/Restaurante';

export async function GET(request: Request) {
    try {
        // Verificar se é admin
        const userTipo = request.headers.get('x-user-tipo');

        if (userTipo !== 'admin') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        await dbConnect();

        const restaurantes = await Restaurante.find({})
            .select('nome email cnpj nomeEstabelecimento createdAt')
            .sort({ createdAt: -1 });

        return NextResponse.json(restaurantes);
    } catch (error) {
        console.error('Erro ao buscar restaurantes:', error);
        return NextResponse.json({ error: 'Erro ao buscar restaurantes' }, { status: 500 });
    }
}
