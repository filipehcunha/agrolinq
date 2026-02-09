import mongoose, { Schema, Document } from 'mongoose';

export type SeloVerdeStatus = 'pendente' | 'aprovado' | 'rejeitado';

export interface ISeloVerde extends Document {
    produtorId: string;
    status: SeloVerdeStatus;
    // Informações da solicitação
    documentos?: string[]; // URLs de documentos/certificados
    descricaoPraticas: string;
    fotosPropriedade?: string[];
    // Avaliação admin
    avaliadoPor?: string; // admin user ID
    motivoRejeicao?: string;
    avaliadoEm?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SeloVerdeSchema = new Schema<ISeloVerde>(
    {
        produtorId: {
            type: String,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['pendente', 'aprovado', 'rejeitado'],
            default: 'pendente',
        },
        documentos: [{ type: String }],
        descricaoPraticas: {
            type: String,
            required: [true, 'Descrição das práticas sustentáveis é obrigatória.'],
            minlength: 50,
            maxlength: 1000,
        },
        fotosPropriedade: [{ type: String }],
        avaliadoPor: { type: String },
        motivoRejeicao: { type: String },
        avaliadoEm: { type: Date },
    },
    { timestamps: true }
);

// Índice composto para encontrar solicitações pendentes rapidamente
SeloVerdeSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.SeloVerde || mongoose.model<ISeloVerde>('SeloVerde', SeloVerdeSchema);
