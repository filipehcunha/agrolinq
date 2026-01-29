
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduto extends Document {
    nome: string;
    descricao: string;
    preco: number;
    imagemUrl: string;
    categoria: string;
    produtorId: string; // ID do usuário que criou o produto
    estoque: number;
    unidade: string; // kg, unidade, maço, etc.
    // Campos detalhados para página de produto
    descricaoDetalhada?: string;
    origem?: string; // Ex: "Fazenda São João, Holambra-SP"
    certificacoes?: string[]; // Ex: ["Orgânico", "Livre de agrotóxicos"]
    imagensAdicionais?: string[]; // URLs de imagens adicionais
    especificacoes?: Map<string, string>; // Ex: { peso: "500g", cor: "Verde" }
    createdAt: Date;
    updatedAt: Date;
}

const ProdutoSchema = new Schema<IProduto>(
    {
        nome: { type: String, required: [true, 'Nome do produto é obrigatório'] },
        descricao: { type: String, required: [true, 'Descrição é obrigatória'] },
        preco: { type: Number, required: [true, 'Preço é obrigatório'], min: 0 },
        imagemUrl: { type: String, required: [false, 'Imagem é opcional'] },
        categoria: { type: String, required: [true, 'Categoria é obrigatória'] },
        produtorId: { type: String, required: true },
        estoque: { type: Number, default: 0 },
        unidade: { type: String, default: 'unid' },
        // Campos detalhados
        descricaoDetalhada: { type: String },
        origem: { type: String },
        certificacoes: [{ type: String }],
        imagensAdicionais: [{ type: String }],
        especificacoes: {
            type: Map,
            of: String,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Produto || mongoose.model<IProduto>('Produto', ProdutoSchema);
