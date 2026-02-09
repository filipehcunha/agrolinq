'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ChangeEvent, CSSProperties, FocusEvent, HTMLInputTypeAttribute } from 'react';
import { useState } from 'react';
import { useForm, type FieldError, type UseFormRegister } from 'react-hook-form';
import * as z from 'zod';

const PRIMARY_COLOR = '#22c55e';
const PRIMARY_HOVER_COLOR = '#16a34a';
const BG_COLOR = '#f8fafc';
const SHADOW_COLOR = 'rgba(15, 23, 42, 0.12)';
const ERROR_COLOR = '#dc2626';

const FORM_FIELD_STYLE: CSSProperties = {
  marginTop: '0.25rem',
  display: 'block',
  width: '100%',
  padding: '0.65rem 1rem',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#e5e7eb',
  borderRadius: '0.5rem',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
};

const FOCUS_STYLE: CSSProperties = {
  borderColor: PRIMARY_COLOR,
  boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.3)',
  outline: 'none',
};

// --- ZOD Schema (Validação) ---
const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório.'),
  email: z.string().email('E-mail inválido.').min(1, 'E-mail é obrigatório.'),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  tipo: z.enum(['consumidor', 'produtor', 'restaurante'], { message: 'Selecione o tipo de perfil.' }),
  nomeEstabelecimento: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  localizacao: z.string().optional(),
  categoriasProdutosInteresse: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.tipo === 'restaurante') return !!data.cnpj;
  return !!data.cpf;
}, {
  message: "Este campo é obrigatório.",
  path: ["cpf"]
});

type FormData = z.infer<typeof formSchema>;
type FormFieldName = keyof FormData;

interface FormInputProps {
  id: FormFieldName;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  label: string;
  error?: FieldError;
  register: UseFormRegister<FormData>;
  mask?: boolean;
  autoComplete?: string;
}

const FormInput = ({
  id,
  type = 'text',
  placeholder,
  label,
  error,
  register,
  mask = false,
  autoComplete,
}: FormInputProps) => {
  const { onChange, onBlur, name, ref } = register(id);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (mask) {
      let value = event.target.value.replace(/\D/g, '');
      if (id === 'cpf') {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      } else if (id === 'cnpj') {
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
      } else if (id === 'telefone') {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
      }
      event.target.value = value;
    }
    onChange(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    Object.assign(event.target.style, FORM_FIELD_STYLE);
    onBlur(event);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    Object.assign(event.target.style, FOCUS_STYLE);
  };

  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#374151',
          marginBottom: '0.25rem',
        }}
      >
        {label}
      </label>

      <input
        type={type}
        id={id}
        name={name}
        ref={ref}
        autoComplete={autoComplete}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        style={{ ...FORM_FIELD_STYLE, ...(error ? { borderColor: ERROR_COLOR } : {}) }}
        placeholder={placeholder}
        maxLength={id === 'cpf' ? 14 : id === 'cnpj' ? 18 : id === 'telefone' ? 15 : undefined}
      />

      {error && (
        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: ERROR_COLOR }}>
          {error.message}
        </p>
      )}
    </div>
  );
};

