import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Produtor from '@/models/Produtor';

export async function GET(request: Request) {
    try {
        // Verificar se é admin
        const userTipo = request.headers.get('x-user-tipo');

        if (userTipo !== 'admin') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        await dbConnect();

        const produtores = await Produtor.find({})
            .select('nome email cpf nomeFazenda seloVerde createdAt')
            .sort({ createdAt: -1 });

        return NextResponse.json(produtores);
    } catch (error) {
        console.error('Erro ao buscar produtores:', error);
        return NextResponse.json({ error: 'Erro ao buscar produtores' }, { status: 500 });
    }
}
