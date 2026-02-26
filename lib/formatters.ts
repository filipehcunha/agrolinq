/**
 * Formata um valor numérico para o formato de moeda brasileiro (BRL)
 */
export function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

/**
 * Obtém as iniciais de um nome (ex: "Heitor Silva" -> "HS")
 */
export function getAvatarInitials(name: string): string {
    if (!name) return "?";
    const names = name.trim().split(/\s+/);
    if (names.length === 0) return "?";
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Retorna o nome ou um fallback caso o nome esteja vazio
 */
export function getFallbackName(name: string | undefined, fallback: string): string {
    return name && name.trim() !== "" ? name : fallback;
}
