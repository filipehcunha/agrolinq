import mongoose, { Schema, Document } from "mongoose";

export type PropostaStatus =
  | "solicitada"
  | "respondida"
  | "aceita"
  | "recusada"
  | "expirada";

export interface IProposta extends Document {
  solicitanteId: string; // consumidor ou restaurante
  itens: {
    produtoId: string;
    nome: string;
    quantidade: number;
  }[];
  status: PropostaStatus;
  respostas?: {
    produtorId: string;
    precoTotal: number;
    observacao?: string;
    respondidoEm: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const PropostaSchema = new Schema<IProposta>(
  {
    solicitanteId: { type: String, required: true },
    itens: [
      {
        produtoId: { type: String, required: true },
        nome: { type: String, required: true },
        quantidade: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["solicitada", "respondida", "aceita", "recusada", "expirada"],
      default: "solicitada",
    },
    respostas: [
      {
        produtorId: { type: String, required: true },
        precoTotal: { type: Number, required: true },
        observacao: { type: String },
        respondidoEm: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Proposta ||
  mongoose.model<IProposta>("Proposta", PropostaSchema);
