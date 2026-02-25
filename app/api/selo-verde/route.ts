import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SeloVerde from '@/models/SeloVerde';

// POST - Solicitar selo verde
export async function POST(request: Request) {
    try {
        await dbConnect();

        const userId = request.headers.get('x-user-id');
        const userTipo = request.headers.get('x-user-tipo');

        if (!userId || userTipo !== 'produtor') {
            return NextResponse.json(
                { error: 'Apenas produtores podem solicitar o selo verde' },
                { status: 403 }
            );
        }

        // Verificar se já existe uma solicitação pendente
        const solicitacaoPendente = await SeloVerde.findOne({
            produtorId: userId,
            status: 'pendente'
        });

        if (solicitacaoPendente) {
            return NextResponse.json(
                { error: 'Você já possui uma solicitação em análise' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { descricaoPraticas, documentos, fotosPropriedade } = body;

        if (!descricaoPraticas || descricaoPraticas.length < 50) {
            return NextResponse.json(
                { error: 'Descrição das práticas deve ter no mínimo 50 caracteres' },
                { status: 400 }
            );
        }

        const solicitacao = await SeloVerde.create({
            produtorId: userId,
            descricaoPraticas,
            documentos: documentos || [],
            fotosPropriedade: fotosPropriedade || [],
            status: 'pendente'
        });

        return NextResponse.json(
            {
                message: 'Solicitação enviada com sucesso!',
                solicitacao
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Erro ao criar solicitação:", error);
        return NextResponse.json(
            { error: 'Erro ao criar solicitação', details: String(error) },
            { status: 500 }
        );
    }
}

// GET - Obter solicitações (admin: todas pendentes, produtor: suas próprias)
export async function GET(request: Request) {
    try {
        await dbConnect();

        const userId = request.headers.get('x-user-id');
        const userTipo = request.headers.get('x-user-tipo');
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query: Record<string, unknown> = {};

        if (userTipo === 'admin') {
            // Admin vê todas solicitações
            if (status) query.status = status;
        } else if (userTipo === 'produtor') {
            // Produtor vê apenas suas solicitações
            query.produtorId = userId;
        } else {
            return NextResponse.json(
                { error: 'Sem permissão' },
                { status: 403 }
            );
        }

        const solicitacoes = await SeloVerde.find(query).sort({ createdAt: -1 });

        return NextResponse.json(solicitacoes);

    } catch (error) {
        console.error("Erro ao buscar solicitações:", error);
        return NextResponse.json(
            { error: 'Erro ao buscar solicitações', details: String(error) },
            { status: 500 }
        );
    }
}
