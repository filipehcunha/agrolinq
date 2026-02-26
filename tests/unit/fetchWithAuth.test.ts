import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithAuth } from '../../lib/fetchWithAuth';

describe('fetchWithAuth', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            })
        ));
        localStorage.clear();
    });

    it('should add auth headers when user is logged in', async () => {
        const mockUser = { id: 'user123', tipo: 'restaurante' };
        localStorage.setItem('agrolinq_user', JSON.stringify(mockUser));

        await fetchWithAuth('/api/test');

        expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
            headers: expect.objectContaining({
                'x-user-id': 'user123',
                'x-user-tipo': 'restaurante',
            }),
        }));
    });

    it('should use empty headers when no user in localStorage', async () => {
        await fetchWithAuth('/api/test');

        expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
            headers: expect.objectContaining({
                'x-user-id': '',
                'x-user-tipo': '',
            }),
        }));
    });

    it('should merge with existing headers', async () => {
        const mockUser = { id: 'user123', tipo: 'restaurante' };
        localStorage.setItem('agrolinq_user', JSON.stringify(mockUser));

        await fetchWithAuth('/api/test', {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
            headers: expect.objectContaining({
                'Content-Type': 'application/json',
                'x-user-id': 'user123',
                'x-user-tipo': 'restaurante',
            }),
        }));
    });
});
