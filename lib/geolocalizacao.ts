/**
 * Calcula a distância entre duas coordenadas geográficas usando a fórmula de Haversine
 * @param lat1 Latitude do ponto 1
 * @param lon1 Longitude do ponto 1
 * @param lat2 Latitude do ponto 2
 * @param lon2 Longitude do ponto 2
 * @returns Distância em quilômetros
 */
export function calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Raio da Terra em km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Arredonda para 1 casa decimal
}

function toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Filtra produtos por raio de distância
 * @param produtos Lista de produtos com produtorId
 * @param produtores Mapa de produtores com geolocalização
 * @param userLat Latitude do usuário
 * @param userLon Longitude do usuário
 * @param radiusKm Raio em quilômetros
 * @returns Produtos dentro do raio, ordenados por distância
 */
export function filtrarProdutosPorRaio<T extends { produtorId: string }>(
    produtos: T[],
    produtores: Map<string, { latitude?: number; longitude?: number; nome?: string }>,
    userLat: number,
    userLon: number,
    radiusKm: number
): (T & { distanciaKm: number; nomeProdutor?: string })[] {
    return produtos
        .map(produto => {
            const produtor = produtores.get(produto.produtorId);

            if (!produtor || produtor.latitude === undefined || produtor.longitude === undefined) {
                return null;
            }

            const distancia = calcularDistancia(
                userLat,
                userLon,
                produtor.latitude,
                produtor.longitude
            );

            return {
                ...produto,
                distanciaKm: distancia,
                nomeProdutor: produtor.nome,
            };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null && p.distanciaKm <= radiusKm)
        .sort((a, b) => a.distanciaKm - b.distanciaKm);
}
