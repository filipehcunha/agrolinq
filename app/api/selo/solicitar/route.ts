import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Produtor from '@/models/Produtor';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { produtorId } = await request.json();

        // Buscar produtor
        const produtor = await Produtor.findById(produtorId);

        if (!produtor) {
            return NextResponse.json(
                { error: 'Produtor não encontrado.' },
                { status: 404 }
            );
        }

        // Verificar status atual do selo
        if (produtor.seloVerdeStatus === 'pendente') {
            return NextResponse.json(
                { error: 'Solicitação já está pendente.' },
                { status: 400 }
            );
        }

        if (produtor.seloVerdeStatus === 'aprovado') {
            return NextResponse.json(
                { error: 'Selo já aprovado.' },
                { status: 400 }
            );
        }

        // Atualizar status do selo
        produtor.seloVerdeStatus = 'pendente';
        await produtor.save();

        return NextResponse.json(
            { message: 'Solicitação de selo enviada com sucesso!' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Erro ao solicitar selo:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor.' },
            { status: 500 }
        );
    }
}
