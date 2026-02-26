import { describe, it, expect } from 'vitest';
import { calcularDistancia } from '../../lib/geolocalizacao';

describe('Utility Functions', () => {
    describe('calcularDistancia', () => {
        it('should handle extreme latitudes/longitudes', () => {
            const dist = calcularDistancia(90, 0, -90, 0); // North to South pole
            expect(dist).toBeGreaterThan(20000);
        });

        it('should return 0 for identical points', () => {
            expect(calcularDistancia(10, 20, 10, 20)).toBe(0);
        });

        it('should handle small distances', () => {
            const dist = calcularDistancia(0, 0, 0, 0.001); // Roughly 111 meters
            expect(dist).toBe(0.1);
        });
    });
});
