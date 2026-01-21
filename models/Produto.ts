
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
    },
    { timestamps: true }
);

export default mongoose.models.Produto || mongoose.model<IProduto>('Produto', ProdutoSchema);
