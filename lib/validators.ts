/**
 * Valida o formato de um CNPJ (XX.XXX.XXX/XXXX-XX)
 * Nota: Esta é uma validação de formato, não aritmética de dígito verificador.
 */
export function isValidCNPJFormat(cnpj: string): boolean {
    return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj);
}

/**
 * Valida o formato de um CPF (XXX.XXX.XXX-XX)
 */
export function isValidCPFFormat(cpf: string): boolean {
    return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
}

/**
 * Limpa máscara de documentos (remove tudo que não for dígito)
 */
export function cleanDocumentMask(doc: string): string {
    return doc.replace(/\D/g, '');
}
