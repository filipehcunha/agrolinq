export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    if (typeof window === 'undefined') {
        // Server-side: não temos acesso ao localStorage
        return fetch(url, options);
    }

    const user = JSON.parse(localStorage.getItem("agrolinq_user") || "null");

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'x-user-id': user?.id || '',
            'x-user-tipo': user?.tipo || '',
        }
    });
}
