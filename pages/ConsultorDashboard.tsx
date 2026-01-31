

import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { RequestStatus, SolicitacaoDesconto, Curso, UserProfile } from '../types';
import { supabase } from '../supabase';

interface ConsultorDashboardProps {
  onNavigate: (page: string) => void;
  view?: 'dashboard' | 'list';
  profile: UserProfile;
}

const ConsultorDashboard: React.FC<ConsultorDashboardProps> = ({ onNavigate, view = 'dashboard', profile }) => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoDesconto[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [solRes, curRes] = await Promise.all([
        supabase
          .from('solicitacoes_desconto')
          .select('*')
          .eq('criado_por', profile.id)
          .order('criado_em', { ascending: false }),
        supabase
          .from('cursos')
          .select('*')
      ]);

      if (solRes.data) setSolicitacoes(solRes.data);
      if (curRes.data) setCursos(curRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Geral', value: solicitacoes.length.toString(), icon: 'list_alt', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Em Análise', value: solicitacoes.filter(s => s.status === RequestStatus.AGUARDANDO_DIRETOR || s.status === RequestStatus.AGUARDANDO_COORDENADOR || s.status === RequestStatus.EM_ANALISE).length.toString(), icon: 'pending', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Revisão', value: solicitacoes.filter(s => s.status === RequestStatus.REVISAO_CONSULTOR).length.toString(), icon: 'rate_review', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Deferidos', value: solicitacoes.filter(s => s.status === RequestStatus.DEFERIDO).length.toString(), icon: 'verified', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Indeferidos', value: solicitacoes.filter(s => s.status === RequestStatus.INDEFERIDO).length.toString(), icon: 'cancel', color: 'text-red-600', bg: 'bg-red-50' },
  ];

  if (loading) {
    return <div className="p-20 text-center">Carregando dados...</div>;
  }

  const recentSolicitacoes = view === 'dashboard' ? solicitacoes.slice(0, 5) : solicitacoes;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {view === 'dashboard' ? 'Visão Geral' : 'Minhas Solicitações'}
          </h2>
          <p className="text-gray-500 mt-1">
            {view === 'dashboard'
              ? 'Resumo das suas atividades e métricas de desempenho.'
              : 'Gerencie todos os pedidos de desconto vinculados ao seu perfil.'}
          </p>
        </div>
        <button
          onClick={() => onNavigate('nova_solicitacao')}
          className="bg-primary-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span>NOVA SOLICITAÇÃO</span>
        </button>
      </div>

      {view === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">
            {view === 'dashboard' ? 'Solicitações Recentes' : 'Lista Completa'}
          </h3>
          <div className="flex gap-2">
            {view === 'dashboard' && solicitacoes.length > 5 && (
              <button
                onClick={() => onNavigate('solicitacoes')}
                className="text-xs font-bold px-3 py-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Ver Tudo
              </button>
            )}
            <button onClick={fetchData} className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg">Atualizar</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4">Curso</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentSolicitacoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Nenhuma solicitação encontrada.</td>
                </tr>
              ) : (
                recentSolicitacoes.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-primary-600 font-bold">{req.id.split('-')[0]}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs uppercase">
                          {req.nome_aluno.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{req.nome_aluno}</span>
                          <span className="text-[10px] text-gray-500">CPF/Matrícula: {req.cpf_matricula}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cursos.find(c => c.id === req.curso_id)?.nome_curso || 'Carregando...'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(req.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onNavigate('visualizar_solicitacao', { solicitacaoId: req.id })}
                          className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors" title="Visualizar">
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                        {req.status === RequestStatus.REVISAO_CONSULTOR && (
                          <button
                            onClick={() => onNavigate('nova_solicitacao', { solicitacaoId: req.id })}
                            className="p-1.5 text-purple-400 hover:text-purple-600 transition-colors" title="Editar / Corrigir">
                            <span className="material-symbols-outlined text-xl">edit_note</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


export default ConsultorDashboard;

