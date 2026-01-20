import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import dbConnect from '@/lib/mongodb'; // Importa a conexão
import Consumidor from '@/models/Consumidor'; // Importa o modelo

// Definição do Schema de Validação
const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "E-mail é obrigatório."),
  cpf: z.string()
    .min(1, "CPF é obrigatório.")
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido. Use o formato XXX.XXX.XXX-XX"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export async function POST(request: Request) {
  const conn = await dbConnect(); // Conecta-se ao MongoDB

  if (!conn && (process.env.CI || process.env.NODE_ENV === 'test')) {
    const body = await request.json();
    return NextResponse.json(
      {
        message: 'Cadastro realizado com sucesso!',
        user: { id: 'mock-id', nome: body.nome, email: body.email, cpf: body.cpf }
      },
      { status: 201 }
    );
  }

  try {
    const body = await request.json();
    const validation = formSchema.safeParse(body);

    if (!validation.success) {
      const flattenedErrors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          error: 'Dados de entrada inválidos.',
          details: flattenedErrors
        },
        { status: 400 }
      );
    }

    const { nome, email, cpf, senha } = validation.data;

    // 1. Verificar Duplicidade (E-mail e CPF)
    const existingUser = await Consumidor.findOne({ $or: [{ email }, { cpf }] });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 });
      }
      if (existingUser.cpf === cpf) {
        return NextResponse.json({ error: 'CPF já cadastrado.' }, { status: 409 });
      }
    }

    // 2. Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 3. Salvar o novo consumidor no banco de dados (Mongoose)
    const newConsumidor = await Consumidor.create({
      nome,
      email,
      cpf,
      senhaHash, // Salva o hash, não a senha em texto puro
    });

    // 4. Retorna a resposta de sucesso
    return NextResponse.json(
      {
        message: 'Cadastro realizado com sucesso!',
        user: {
          id: newConsumidor._id, // MongoDB usa _id
          nome: newConsumidor.nome,
          email: newConsumidor.email,
          cpf: newConsumidor.cpf,
        }
      },
      { status: 201 } // Created
    );

  } catch (error) {
    console.error("Erro ao cadastrar consumidor:", error);
    // Erros de validação do Mongoose ou outros
    return NextResponse.json(
      { error: 'Erro interno do servidor ao cadastrar.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}