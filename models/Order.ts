import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus =
  | "novo"
  | "em_separacao"
  | "enviado"
  | "concluido"
  | "cancelado";

export interface IOrder extends Document {
  consumidorId: string;
  produtorId: string;
  itens: {
    produtoId: string;
    nome: string;
    quantidade: number;
    precoUnitario: number;
  }[];
  total: number;
  status: OrderStatus;
  produtorNotificado: boolean;
  canceladoPor?: "produtor" | "consumidor";
  motivoCancelamento?: string;
  canceladoEm?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    consumidorId: { type: String, required: true },
    produtorId: { type: String, required: true },
    itens: [
      {
        produtoId: String,
        nome: String,
        quantidade: Number,
        precoUnitario: Number,
      },
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["novo", "em_separacao", "enviado", "concluido", "cancelado"],
      default: "novo",
    },
    produtorNotificado: { type: Boolean, default: false },
    canceladoPor: { type: String, enum: ["produtor", "consumidor"] },
    motivoCancelamento: { type: String },
    canceladoEm: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
