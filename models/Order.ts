import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus =
  | "novo"
  | "em_separacao"
  | "enviado"
  | "concluido";

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
  createdAt: Date;
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
      enum: ["novo", "em_separacao", "enviado", "concluido"],
      default: "novo",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
