

export enum UserRole {
  ADMIN = 'ADMIN',
  CONSULTOR = 'CONSULTOR',
  COORDENADOR = 'COORDENADOR',
}

export enum RequestStatus {
  EM_ANALISE = 'EM_ANALISE',
  DEFERIDO = 'DEFERIDO',
  INDEFERIDO = 'INDEFERIDO',
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  perfil: UserRole;
  ativo: boolean;
  created_at: string;
}

export interface Curso {
  id: string;
  nome_curso: string;
  ativo: boolean;
  mensalidade_padrao: number;
  desconto_padrao: number;
}

export interface SolicitacaoDesconto {
  id: string;
  inscricao: string;
  cpf_matricula: string;
  nome_aluno: string;
  curso_id: string;
  mensalidade_atual: number;
  desconto_atual_percent: number;
  mensalidade_solicitada: number;
  desconto_solicitado_percent: number;
  status: RequestStatus;
  numero_chamado?: string;
  observacoes?: string;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
}

