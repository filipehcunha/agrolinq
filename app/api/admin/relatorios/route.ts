import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Produto from '@/models/Produto';
import Consumidor from '@/models/Consumidor';
import Produtor from '@/models/Produtor';
import Restaurante from '@/models/Restaurante';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const userTipo = request.headers.get('x-user-tipo');

        if (userTipo !== 'admin') {
            return NextResponse.json(
                { error: 'Apenas administradores podem acessar relatórios' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const tipo = searchParams.get('tipo'); // 'pedidos' | 'produtores-selo-verde' | 'usuarios' | 'receita'

        switch (tipo) {
            case 'pedidos': {
                const pedidos = await Order.aggregate([
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 },
                            totalReceita: { $sum: '$total' }
                        }
                    }
                ]);

                const totalPedidos = await Order.countDocuments();
                const receitaTotal = await Order.aggregate([
                    { $group: { _id: null, total: { $sum: '$total' } } }
                ]);

                return NextResponse.json({
                    pedidosPorStatus: pedidos,
                    totalPedidos,
                    receitaTotal: receitaTotal[0]?.total || 0
                });
            }

            case 'produtores-selo-verde': {
                const produtoresComSelo = await Produtor.find({ seloVerde: true });
                const totalProdutores = await Produtor.countDocuments();

                return NextResponse.json({
                    totalProdutores,
                    produtoresComSeloVerde: produtoresComSelo.length,
                    percentual: ((produtoresComSelo.length / totalProdutores) * 100).toFixed(1),
                    produtores: produtoresComSelo.map(p => ({
                        id: p._id,
                        nome: p.nome,
                        nomeFazenda: p.nomeFazenda,
                        aprovadoEm: p.seloVerdeAprovadoEm
                    }))
                });
            }

            case 'usuarios': {
                const consumidores = await Consumidor.countDocuments();
                const produtores = await Produtor.countDocuments();
                const restaurantes = await Restaurante.countDocuments();

                return NextResponse.json({
                    consumidores,
                    produtores,
                    restaurantes,
                    total: consumidores + produtores + restaurantes
                });
            }

            case 'receita': {
                const receitaPorMes = await Order.aggregate([
                    {
                        $group: {
                            _id: {
                                mes: { $month: '$createdAt' },
                                ano: { $year: '$createdAt' }
                            },
                            receita: { $sum: '$total' },
                            pedidos: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.ano': -1, '_id.mes': -1 } },
                    { $limit: 12 }
                ]);

                return NextResponse.json({ receitaPorMes });
            }

            default:
                // Resumo geral
                const [
                    totalUsuarios,
                    totalProdutos,
                    totalPedidos,
                    receitaTotal
                ] = await Promise.all([
                    Promise.all([
                        Consumidor.countDocuments(),
                        Produtor.countDocuments(),
                        Restaurante.countDocuments()
                    ]).then(([c, p, r]) => c + p + r),
                    Produto.countDocuments(),
                    Order.countDocuments(),
                    Order.aggregate([
                        { $group: { _id: null, total: { $sum: '$total' } } }
                    ]).then(res => res[0]?.total || 0)
                ]);

                return NextResponse.json({
                    totalUsuarios,
                    totalProdutos,
                    totalPedidos,
                    receitaTotal
                });
        }

    } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        return NextResponse.json(
            { error: 'Erro ao gerar relatório', details: String(error) },
            { status: 500 }
        );
    }
}
