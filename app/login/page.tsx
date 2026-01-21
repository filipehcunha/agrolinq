'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const PRIMARY_COLOR = '#22c55e';
const BG_COLOR = '#f8fafc';
const SHADOW_COLOR = 'rgba(15, 23, 42, 0.12)';
const ERROR_COLOR = '#dc2626';

// Schema
const loginSchema = z.object({
    email: z.string().email('E-mail inválido.').min(1, 'E-mail é obrigatório.'),
    senha: z.string().min(1, 'Senha é obrigatória.'),
});

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // Custom Resolver (Same pattern as Cadastro)
    const customResolver = useCallback(async (values: FormData) => {
        const result = loginSchema.safeParse(values);
        if (result.success) return { values: result.data, errors: {} };
        return {
            values: {},
            errors: result.error.issues.reduce(
                (acc, curr) => ({ ...acc, [curr.path[0]]: { message: curr.message, type: curr.code } }),
                {}
            ),
        };
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: customResolver });

    const onSubmit = async (data: FormData) => {
        setMessage('');
        setIsError(false);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseData = await res.json().catch(() => ({}));

            if (!res.ok) {
                setIsError(true);
                setMessage(responseData.error || 'Erro ao realizar login.');
                return;
            }

            setIsError(false);
            setMessage('Login realizado com sucesso! Redirecionando...');

            // Redirect to dashboard
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);

        } catch (_) {
            setIsError(true);
            setMessage('Ocorreu um erro inesperado.');
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${BG_COLOR} 0%, #e2e8f0 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    background: 'white',
                    borderRadius: '1rem',
                    boxShadow: `0 10px 25px -5px ${SHADOW_COLOR}`,
                    padding: '2.5rem',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', width: 180, height: 60, margin: '0 auto' }}>
                        <Image src="/logo.png" alt="Agrolinq" fill style={{ objectFit: 'contain' }} priority />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '1rem' }}>
                        Acesse sua conta
                    </h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                            E-mail
                        </label>
                        <input
                            type="email"
                            {...register('email')}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${errors.email ? ERROR_COLOR : '#e2e8f0'}`,
                                outline: 'none',
                            }}
                            placeholder="seu@email.com"
                        />
                        {errors.email && (
                            <span style={{ color: ERROR_COLOR, fontSize: '0.75rem' }}>{errors.email.message}</span>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                            Senha
                        </label>
                        <input
                            type="password"
                            {...register('senha')}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${errors.senha ? ERROR_COLOR : '#e2e8f0'}`,
                                outline: 'none',
                            }}
                            placeholder="••••••••"
                        />
                        {errors.senha && (
                            <span style={{ color: ERROR_COLOR, fontSize: '0.75rem' }}>{errors.senha.message}</span>
                        )}
                    </div>

                    {message && (
                        <div
                            style={{
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                background: isError ? '#fef2f2' : '#ecfdf5',
                                color: isError ? ERROR_COLOR : '#15803d',
                                fontSize: '0.875rem',
                                textAlign: 'center',
                            }}
                        >
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            background: PRIMARY_COLOR,
                            color: 'white',
                            fontWeight: 600,
                            border: 'none',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            marginTop: '0.5rem',
                        }}
                    >
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                    Não tem uma conta?{' '}
                    <Link href="/cadastro" style={{ color: PRIMARY_COLOR, fontWeight: 500, textDecoration: 'none' }}>
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
}
