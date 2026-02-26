import { test, expect } from '@playwright/test';

test.describe('Dashboard e Acesso', () => {
    test('deve redirecionar para login se não estiver autenticado', async ({ page }) => {
        await page.goto('/dashboard');
        // O redirecionamento pode variar dependendo da implementação (middleware ou client-side)
        // Se for client-side, ele pode carregar a página e depois redirecionar
        await expect(page).toHaveURL(/\/login/);
    });

    test('deve mostrar elementos do dashboard após login', async ({ page }) => {
        // Primeiro cadastramos um usuário para garantir que ele existe
        const uniqueId = Date.now() + Math.random().toString(36).substring(2, 7);
        const email = `testedash${uniqueId}@exemplo.com`;
        const cpf = `${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;

        await page.goto('/cadastro');
        await page.fill('input[id="nome"]', 'Usuario Dash');
        await page.fill('input[id="email"]', email);
        await page.selectOption('select[id="tipo"]', 'consumidor');
        await page.fill('input[id="cpf"]', cpf);
        await page.fill('input[id="senha"]', 'senha123');
        await page.click('button[type="submit"]');

        await expect(page.getByText(/Cadastro realizado com sucesso/i)).toBeVisible({ timeout: 30000 });

        // Login
        await page.goto('/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="senha"]', 'senha123');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/\/dashboard/);

        // Verificar elementos principais
        await expect(page.getByRole('heading', { name: 'AGROLINQ' })).toBeVisible();
        await expect(page.getByText('Produtos Disponíveis')).toBeVisible();
    });
});
