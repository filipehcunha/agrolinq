import { describe, it, expect } from 'vitest';
import { calcularDistancia, filtrarProdutosPorRaio } from '../../lib/geolocalizacao';

describe('geolocalizacao utils', () => {
    describe('calcularDistancia', () => {
        it('should calculate distance correctly between two points', () => {
            // São Paulo to Rio de Janeiro approx distance
            const sp = { lat: -23.5505, lon: -46.6333 };
            const rj = { lat: -22.9068, lon: -43.1729 };

            const distance = calcularDistancia(sp.lat, sp.lon, rj.lat, rj.lon);

            // Expected distance is ~353km
            expect(distance).toBeGreaterThan(350);
            expect(distance).toBeLessThan(400);
        });

        it('should return 0 for the same point', () => {
            const distance = calcularDistancia(-23.5505, -46.6333, -23.5505, -46.6333);
            expect(distance).toBe(0);
        });
    });

    describe('filtrarProdutosPorRaio', () => {
        const mockProdutores = new Map([
            ['p1', { latitude: -23.5505, longitude: -46.6333, nome: 'Produtor SP' }],
            ['p2', { latitude: -22.9068, longitude: -43.1729, nome: 'Produtor RJ' }],
            ['p3', { latitude: -15.7801, longitude: -47.9292, nome: 'Produtor BSB' }],
        ]);

        const mockProdutos = [
            { id: 1, nome: 'Alface SP', produtorId: 'p1' },
            { id: 2, nome: 'Tomate RJ', produtorId: 'p2' },
            { id: 3, nome: 'Cenoura BSB', produtorId: 'p3' },
        ];

        it('should return only products within the specified radius', () => {
            // User in SP
            const userLat = -23.5505;
            const userLon = -46.6333;
            const radius = 100; // 100km

            const results = filtrarProdutosPorRaio(mockProdutos, mockProdutores, userLat, userLon, radius);

            expect(results).toHaveLength(1);
            expect(results[0].nome).toBe('Alface SP');
            expect(results[0].distanciaKm).toBe(0);
        });

        it('should return products sorted by distance', () => {
            const userLat = -23.5505;
            const userLon = -46.6333;
            const radius = 500; // 500km (enough to get SP and RJ)

            const results = filtrarProdutosPorRaio(mockProdutos, mockProdutores, userLat, userLon, radius);

            expect(results).toHaveLength(2);
            expect(results[0].nome).toBe('Alface SP');
            expect(results[1].nome).toBe('Tomate RJ');
            expect(results[0].distanciaKm).toBeLessThan(results[1].distanciaKm);
        });

        it('should exclude products from producers without coordinates', () => {
            const producersWithMissingCoords = new Map([
                ['p1', { latitude: -23.5505, longitude: -46.6333, nome: 'Produtor SP' }],
                ['p2', { nome: 'Produtor Sem Coords' }], // Missing lat/lon
            ]);

            const results = filtrarProdutosPorRaio(mockProdutos, producersWithMissingCoords, -23.5505, -46.6333, 10000);

            expect(results).toHaveLength(1);
            expect(results[0].produtorId).toBe('p1');
        });
    });
});
