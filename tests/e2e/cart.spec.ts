import { test, expect } from '@playwright/test';

test.describe('Carrinho', () => {
    test('deve adicionar um produto ao carrinho', async ({ page }) => {
        // Mock da API de produtos para garantir que temos dados
        await page.route('**/api/products', async route => {
            const json = [
                {
                    _id: 'prod-123',
                    nome: 'Alface Teste',
                    preco: 5.50,
                    categoria: 'Vegetais',
                    estoque: 10,
                    unidade: 'unidade',
                    produtorId: 'produtor-123',
                    nomeProdutor: 'Fazenda Teste'
                }
            ];
            await route.fulfill({ json });
        });

        // Primeiro cadastramos um usuário para garantir que ele existe
        const uniqueId = Date.now() + Math.random().toString(36).substring(2, 7);
        const email = `testecart${uniqueId}@exemplo.com`;
        const cpf = `${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;

        await page.goto('/cadastro');
        await page.fill('input[id="nome"]', 'Usuario Cart');
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

        // Esperar os produtos carregarem e clicar no botão de adicionar do primeiro card
        const productCard = page.locator('div.bg-white.border.border-gray-200.rounded-xl').first();
        const addToCartButton = productCard.locator('button').last();
        await expect(addToCartButton).toBeVisible({ timeout: 20000 });

        await addToCartButton.click();

        // Verificar notificação de sucesso
        await expect(page.getByText(/adicionado ao carrinho/i)).toBeVisible({ timeout: 20000 });

        // Verificar contador do carrinho no header
        const cartCounter = page.locator('span.bg-green-600').filter({ hasText: /^[0-9]+$/ });
        await expect(cartCounter).toHaveText('1');
    });

    test('deve navegar para a página do carrinho', async ({ page }) => {
        // Reaproveitar login ou fazer um novo rápido
        const uniqueIdNav = Date.now() + Math.random().toString(36).substring(2, 7) + "_nav";
        const emailNav = `testecartnav${uniqueIdNav}@exemplo.com`;
        const cpfNav = `${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;

        await page.goto('/cadastro');
        await page.fill('input[id="nome"]', 'Usuario Cart Nav');
        await page.fill('input[id="email"]', emailNav);
        await page.selectOption('select[id="tipo"]', 'consumidor');
        await page.fill('input[id="cpf"]', cpfNav);
        await page.fill('input[id="senha"]', 'senha123');
        await page.click('button[type="submit"]');

        await expect(page.getByText(/Cadastro realizado com sucesso/i)).toBeVisible({ timeout: 30000 });

        await page.goto('/login');
        await page.fill('input[name="email"]', emailNav);
        await page.fill('input[name="senha"]', 'senha123');
        await page.click('button[type="submit"]');

        await page.click('text=Carrinho');
        await expect(page).toHaveURL(/\/dashboard\/carrinho/);
        await expect(page.getByRole('heading', { name: 'Seu Carrinho' })).toBeVisible();
    });
});
