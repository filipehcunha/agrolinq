import { test, expect } from '@playwright/test';

test.describe('Login', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('deve realizar login com sucesso como consumidor', async ({ page }) => {
        // Primeiro cadastramos um usuário para garantir que ele existe
        const uniqueId = Date.now() + Math.random().toString(36).substring(2, 7);
        const email = `testelogin${uniqueId}@exemplo.com`;
        const cpf = `${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;

        await page.goto('/cadastro');
        await page.fill('input[id="nome"]', 'Usuario Teste');
        await page.fill('input[id="email"]', email);
        await page.selectOption('select[id="tipo"]', 'consumidor');
        await page.fill('input[id="cpf"]', cpf);
        await page.fill('input[id="senha"]', 'senha123');
        await page.click('button[type="submit"]');

        // Aguarda sucesso ou erro
        const successMsg = page.getByText(/Cadastro realizado com sucesso/i);
        const errorMsg = page.locator('div[style*="color: rgb(220, 38, 38)"]'); // Cor de erro do formulário

        await Promise.race([
            successMsg.waitFor({ state: 'visible', timeout: 30000 }),
            errorMsg.waitFor({ state: 'visible', timeout: 30000 }).then(() => { throw new Error(`Registration failed: ${errorMsg.textContent()}`); })
        ]);

        await page.goto('/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="senha"]', 'senha123');
        await page.click('button[type="submit"]');

        await expect(page.getByText('Login realizado com sucesso!')).toBeVisible();
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('deve exibir erro com credenciais inválidas', async ({ page }) => {
        await page.fill('input[name="email"]', 'errado@exemplo.com');
        await page.fill('input[name="senha"]', 'senhaErrada');
        await page.click('button[type="submit"]');

        await expect(page.getByText(/E-mail ou senha incorretos/i).first()).toBeVisible();
    });

    test('deve validar campos obrigatórios', async ({ page }) => {
        await page.click('button[type="submit"]');

        await expect(page.getByText('E-mail é obrigatório.')).toBeVisible();
        await expect(page.getByText('Senha é obrigatória.')).toBeVisible();
    });
});
