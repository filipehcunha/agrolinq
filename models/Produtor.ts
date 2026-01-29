import mongoose, { Schema } from 'mongoose';

const ProdutorSchema = new Schema({
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
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório.'],
    unique: true,
  },
  senhaHash: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    default: 'produtor',
    enum: ['produtor'],
  },
  // Detalhes da fazenda/produtor
  nomeFazenda: { type: String },
  descricaoFazenda: { type: String },
  localizacao: { type: String }, // Ex: "Holambra, SP"
  fotoFazenda: { type: String },
  telefone: { type: String },
  whatsapp: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Produtor = mongoose.models.Produtor || mongoose.model('Produtor', ProdutorSchema);

export default Produtor;
