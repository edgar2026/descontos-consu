
export enum UserRole {
  ADMIN = 'ADMIN',
  CONSULTOR = 'CONSULTOR',
  COORDENADOR = 'COORDENADOR',
}

export enum RequestStatus {
  AGUARDANDO_DIRETOR = 'AGUARDANDO_DIRETOR',
  AGUARDANDO_COORDENADOR = 'AGUARDANDO_COORDENADOR',
  DEFERIDO = 'DEFERIDO',
  INDEFERIDO = 'INDEFERIDO',
}

export enum TipoIngresso {
  ENEM = 'ENEM',
  VESTIBULAR = 'VESTIBULAR',
  PORTADOR_DIPLOMA = 'PORTADOR DE DIPLOMA',
  TRANSFERENCIA = 'TRANSFERÊNCIA',
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
  desconto_padrao: number; // For Vestibular (Standard)
  desconto_enem: number;
  desconto_diploma: number;
  desconto_transferencia: number;
}

export interface SolicitacaoDesconto {
  id: string;
  inscricao: string;
  cpf_matricula: string;
  nome_aluno: string;
  tipo_ingresso: TipoIngresso;
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

export interface CursoCoordenador {
  id: string;
  curso_id: string;
  coordenador_id: string;
}
