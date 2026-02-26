import { describe, it, expect } from 'vitest';
import { isValidCNPJFormat, isValidCPFFormat, cleanDocumentMask } from '../../lib/validators';

describe('Validators', () => {
    describe('isValidCNPJFormat', () => {
        it('should return true for valid format', () => {
            expect(isValidCNPJFormat('12.345.678/0001-90')).toBe(true);
        });

        it('should return false for invalid format', () => {
            expect(isValidCNPJFormat('12345678000190')).toBe(false);
            expect(isValidCNPJFormat('12.345.678/0001-9')).toBe(false);
        });
    });

    describe('isValidCPFFormat', () => {
        it('should return true for valid format', () => {
            expect(isValidCPFFormat('123.456.789-01')).toBe(true);
        });

        it('should return false for invalid format', () => {
            expect(isValidCPFFormat('12345678901')).toBe(false);
        });
    });

    describe('cleanDocumentMask', () => {
        it('should remove dots, slashes and dashes', () => {
            expect(cleanDocumentMask('12.345.678/0001-90')).toBe('12345678000190');
            expect(cleanDocumentMask('123.456.789-01')).toBe('12345678901');
        });

        it('should leave numeric strings untouched', () => {
            expect(cleanDocumentMask('12345')).toBe('12345');
        });
    });
});
