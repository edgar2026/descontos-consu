# 📄 Resumo do Projeto: Portal de Descontos Acadêmicos
**Data de Atualização:** 30/01/2026 - 00:15h

## 🚀 Visão Geral
Sistema desenvolvido para a **UNINASSAU Olinda** focado na gestão, análise e aprovação de solicitações de descontos acadêmicos. O fluxo envolve Consultores (abertura), Diretores (primeira análise) e Coordenadores (análise específica por curso).

## 🛠️ Stack Tecnológica
- **Frontend:** React + Vite + TypeScript.
- **Autenticação:** Clerk (Traduções customizadas em PT-BR).
- **Backend/Banco:** Supabase (PostgreSQL + RLS).
- **Exportação:** jsPDF (PDF) e XLSX (Excel).
- **Estilização:** TailwindCSS + Material Symbols.

## 🔑 Login e Segurança
- **Simplificação:** Removida a obrigatoriedade de MFA/Client Trust para facilitar o acesso (configurado no Clerk).
- **2FA:** Suporte implementado no frontend (`verify-2fa`) caso seja necessário ativar futuramente.
- **Traduções:** Erros técnicos convertidos para mensagens amigáveis em Português.

## 🕹️ Funcionalidades Master (Admin Coringa)
- **Aba Usuários:** Controle de perfis e status (Ativo/Inativo). 
- **Aba Cursos:** 
    - Listagem com coluna de **Coordenador Responsável**.
    - Modal de edição/criação com **dropdown de coordenadores** (vinculação automática).
- **Aba Solicitações:** 
    - Filtros por status e texto.
    - **Exportação Premium:** PDF com cabeçalho colorido e Excel com larguras de coluna ajustadas.
    - **Customização:** Campo para alterar o título do relatório diretamente na tela.
- **Aba Coordenação:** Visualização e remoção de vínculos técnicos.

## 📂 Estrutura de Dados (Supabase)
- `users_profile`: Perfis vinculados ao Clerk (CLERK_ID).
- `cursos`: Cadastro de cursos e valores.
- `solicitacoes_desconto`: O coração do sistema.
- `curso_coordenador`: Tabela pivô que une Coordenadores aos seus Cursos.

## ✅ Realizações de Hoje (29/01 - 30/01)
1.  **Vínculo Simplificado:** Criado dropdown de coordenadores no modal de cursos (Adeus IDs manuais!).
2.  **Sincronização de Banco:** O comando `handleSaveCourse` agora limpa os dados e atualiza duas tabelas simultaneamente.
3.  **Ajuste de UX:** Adicionada label "Título do Relatório (PDF)" e ícones de edição na barra de ferramentas.
4.  **Excel Inteligente:** Planilha agora abre com colunas formatadas e legíveis.
5.  **GitHub:** Todo o código está sincronizado na branch `main`.

---
**💡 Instrução para o Antigravity:** "Leia este arquivo para entender o contexto atual, os componentes modificados (`AdminCoringa.tsx`, `EditCourseModal.tsx`, `Login.tsx`) e continue o desenvolvimento a partir do fluxo de testes ponta a ponta."
