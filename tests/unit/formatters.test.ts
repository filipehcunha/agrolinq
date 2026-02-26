import { describe, it, expect } from 'vitest';
import { formatCurrency, getAvatarInitials, getFallbackName } from '../../lib/formatters';

describe('Formatters', () => {
    describe('formatCurrency', () => {
        it('should format numbers to BRL currency string', () => {
            // Note: toLocaleString result can have non-breaking spaces
            const result = formatCurrency(10.5);
            expect(result).toMatch(/R\$\s?10,50/);
        });

        it('should handle zero', () => {
            const result = formatCurrency(0);
            expect(result).toMatch(/R\$\s?0,00/);
        });
    });

    describe('getAvatarInitials', () => {
        it('should return initials for full name', () => {
            expect(getAvatarInitials('Heitor Silva')).toBe('HS');
        });

        it('should return single initial for single name', () => {
            expect(getAvatarInitials('Heitor')).toBe('H');
        });

        it('should return initials for multi-word name', () => {
            expect(getAvatarInitials('Heitor Santos Silva')).toBe('HS');
        });

        it('should handle empty or null names', () => {
            expect(getAvatarInitials('')).toBe('?');
        });
    });

    describe('getFallbackName', () => {
        it('should return name if provided', () => {
            expect(getFallbackName('Heitor', 'Fallback')).toBe('Heitor');
        });

        it('should return fallback if name is empty', () => {
            expect(getFallbackName('', 'Fallback')).toBe('Fallback');
            expect(getFallbackName(undefined, 'Fallback')).toBe('Fallback');
        });
    });
});
