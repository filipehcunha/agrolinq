// models/Produtor.ts
import mongoose, { Schema } from 'mongoose';

const ProdutorSchema = new Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  cpfCnpj: {
    type: String,
    required: true,
    unique: true,
  },
  senhaHash: {
    type: String,
    required: true,
  },


  seloVerdeStatus: {
    type: String,
    enum: ['pendente', 'aprovado', 'reprovado'],
    default: 'pendente',
  },


  status: {
    type: String,
    enum: ['ativo', 'bloqueado'],
    default: 'ativo',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Produtor =
  mongoose.models.Produtor || mongoose.model('Produtor', ProdutorSchema);

export default Produtor;
