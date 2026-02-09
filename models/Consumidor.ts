// models/Consumidor.ts
import mongoose, { Schema } from 'mongoose';

// 1. Define o Schema
const ConsumidorSchema = new Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório.'],
  },
  email: {
    type: String,
    required: [true, 'E-mail é obrigatório.'],
    unique: true, // Garante unicidade no DB
    lowercase: true,
  },
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório.'],
    unique: true, // Garante unicidade no DB
  },
  senhaHash: { // Armazenará a senha CRIPTOGRAFADA
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    default: 'consumidor',
    enum: ['consumidor', 'admin'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 2. Middleware para criptografar a senha antes de salvar
// O campo `senhaHash` será populado na API Route.

// 3. Compila o Modelo
// Se o modelo já foi compilado, usa o existente; se não, compila um novo.
const Consumidor = mongoose.models.Consumidor || mongoose.model('Consumidor', ConsumidorSchema);

export default Consumidor;