import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurante extends Document {
    nome: string;
    email: string;
    cnpj: string;
    senhaHash: string;
    tipo: 'restaurante';
    // Detalhes do restaurante
    nomeEstabelecimento?: string;
    descricaoEstabelecimento?: string;
    localizacao?: string;
    fotoEstabelecimento?: string;
    telefone?: string;
    whatsapp?: string;
    // Geolocalização
    latitude?: number;
    longitude?: number;
    // Preferências de compra
    categoriasProdutosInteresse?: string[];
    raioEntregaKm?: number;
    createdAt: Date;
    updatedAt: Date;
}

const RestauranteSchema = new Schema<IRestaurante>(
    {
        nome: {
            type: String,
            required: [true, 'Nome é obrigatório.'],
        },
        email: {
            type: String,
            required: [true, 'E-mail é obrigatório.'],
            unique: true,
            lowercase: true,
        },
        cnpj: {
            type: String,
            required: [true, 'CNPJ é obrigatório.'],
            unique: true,
            validate: {
                validator: function (v: string) {
                    return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(v);
                },
                message: 'CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX'
            }
        },
        senhaHash: {
            type: String,
            required: true,
        },
        tipo: {
            type: String,
            default: 'restaurante',
            enum: ['restaurante'],
        },
        nomeEstabelecimento: { type: String },
        descricaoEstabelecimento: { type: String },
        localizacao: { type: String },
        fotoEstabelecimento: { type: String },
        telefone: { type: String },
        whatsapp: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
        categoriasProdutosInteresse: [{ type: String }],
        raioEntregaKm: { type: Number, default: 50 },
    },
    { timestamps: true }
);

export default mongoose.models.Restaurante || mongoose.model<IRestaurante>('Restaurante', RestauranteSchema);
