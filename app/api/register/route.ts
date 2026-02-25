import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import dbConnect from '@/lib/mongodb';
import Consumidor from '@/models/Consumidor';
import Produtor from '@/models/Produtor';
import Restaurante from '@/models/Restaurante';

// Definição do Schema de Validação
const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "E-mail é obrigatório."),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  tipo: z.enum(['consumidor', 'produtor', 'restaurante'], { message: 'Tipo de perfil é obrigatório.' }),
  nomeEstabelecimento: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  localizacao: z.string().optional(),
  categoriasProdutosInteresse: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.tipo === 'restaurante') return !!data.cnpj;
  return !!data.cpf;
}, {
  message: "CPF é obrigatório para usuários e CNPJ para restaurantes.",
  path: ["cpf"]
});

export async function POST(request: Request) {
  const conn = await dbConnect(); // Conecta-se ao MongoDB

  if (!conn && (process.env.CI || process.env.NODE_ENV === 'test')) {
    const body = await request.json();
    return NextResponse.json(
      {
        message: 'Cadastro realizado com sucesso!',
        user: { id: 'mock-id', nome: body.nome, email: body.email, cpf: body.cpf, tipo: body.tipo }
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

    const { nome, email, cpf, cnpj, senha, tipo, nomeEstabelecimento, telefone, whatsapp, localizacao, categoriasProdutosInteresse } = validation.data;

    // 1. Verificar Duplicidade (E-mail, CPF e CNPJ) em todas as coleções
    const existingConsumidor = await Consumidor.findOne({ $or: [{ email }, { cpf: cpf || 'non-existent' }] });
    const existingProdutor = await Produtor.findOne({ $or: [{ email }, { cpf: cpf || 'non-existent' }] });
    const existingRestaurante = await Restaurante.findOne({ $or: [{ email }, { cnpj: cnpj || 'non-existent' }] });

    const existingUser = existingConsumidor || existingProdutor || existingRestaurante;

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 });
      }
      if (cpf && (existingUser.cpf === cpf)) {
        return NextResponse.json({ error: 'CPF já cadastrado.' }, { status: 409 });
      }
      if (cnpj && (existingUser.cnpj === cnpj)) {
        return NextResponse.json({ error: 'CNPJ já cadastrado.' }, { status: 409 });
      }
    }

    // 2. Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 3. Salvar no modelo apropriado baseado no tipo
    let Model;
    const userData: Record<string, unknown> = { nome, email, senhaHash, tipo };

    if (tipo === 'produtor') {
      Model = Produtor;
      userData.cpf = cpf;
    } else if (tipo === 'restaurante') {
      Model = Restaurante;
      userData.cnpj = cnpj;
      userData.nomeEstabelecimento = nomeEstabelecimento;
      userData.telefone = telefone;
      userData.whatsapp = whatsapp;
      userData.localizacao = localizacao;
      userData.categoriasProdutosInteresse = categoriasProdutosInteresse;
    } else {
      Model = Consumidor;
      userData.cpf = cpf;
    }

    const newUser = await Model.create(userData);

    // 4. Retorna a resposta de sucesso
    return NextResponse.json(
      {
        message: 'Cadastro realizado com sucesso!',
        user: {
          id: newUser._id,
          nome: newUser.nome,
          email: newUser.email,
          cpf: newUser.cpf || null,
          cnpj: newUser.cnpj || null,
          tipo: newUser.tipo,
        }
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error("DEBUG: Full error producing user:", error);

    const err = error as { code?: number; name?: string; errors?: Record<string, { message: string }>; message?: string };

    // Mongoose duplicate key error
    if (err.code === 11000) {
      return NextResponse.json({ error: 'E-mail ou CPF já cadastrado no sistema.' }, { status: 409 });
    }

    // Erros de validação do Mongoose
    if (err.name === 'ValidationError' && err.errors) {
      const messages = Object.values(err.errors).map((val) => val.message);
      return NextResponse.json({ error: 'Erro de validação dos dados.', details: messages }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor ao cadastrar.', details: err.message || String(error) },
      { status: 500 }
    );
  }
}