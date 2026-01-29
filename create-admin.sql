-- Script para criar um novo usuário ADMIN
-- Execute no Supabase SQL Editor

-- IMPORTANTE: Primeiro você precisa criar o usuário no Authentication
-- Vá em Authentication > Users > Add User no Supabase Dashboard

-- Depois, pegue o UUID gerado e execute:
INSERT INTO usuarios (id, nome, email, perfil, ativo)
VALUES (
  'UUID_DO_AUTH_USER_AQUI',  -- Substitua pelo UUID do usuário criado no Authentication
  'Administrador Sistema',
  'admin@uninassau.edu.br',  -- Substitua pelo email usado no Authentication
  'ADMIN',
  true
);

-- Verificar se foi criado corretamente
SELECT * FROM usuarios WHERE perfil = 'ADMIN';
