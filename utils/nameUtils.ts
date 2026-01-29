/**
 * Extrai um nome profissional do email
 * Remove tudo após o @, capitaliza e formata
 */
export const extractNameFromEmail = (email: string): string => {
    if (!email) return 'N/A';

    // Pegar parte antes do @
    const username = email.split('@')[0];

    // Substituir pontos, underscores e hífens por espaços
    const cleanName = username.replace(/[._-]/g, ' ');

    // Capitalizar cada palavra
    const capitalized = cleanName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return capitalized;
};

/**
 * Obtém o nome de exibição do usuário
 * Prioriza o campo 'nome', se não existir usa o email
 */
export const getDisplayName = (user: { nome?: string; email?: string } | null): string => {
    if (!user) return 'N/A';
    if (user.nome && user.nome.trim() !== '') return user.nome;
    if (user.email) return extractNameFromEmail(user.email);
    return 'N/A';
};
