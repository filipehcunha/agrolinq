import { test, expect } from '@playwright/test';

test('deve cadastrar um novo usuário com sucesso', async ({ page }) => {
    // 1. Navegar para a página de cadastro
    await page.goto('http://localhost:3000/cadastro');

    // 2. Preencher o formulário
    const uniqueId = Date.now() + Math.random().toString(36).substring(2, 7);
    const nome = `Teste Automatizado ${uniqueId}`;
    const email = `teste${uniqueId}@exemplo.com`;

    // Gerador de CPF simples mas que varie mais
    const cpf = `${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;

    await page.fill('input[id="nome"]', nome);
    await page.fill('input[id="email"]', email);
    await page.selectOption('select[id="tipo"]', 'consumidor');
    await page.fill('input[id="cpf"]', cpf);
    await page.fill('input[id="senha"]', 'senha123');


    // 3. Submeter o formulário
    await page.click('button[type="submit"]');

    // 4. Verificar mensagem de sucesso
    // A mensagem de sucesso aparece em um container verde
    await expect(page.getByText(/Cadastro realizado com sucesso/i)).toBeVisible({ timeout: 15000 });
});
