"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Produto {
    _id: string;
    nome: string;
    descricao: string;
    descricaoDetalhada?: string;
    preco: number;
    imagemUrl: string;
    imagensAdicionais?: string[];
    categoria: string;
    estoque: number;
    unidade: string;
    origem?: string;
    certificacoes?: string[];
    especificacoes?: Record<string, string>;
    produtorId: string;
}

interface Produtor {
    _id: string;
    nome: string;
    email: string;
    nomeFazenda?: string;
    descricaoFazenda?: string;
    localizacao?: string;
    fotoFazenda?: string;
    telefone?: string;
    whatsapp?: string;
    seloVerde?: boolean;
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addItem, itemCount } = useCart();
    const [produto, setProduto] = useState<Produto | null>(null);
    const [produtor, setProdutor] = useState<Produtor | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantidade, setQuantidade] = useState(1);
    const [imagemAtual, setImagemAtual] = useState(0);
    const [notification, setNotification] = useState("");

    useEffect(() => {
        if (params.id) {
            fetchProductDetails();
        }
    }, [params.id]);

    const fetchProductDetails = async () => {
        try {
            // Fetch product
            const produtoRes = await fetch(`/api/products/${params.id}`);
            const produtoData = await produtoRes.json();
            setProduto(produtoData);

            // Fetch producer
            const produtorRes = await fetch(`/api/producers/${produtoData.produtorId}`);
            if (produtorRes.ok) {
                const produtorData = await produtorRes.json();
                setProdutor(produtorData);
            }
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!produto) return;

        if (produto.estoque === 0) {
            setNotification("Produto fora de estoque!");
            setTimeout(() => setNotification(""), 3000);
            return;
        }

        if (quantidade > produto.estoque) {
            setNotification(`Apenas ${produto.estoque} unidades disponíveis!`);
            setTimeout(() => setNotification(""), 3000);
            return;
        }

        addItem({
            produtoId: produto._id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: quantidade,
            imagemUrl: produto.imagemUrl,
            produtorId: produto.produtorId,
        });

        setNotification(`${quantidade}x ${produto.nome} adicionado ao carrinho!`);
        setTimeout(() => setNotification(""), 3000);
    };

    const todasImagens = produto
        ? [produto.imagemUrl, ...(produto.imagensAdicionais || [])]
        : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-500">Carregando produto...</p>
                </div>
            </div>
        );
    }

    if (!produto) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Produto não encontrado</h2>
                    <Link href="/dashboard/produtos" className="text-green-600 hover:underline">
                        Voltar para produtos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <h1 className="text-xl font-bold text-green-600">
                    <Link href="/dashboard">AGROLINQ</Link>
                </h1>
                <Link href="/dashboard/carrinho" className="relative flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Carrinho
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {itemCount}
                        </span>
                    )}
                </Link>
            </header>

            {/* Notification */}
            {notification && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
                    {notification}
                </div>
            )}

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100 px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-600">
                    <Link href="/dashboard" className="hover:text-green-600">Início</Link>
                    <span>›</span>
                    <Link href="/dashboard/produtos" className="hover:text-green-600">Produtos</Link>
                    <span>›</span>
                    <span className="text-gray-900 font-medium">{produto.nome}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Image Gallery */}
                    <div>
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-4">
                            <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                {todasImagens[imagemAtual] ? (
                                    <img
                                        src={todasImagens[imagemAtual]}
                                        alt={produto.nome}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        {todasImagens.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {todasImagens.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setImagemAtual(idx)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${imagemAtual === idx ? "border-green-600" : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <img src={img} alt={`${produto.nome} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-3">
                                {produto.categoria}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{produto.nome}</h1>
                            <p className="text-gray-600 mb-6">{produto.descricao}</p>

                            {/* Price */}
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-green-600">R$ {produto.preco.toFixed(2)}</span>
                                    <span className="text-gray-500">/ {produto.unidade}</span>
                                </div>
                            </div>

                            {/* Stock */}
                            <div className="mb-6">
                                {produto.estoque > 0 ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium">{produto.estoque} unidades disponíveis</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium">Fora de estoque</span>
                                    </div>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            {produto.estoque > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade:</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                            </svg>
                                        </button>
                                        <input
                                            type="number"
                                            value={quantidade}
                                            onChange={(e) => setQuantidade(Math.max(1, Math.min(produto.estoque, parseInt(e.target.value) || 1)))}
                                            className="w-20 h-10 text-center border border-gray-300 rounded-lg font-medium"
                                            min="1"
                                            max={produto.estoque}
                                        />
                                        <button
                                            onClick={() => setQuantidade(Math.min(produto.estoque, quantidade + 1))}
                                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={produto.estoque === 0}
                                className={`w-full py-4 rounded-lg font-bold text-lg transition-all mb-3 ${produto.estoque > 0
                                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {produto.estoque > 0 ? "Adicionar ao Carrinho" : "Produto Indisponível"}
                            </button>

                            {/* Bulk Purchase Button */}
                            {produtor?.whatsapp && (
                                <a
                                    href={`https://wa.me/${produtor.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                                        `Olá! Tenho interesse em comprar *${produto.nome}* em grande quantidade. Gostaria de negociar preço para compra em lote. Podemos conversar?`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 rounded-lg font-bold text-lg transition-all border-2 border-green-600 text-green-600 hover:bg-green-50 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    Comprar em Lote - Negociar Preço
                                </a>
                            )}

                            {/* Certifications */}
                            {produto.certificacoes && produto.certificacoes.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="font-semibold text-gray-800 mb-3">Certificações:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {produto.certificacoes.map((cert, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                                                ✓ {cert}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Origin */}
                            {produto.origem && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-sm"><strong>Origem:</strong> {produto.origem}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed Description & Specifications */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {produto.descricaoDetalhada && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Descrição Detalhada</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{produto.descricaoDetalhada}</p>
                            </div>
                        )}

                        {produto.especificacoes && Object.keys(produto.especificacoes).length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Especificações</h2>
                                <div className="space-y-3">
                                    {Object.entries(produto.especificacoes).map(([key, value]) => (
                                        <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                            <span className="font-medium text-gray-700 capitalize">{key}:</span>
                                            <span className="text-gray-600">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Seller Card */}
                    {produtor && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Vendido por</h2>

                            {produtor.fotoFazenda && (
                                <div className="mb-4 rounded-lg overflow-hidden">
                                    <img src={produtor.fotoFazenda} alt={produtor.nomeFazenda || produtor.nome} className="w-full h-32 object-cover" />
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    {produtor.nomeFazenda || produtor.nome}
                                    {produtor.seloVerde && (
                                        <span title="Produtor Certificado AgroLinq" className="text-green-600 flex items-center" style={{ filter: 'drop-shadow(0 0 2px rgba(22, 163, 74, 0.2))' }}>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    )}
                                </h3>
                                {produtor.seloVerde && (
                                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter mb-1">Produtor Certificado ✅</p>
                                )}
                                {produtor.localizacao && (
                                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        {produtor.localizacao}
                                    </p>
                                )}
                            </div>

                            {produtor.descricaoFazenda && (
                                <p className="text-sm text-gray-700 mb-4 leading-relaxed">{produtor.descricaoFazenda}</p>
                            )}

                            <div className="space-y-2 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {produtor.email}
                                </div>
                                {produtor.telefone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {produtor.telefone}
                                    </div>
                                )}
                                {produtor.whatsapp && (
                                    <a
                                        href={`https://wa.me/${produtor.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                        Chamar no WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