export default function CadastroPage() {
  const router = useRouter();

  const customResolver = useCallback(async (values: FormData) => {
    const result = formSchema.safeParse(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    return {
      values: {},
      errors: result.error.issues.reduce(
        (allErrors, currentError) => ({
          ...allErrors,
          [currentError.path[0]]: {
            type: currentError.code,
            message: currentError.message,
          },
        }),
        {}
      ),
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: customResolver,
    defaultValues: {
      tipo: 'consumidor',
      categoriasProdutosInteresse: []
    }
  });

  const selectedTipo = watch('tipo');

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const onSubmit = async (data: FormData) => {
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        setIsError(true);
        setMessage((responseData as { error?: string }).error || 'Ocorreu um erro ao cadastrar.');
        return;
      }


      setIsError(false);
      setMessage('Cadastro realizado com sucesso! Redirecionando...');

      const userType = (responseData as { user?: { tipo?: string } }).user?.tipo || data.tipo;
      const redirectPath = userType === 'produtor' ? '/produtor' : '/dashboard';

      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
    } catch (error: unknown) {
      setIsError(true);
      const fallbackMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
      setMessage(fallbackMessage);
    }
  };

  return (
    <>
      {/* -------------------- HEADER -------------------- */}
      <header
        style={{
          width: '100%',
          padding: '1rem 2rem',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 10,
          background: 'transparent',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '40px', position: 'relative' }}>
            <Image src="/logo.png" alt="Logo AGROLINQ" fill priority style={{ objectFit: 'contain' }} />
          </div>
        </Link>

        <Link
          href="/"
          style={{
            color: '#475569',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 500,
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            transition: 'background-color 0.15s, color 0.15s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = PRIMARY_COLOR;
            e.currentTarget.style.backgroundColor = '#ecfdf5';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#475569';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          &#8592; Voltar à Página Inicial
        </Link>
      </header>

      {/* -------------------- BODY -------------------- */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${BG_COLOR} 0%, #e2e8f0 100%)`,
          padding: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            maxWidth: '1000px',
            width: '100%',
            minHeight: '600px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '1.5rem',
            boxShadow: `0 25px 50px -12px ${SHADOW_COLOR}`,
            overflow: 'hidden',
            alignItems: 'center',
          }}
        >
          {/* Lado Esquerdo */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem',
              minWidth: '50%',
            }}
          >
            <div style={{ width: '400px', height: '145px', position: 'relative' }}>
              <Image src="/logo.png" alt="AGROLINQ Logo" fill priority style={{ objectFit: 'contain' }} />
            </div>
          </div>

          {/* Lado Direito - Form */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              padding: '3rem',
              minWidth: '50%',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '450px',
                padding: '2rem',
                borderRadius: '1rem',
                background: 'linear-gradient(180deg, #f0fff4 0%, #e6ffe6 100%)',
                boxShadow: `0 10px 15px -3px ${SHADOW_COLOR}`,
              }}
            >
              <h2
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ color: PRIMARY_COLOR, fontSize: '2rem' }} />
                🌱 Cadastre-se 🌱
              </h2>

              <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ display: 'grid', gap: '1rem', color: '#1f2937' }}
              >
                <FormInput id="nome" label="Nome" register={register} error={errors.nome} />
                <FormInput
                  id="email"
                  type="email"
                  label="E-mail"
                  register={register}
                  error={errors.email}
                  autoComplete="email"
                />
                <FormInput id="cpf" label="CPF" register={register} error={errors.cpf} mask />
                <FormInput
                  id="senha"
                  type="password"
                  label="Senha"
                  register={register}
                  error={errors.senha}
                  autoComplete="new-password"
                />

                {/* Seleção de Tipo de Usuário */}
                <div>
                  <label
                    htmlFor="tipo"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Tipo de Perfil
                  </label>
                  <select
                    id="tipo"
                    {...register('tipo')}
                    style={{
                      ...FORM_FIELD_STYLE,
                      ...(errors.tipo ? { borderColor: ERROR_COLOR } : {}),
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Selecione...</option>
                    <option value="consumidor">🛒 Consumidor - Quero comprar produtos</option>
                    <option value="produtor">🌾 Produtor - Quero vender meus produtos</option>
                    <option value="restaurante">🥡 Restaurante - Compras para meu negócio</option>
                  </select>
                  {errors.tipo && (
                    <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: ERROR_COLOR }}>
                      {errors.tipo.message}
                    </p>
                  )}
                </div>

                {/* Campos Dinâmicos baseado no Tipo */}
                {selectedTipo === 'restaurante' ? (
                  <>
                    <FormInput id="cnpj" label="CNPJ" register={register} error={errors.cnpj} mask />
                    <FormInput id="nomeEstabelecimento" label="Nome do Restaurante" register={register} error={errors.nomeEstabelecimento} placeholder="Ex: Cantina do Nonno" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <FormInput id="telefone" label="Telefone" register={register} error={errors.telefone} mask placeholder="(11) 99999-9999" />
                      <FormInput id="whatsapp" label="WhatsApp" register={register} error={errors.whatsapp} mask placeholder="(11) 99999-9999" />
                    </div>
                    <FormInput id="localizacao" label="Endereço / Localização" register={register} error={errors.localizacao} placeholder="Rua, Número, Bairro, Cidade" />

                    {/* Categorias de Interesse */}
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                        Categorias de Interesse
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {['Vegetais', 'Frutas', 'Laticínios', 'Carnes', 'Grãos', 'Ovos'].map((cat) => (
                          <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              value={cat}
                              onChange={(e) => {
                                const current = getValues('categoriasProdutosInteresse') || [];
                                if (e.target.checked) {
                                  setValue('categoriasProdutosInteresse', [...current, cat]);
                                } else {
                                  setValue('categoriasProdutosInteresse', current.filter((c) => c !== cat));
                                }
                              }}
                            />
                            {cat}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <FormInput id="cpf" label="CPF" register={register} error={errors.cpf} mask />
                )}

                {/* Mensagens */}
                {message && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: isError ? ERROR_COLOR : '#166534',
                      background: isError ? '#fef2f2' : '#ecfdf5',
                      border: `1px solid ${isError ? '#fca5a5' : '#bbf7d0'}`,
                      textAlign: 'center',
                    }}
                  >
                    {message}
                  </div>
                )}

                {/* Botão */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    marginTop: '1.5rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    background: isSubmitting ? '#93c5fd' : PRIMARY_COLOR,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.15s ease-in-out',
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) e.currentTarget.style.backgroundColor = PRIMARY_HOVER_COLOR;
                  }}
                  onMouseOut={(e) => {
                    if (!isSubmitting) e.currentTarget.style.backgroundColor = PRIMARY_COLOR;
                  }}
                >
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                </button>

                {/* Já tem conta? */}
                <p
                  style={{
                    marginTop: '1rem',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textAlign: 'center',
                  }}
                >
                  Já tem uma conta?{' '}
                  <Link href="/login" style={{ color: PRIMARY_COLOR, textDecoration: 'none' }}>
                    Faça Login
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
