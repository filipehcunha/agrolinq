import { describe, it, expect } from 'vitest';
import Restaurante from '../../models/Restaurante';
import Produto from '../../models/Produto';
import Consumidor from '../../models/Consumidor';
import Produtor from '../../models/Produtor';
import Order from '../../models/Order';
import Proposta from '../../models/Proposta';
import SeloVerde from '../../models/SeloVerde';

describe('Model Validation', () => {
    describe('Restaurante Model', () => {
        it('should validate a correct CNPJ', () => {
            const restaurante = new Restaurante({
                nome: 'Teste',
                email: 'teste@teste.com',
                cnpj: '12.345.678/0001-90',
                senhaHash: 'hash',
            });
            const error = restaurante.validateSync();
            expect(error).toBeUndefined();
        });

        it('should fail if CNPJ format is incorrect', () => {
            const restaurante = new Restaurante({
                nome: 'Teste',
                email: 'teste@teste.com',
                cnpj: '12345678000190', // No symbols
                senhaHash: 'hash',
            });
            const error = restaurante.validateSync();
            expect(error?.errors['cnpj']).toBeDefined();
            expect(error?.errors['cnpj'].message).toBe('CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX');
        });

        it('should fail if required fields are missing', () => {
            const restaurante = new Restaurante({});
            const error = restaurante.validateSync();
            expect(error?.errors['nome']).toBeDefined();
            expect(error?.errors['email']).toBeDefined();
            expect(error?.errors['cnpj']).toBeDefined();
        });
    });

    describe('Produto Model', () => {
        it('should validate a correct product', () => {
            const produto = new Produto({
                nome: 'Tomate',
                descricao: 'Tomate orgânico',
                preco: 5.5,
                categoria: 'Vegetais',
                produtorId: 'prod123',
            });
            const error = produto.validateSync();
            expect(error).toBeUndefined();
        });

        it('should fail if price is negative', () => {
            const produto = new Produto({
                nome: 'Tomate',
                descricao: 'Tomate orgânico',
                preco: -1,
                categoria: 'Vegetais',
                produtorId: 'prod123',
            });
            const error = produto.validateSync();
            expect(error?.errors['preco']).toBeDefined();
        });

        it('should fail if required fields are missing', () => {
            const produto = new Produto({});
            const error = produto.validateSync();
            expect(error?.errors['nome']).toBeDefined();
            expect(error?.errors['preco']).toBeDefined();
            expect(error?.errors['categoria']).toBeDefined();
        });
    });

    describe('Consumidor Model', () => {
        it('should fail if required fields are missing', () => {
            const consumidor = new Consumidor({});
            const error = consumidor.validateSync();
            expect(error?.errors['nome']).toBeDefined();
            expect(error?.errors['email']).toBeDefined();
            expect(error?.errors['cpf']).toBeDefined();
        });
    });

    describe('Produtor Model', () => {
        it('should fail if required fields are missing', () => {
            const produtor = new Produtor({});
            const error = produtor.validateSync();
            expect(error?.errors['nome']).toBeDefined();
            expect(error?.errors['email']).toBeDefined();
            expect(error?.errors['cpf']).toBeDefined();
        });
    });

    describe('Order Model', () => {
        it('should validate a correct order', () => {
            const order = new Order({
                consumidorId: 'cons123',
                produtorId: 'prod123',
                itens: [{ produtoId: 'p1', nome: 'A', quantidade: 1, precoUnitario: 10 }],
                total: 10,
            });
            const error = order.validateSync();
            expect(error).toBeUndefined();
        });

        it('should fail if nota is out of range', () => {
            const order = new Order({
                consumidorId: 'cons123',
                produtorId: 'prod123',
                total: 10,
                avaliacao: { nota: 6 },
            });
            const error = order.validateSync();
            expect(error?.errors['avaliacao.nota']).toBeDefined();
        });
    });

    describe('Proposta Model', () => {
        it('should validate a correct proposta', () => {
            const proposta = new Proposta({
                solicitanteId: 's123',
                itens: [{ produtoId: 'p1', nome: 'A', quantidade: 10 }],
            });
            const error = proposta.validateSync();
            expect(error).toBeUndefined();
        });
    });

    describe('SeloVerde Model', () => {
        it('should fail if descricaoPraticas is too short', () => {
            const selo = new SeloVerde({
                produtorId: 'p123',
                descricaoPraticas: 'Curta',
            });
            const error = selo.validateSync();
            expect(error?.errors['descricaoPraticas']).toBeDefined();
        });
    });
});
