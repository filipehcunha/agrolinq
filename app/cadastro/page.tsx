"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import Link from 'next/link'; // Adicionando Link para o Header

// --- ZOD Schema (Validação) ---
const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "E-mail é obrigatório."),
  cpf: z.string()
    .min(1, "CPF é obrigatório.")
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido. Use o formato XXX.XXX.XXX-XX"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type FormData = z.infer<typeof formSchema>;

export default function CadastroPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // --- Função de Submissão ---
  const onSubmit = async (data: FormData) => {
    console.log("1. --- FUNÇÃO ON SUBMIT INICIADA ---"); // <--- Adicione aqui!
    console.log("Dados a serem enviados:", data); // <--- Adicione aqui!

    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log("2. --- Requisição Enviada. Status:", response.status); // <--- Adicione aqui!

      const responseData = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(responseData.error || 'Ocorreu um erro ao cadastrar.');
      } else {
        setIsError(false);
        setMessage('Cadastro realizado com sucesso!');
        // Opcional: Limpar o formulário ou redirecionar
      }

    } catch (error: any) {
      console.error("3. --- ERRO DE REDE/CÓDIGO:", error); // <--- Adicione aqui!
      setIsError(true);
      setMessage(error.message || 'Ocorreu um erro inesperado.');
    }
    console.log("4. --- FUNÇÃO ON SUBMIT FINALIZADA ---"); // <--- Adicione aqui!
  };

  // --- Estilos e Cores ---
  const primaryColor = '#22c55e';
  const primaryHoverColor = '#16a34a';
  const bgColor = '#f8fafc';
  const shadowColor = 'rgba(15, 23, 42, 0.12)';
  const errorColor = '#dc2626';

  const formFieldStyle: React.CSSProperties = {
    marginTop: '0.25rem',
    display: 'block',
    width: '100%',
    padding: '0.65rem 1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
  };

  const focusStyle: React.CSSProperties = {
    borderColor: primaryColor,
    boxShadow: `0 0 0 3px rgba(34, 197, 94, 0.3)`,
    outline: 'none',
  };

  // Componente Auxiliar para Input (mantido aqui para simplicidade)
  const FormInput = ({ id, type = "text", placeholder, label, error, register, mask = false, autocomplete }: any) => {
    const { onChange, onBlur, name, ref } = register(id);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask && id === 'cpf') {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
      }
      onChange(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      Object.assign(e.target.style, formFieldStyle);
      onBlur(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      Object.assign(e.target.style, focusStyle);
    };

    return (
      <div>
        <label htmlFor={id} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
          {label}
        </label>
        <input
          type={type}
          id={id}
          name={name}
          ref={ref}
          autoComplete={autocomplete}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          style={{ ...formFieldStyle, ...(error ? { borderColor: errorColor } : {}) }}
          placeholder={placeholder}
          maxLength={id === 'cpf' ? 14 : undefined}
        />
        {error && <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: errorColor }}>{error.message}</p>}
      </div>
    );
  };


  return (
    <>
      {/* -------------------- HEADER INTEGRADO -------------------- */}
      <header
        style={{
          width: "100%",
          padding: "1rem 2rem",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10,
          background: "transparent",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo AGROLINQ */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '40px', position: 'relative' }}>
            <Image
              src="/logo.png"
              alt="Logo AGROLINQ"
              fill
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
        </Link>

        {/* Link de Retorno */}
        <Link
          href="/"
          style={{
            color: '#475569',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 500,
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            transition: 'background-color 0.15s, color 0.15s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = primaryColor;
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
      {/* -------------------- FIM DO HEADER -------------------- */}


      {/* CONTAINER PRINCIPAL (BODY) */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${bgColor} 0%, #e2e8f0 100%)`,
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
            boxShadow: `0 25px 50px -12px ${shadowColor}`,
            overflow: 'hidden',
            alignItems: 'center',
          }}
        >
          {/* Lado Esquerdo - Branding (Logo AGROLINQ) */}
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
              <Image
                src="/logo.png"
                alt="AGROLINQ Logo"
                fill
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Lado Direito - Card do Formulário */}
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
                boxShadow: `0 10px 15px -3px ${shadowColor}`,
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
                <span style={{ color: primaryColor, fontSize: '2rem' }}></span> 🌱 Cadastre-se 🌱
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1rem', color: '#1f2937', }}>

                <FormInput id="nome" label="Nome" register={register} error={errors.nome} />
                <FormInput id="email" type="email" label="E-mail" register={register} error={errors.email} autocomplete="email" />
                <FormInput id="cpf" label="CPF" register={register} error={errors.cpf} mask={true} />
                <FormInput id="senha" type="password" label="Senha" register={register} error={errors.senha} />

                {/* Mensagens de feedback */}
                {message && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: isError ? errorColor : primaryColor,
                      background: isError ? '#fef2f2' : '#6a8c7cff',
                      border: `1px solid ${isError ? '#fca5a5' : primaryColor}`,
                    }}
                  >
                    {message}
                  </div>
                )}

                {/* Botão de Cadastro */}
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
                    background: isSubmitting ? '#93c5fd' : primaryColor,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.15s ease-in-out',
                  }}
                  onMouseOver={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = primaryHoverColor)}
                  onMouseOut={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = primaryColor)}
                >
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                </button>

                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
                  Já tem uma conta? <a href="/login" style={{ color: primaryColor, textDecoration: 'none' }}>Faça Login</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}