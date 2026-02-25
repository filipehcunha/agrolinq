import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Produto from '@/models/Produto';
import Produtor from '@/models/Produtor';
import { filtrarProdutosPorRaio } from '@/lib/geolocalizacao';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        const lat = parseFloat(searchParams.get('lat') || '0');
        const lng = parseFloat(searchParams.get('lng') || '0');
        const radius = parseFloat(searchParams.get('radius') || '50'); // default 50km
        const categoria = searchParams.get('categoria');
        const maxPrice = parseFloat(searchParams.get('maxPrice') || '0');

        if (!lat || !lng) {
            return NextResponse.json(
                { error: 'Parâmetros lat e lng são obrigatórios' },
                { status: 400 }
            );
        }

        // Buscar todos os produtos (aplicando filtros se existirem)
        const query: Record<string, string | object> = {};
        if (categoria) query.categoria = categoria;
        if (maxPrice > 0) query.preco = { $lte: maxPrice };

        const produtos = await Produto.find(query).lean();

        // Buscar todos os produtores com geolocalização
        const produtores = await Produtor.find({
            latitude: { $exists: true, $ne: null },
            longitude: { $exists: true, $ne: null }
        }).lean();

        // Criar mapa de produtores
        const produtoresMap = new Map(
            produtores.map(p => [
                p._id.toString(),
                {
                    latitude: p.latitude,
                    longitude: p.longitude,
                    nome: p.nome || p.nomeFazenda
                }
            ])
        );

        // Filtrar produtos por raio e enriquecer com seloVerde
        // Primeiro precisamos saber quais produtores têm seloVerde
        const seloVerdeMap = new Map(produtores.map(p => [p._id.toString(), p.seloVerde]));

        const produtosFiltrados = filtrarProdutosPorRaio(
            produtos.map(p => ({
                ...p,
                produtorId: p.produtorId.toString(),
                seloVerde: seloVerdeMap.get(p.produtorId.toString()) || false
            })),
            produtoresMap,
            lat,
            lng,
            radius
        );

        return NextResponse.json({
            produtos: produtosFiltrados,
            total: produtosFiltrados.length,
            raioKm: radius
        });

    } catch (error) {
        console.error("Erro ao buscar produtos próximos:", error);
        return NextResponse.json(
            { error: 'Erro ao buscar produtos', details: String(error) },
            { status: 500 }
        );
    }
}
