
export const translateClerkError = (err: any): string => {
    const clerkError = err.errors?.[0];
    if (!clerkError) return 'Ocorreu um erro inesperado. Tente novamente.';

    const code = clerkError.code;
    const message = clerkError.message || '';

    // Mapeamento por códigos específicos do Clerk
    switch (code) {
        case 'form_password_incorrect':
            return 'Senha incorreta. Verifique e tente novamente.';
        case 'form_identifier_not_found':
            return 'Usuário não encontrado. Verifique o e-mail digitado.';
        case 'form_password_pwned':
            return 'Esta senha foi encontrada em um vazamento de dados na internet. Por segurança, escolha uma senha diferente.';
        case 'form_code_incorrect':
            return 'Código de verificação incorreto ou expirado.';
        case 'form_password_length_too_short':
            return 'A senha é muito curta. Use no mínimo 8 caracteres.';
        case 'form_email_address_invalid':
            return 'O formato do e-mail é inválido.';
        case 'form_identifier_exists':
            return 'Este e-mail já está cadastrado no sistema.';
        case 'session_exists':
            return 'Você já possui uma sessão ativa.';
        case 'user_locked':
            return 'Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em alguns minutos.';
        case 'needs_second_factor':
            return 'Autenticação de dois fatores necessária.';
        default:
            // Fallback para mensagens específicas que contenham palavras-chave
            if (message.includes('breach') || message.includes('pwned')) {
                return 'Esta senha é insegura por ter sido exposta em vazamentos. Use outra senha.';
            }
            if (message.includes('identifier')) {
                return 'E-mail ou usuário inválido.';
            }
            if (message.includes('password')) {
                return 'Erro relacionado à senha. Tente outra.';
            }

            return 'Erro na operação. Verifique seus dados e tente novamente.';
    }
};
