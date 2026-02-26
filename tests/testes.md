# Evidências e Documentação de Testes - Agrolinq

Este documento resume a infraestrutura e a cobertura de testes do projeto Agrolinq, abrangendo tanto testes unitários quanto testes de ponta a ponta (E2E).

## 1. Testes de Ponta a Ponta (E2E) - Playwright
Os testes E2E estão localizados em `tests/e2e` e garantem que os principais fluxos do usuário funcionem conforme esperado no navegador.

### Suite de Testes
- **Cadastro (`cadastro.spec.ts`)**: Verifica o fluxo completo de registro de novos usuários, utilizando dados dinâmicos e garantindo a unicidade de CPFs e e-mails para evitar colisões.
- **Login (`login.spec.ts`)**: Testa o acesso ao sistema, incluindo casos de sucesso como consumidor, tratamento de credenciais inválidas e validação de campos obrigatórios.
- **Dashboard (`dashboard.spec.ts`)**: Verifica se os elementos principais da interface são exibidos após o login e se o redirecionamento automático para a tela de login ocorre para usuários não autenticados.
- **Carrinho (`cart.spec.ts`)**: Testa a adição de produtos ao carrinho (utilizando mock de API para consistência) e a navegação para a página de finalização do pedido.

### Robustez Implementada
- **Geração de Dados Únicos**: Uso de `Date.now()` para garantir que cada execução de teste utilize dados novos.
- **Asserções com Regex**: Validação de mensagens do sistema de forma flexível e resiliente a alterações de UI.
- **Mocks Estratégicos**: Isolamento de dependências externas (como listas de produtos) para tornar os testes determinísticos.

---

## 2. Testes Unitários e de Integração - Vitest
Os testes unitários estão localizados em `tests/unit` (e alguns legados na raiz de `tests/`) e validam a lógica interna e funções utilitárias.

### Suite de Testes
- **Modelos (`models.test.ts`)**: Validação dos esquemas de dados e regras de negócio dos modelos Mongoose/Zod.
- **Formatadores (`formatters.test.ts`)**: Garante que preços, datas e documentos sejam formatados corretamente para exibição.
- **Validação de Entrada (`validators.test.ts`)**: Testa as regras de validação de formulários (CPF, E-mail, Senha).
- **Geolocalização (`geolocalizacao.test.ts`)**: Valida o cálculo de distâncias e processamento de coordenadas.
- **Autenticação (`fetchWithAuth.test.ts`)**: Testa o wrapper de requisições que gerencia tokens e cabeçalhos de segurança.
- **Utilitários (`utils.test.ts`)**: Testes para funções auxiliares diversas.

---

## 3. Como Executar os Testes

Para rodar os testes localmente:

### E2E (Playwright)
```bash
npx playwright test tests/e2e
```

### Unitários (Vitest)
```bash
npm run test:unit
```
