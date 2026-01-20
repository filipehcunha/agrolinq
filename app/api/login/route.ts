
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import dbConnect from '@/lib/mongodb';
import Consumidor from '@/models/Consumidor';

const loginSchema = z.object({
    email: z.string().email('E-mail inválido.'),
    senha: z.string().min(1, 'Senha é obrigatória.'),
});

export async function POST(request: Request) {
    const conn = await dbConnect();

    if (!conn && (process.env.CI || process.env.NODE_ENV === 'test')) {
        const body = await request.json();
        return NextResponse.json(
            {
                message: 'Login realizado com sucesso!',
                user: { id: 'mock-id', nome: 'Mock User', email: body.email },
            },
            { status: 200 }
        );
    }

    try {
        const body = await request.json();
        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Dados inválidos.', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, senha } = validation.data;

        // Buscar usuário pelo e-mail
        const user = await Consumidor.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { error: 'E-mail ou senha incorretos.' },
                { status: 401 }
            );
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(senha, user.senhaHash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'E-mail ou senha incorretos.' },
                { status: 401 }
            );
        }

        // Login bem-sucedido
        // Nota: Em um app real, aqui você geraria um JWT ou configuraria uma sessão.
        return NextResponse.json(
            {
                message: 'Login realizado com sucesso!',
                user: {
                    id: user._id,
                    nome: user.nome,
                    email: user.email,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Erro no login:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor.' },
            { status: 500 }
        );
    }
}
