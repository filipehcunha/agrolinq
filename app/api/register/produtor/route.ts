import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import dbConnect from '@/lib/mongodb';
import Produtor from '@/models/Produtor';

// Definição do Schema de Validação
const formSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório.'),
    email: z.string().email('E-mail inválido.'),
    cpfCnpj: z.string().min(1, 'CPF ou CNPJ é obrigatório.'),
    senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const validation = formSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Dados inválidos.' },
                { status: 400 }
            );
        }

        const { nome, email, cpfCnpj, senha } = validation.data;

        // Verificar duplicidade
        const existingProdutor = await Produtor.findOne({ $or: [{ email }, { cpfCnpj }] });

        if (existingProdutor) {
            return NextResponse.json(
                { error: 'Produtor já cadastrado.' },
                { status: 409 }
            );
        }

        // Criptografar senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Criar produtor
        const produtor = await Produtor.create({
            nome,
            email,
            cpfCnpj,
            senhaHash,
        });

        // Retorno de sucesso
        return NextResponse.json(
            {
                message: 'Produtor cadastrado com sucesso!',
                user: {
                    id: produtor._id,
                    nome: produtor.nome,
                    email: produtor.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Erro ao cadastrar produtor:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor.' },
            { status: 500 }
        );
    }
}
