
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Produtor from '@/models/Produtor';
import Produto from '@/models/Produto';

interface ProdutoLean {
    _id: unknown;
    produtorId: string;
    [key: string]: unknown;
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const produtorId = searchParams.get('produtorId');
        const categoria = searchParams.get('categoria');

        const query: Record<string, string> = {};
        if (produtorId) query.produtorId = produtorId;
        if (categoria) query.categoria = categoria;

        const produtos = await Produto.find(query).sort({ createdAt: -1 }).lean() as unknown as ProdutoLean[];
        console.log(`DEBUG: Found ${produtos.length} products`);

        if (!Array.isArray(produtos)) {
            console.error("DEBUG: products is not an array!", produtos);
            return NextResponse.json([]);
        }

        // Get unique producer IDs and filter out any invalid ones
        const producerIds = [...new Set(produtos
            .map((p: ProdutoLean) => p.produtorId)
            .filter(id => id && typeof id === 'string'))];

        console.log(`DEBUG: Fetching ${producerIds.length} producers for enrichment`);

        let producerMap = new Map();
        try {
            // Fetch producers to check Green Seal status
            const produtores = await Produtor.find({ _id: { $in: producerIds } }).select('seloVerde').lean();
            // Create a map for quick lookup
            producerMap = new Map(produtores.map((p: { _id: { toString(): string }; seloVerde: boolean }) => [p._id.toString(), p.seloVerde]));
        } catch (prodError) {
            console.error("DEBUG: Error fetching producers for enrichment:", prodError);
            // We continue without enrichment if producer fetch fails to avoid 500
        }

        // Enrich products with Green Seal status
        const produtosComSelo = produtos.map((p: ProdutoLean) => ({
            ...p,
            seloVerde: (p.produtorId && producerMap.has(p.produtorId.toString()))
                ? producerMap.get(p.produtorId.toString())
                : false
        }));

        console.log(`DEBUG: Returning ${produtosComSelo.length} enriched products`);
        return NextResponse.json(produtosComSelo);
    } catch (error: unknown) {
        console.error("DEBUG: CRITICAL ERROR fetching products:", error);

        // Ensure we always return a valid JSON object
        const errorMessage = error instanceof Error ? error.message : String(error);

        return new Response(JSON.stringify({
            error: 'Erro interno ao buscar produtos',
            details: errorMessage,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Validations (basic)
        // Validations (basic)
        if (!body.nome || !body.preco || !body.produtorId || !body.categoria || !body.descricao) {
            return NextResponse.json({ error: 'Campos obrigatórios faltando (nome, preco, produtorId, categoria, descricao)' }, { status: 400 });
        }

        if (isNaN(Number(body.preco)) || Number(body.preco) < 0) {
            return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
        }

        const produto = await Produto.create(body);
        return NextResponse.json(produto, { status: 201 });
    } catch (error: unknown) {
        console.error("DEBUG: Error creating product:", error);

        // Handle Mongoose Validation Errors gracefully
        if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
            const err = error as unknown as { errors: Record<string, { message: string }> };
            const messages = Object.values(err.errors).map((val) => val.message);
            return NextResponse.json({ error: 'Erro de validação', details: messages }, { status: 400 });
        }

        return NextResponse.json({ error: 'Erro ao criar produto', details: String(error) }, { status: 500 });
    }
}
