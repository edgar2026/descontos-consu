-- Script para atualizar o usuário para perfil ADMIN
-- Execute este script diretamente no Supabase SQL Editor

-- Primeiro, vamos verificar seu usuário atual
SELECT * FROM usuarios WHERE email = 'olinda@uninassau.edu.br';

-- Atualizar para perfil ADMIN (descomente e execute a linha abaixo após confirmar seu email)
-- UPDATE usuarios SET perfil = 'ADMIN', ativo = true WHERE email = 'SEU_EMAIL_AQUI';

-- Verificar novamente após a atualização
-- SELECT * FROM usuarios WHERE email = 'SEU_EMAIL_AQUI';
