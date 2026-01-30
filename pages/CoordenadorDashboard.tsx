

import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { RequestStatus, SolicitacaoDesconto, Curso, UserProfile } from '../types';
import { supabase } from '../supabase';

interface CoordenadorDashboardProps {
  onNavigate: (page: string, params?: any) => void;
  profile: UserProfile;
}

const CoordenadorDashboard: React.FC<CoordenadorDashboardProps> = ({ onNavigate, profile }) => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoDesconto[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch coordinator's courses
      const { data: coordCursos } = await supabase
        .from('curso_coordenador')
        .select('curso_id')
        .eq('coordenador_id', profile.id);

      const cursoIds = coordCursos?.map(cc => cc.curso_id) || [];

      if (cursoIds.length > 0) {
        const [solRes, curRes] = await Promise.all([
          supabase
            .from('solicitacoes_desconto')
            .select('*')
            .in('curso_id', cursoIds)
            .eq('status', RequestStatus.AGUARDANDO_COORDENADOR)
            .order('criado_em', { ascending: false }),
          supabase
            .from('cursos')
            .select('*')
            .in('id', cursoIds)
        ]);

        if (solRes.data) setSolicitacoes(solRes.data);
        if (curRes.data) setCursos(curRes.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center">Carregando fila de análise...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Fila de Análise</h2>
        <p className="text-gray-500 mt-1">Revise as solicitações de desconto dos alunos do seu departamento.</p>
      </div>

      <div className="flex gap-4 p-4 bg-primary-50 rounded-2xl border border-primary-100 items-center">
        <span className="material-symbols-outlined text-primary-600 bg-white p-2 rounded-xl shadow-sm">assignment_late</span>
        <p className="text-sm text-primary-800 font-medium">
          Você possui <span className="font-black">{solicitacoes.length} solicitações pendentes</span> aguardando seu parecer técnico.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Solicitações Pendentes</h3>
          <div className="flex gap-2">
            <button onClick={fetchData} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100">
              <span className="material-symbols-outlined text-sm">refresh</span>
              ATUALIZAR
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4">Curso</th>
                <th className="px-6 py-4">Desconto Solicitado</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {solicitacoes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">Nenhuma solicitação pendente.</td>
                </tr>
              ) : (
                solicitacoes.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-black text-sm">
                          {req.nome_aluno.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{req.nome_aluno}</span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {req.id.split('-')[0]}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {cursos.find(c => c.id === req.curso_id)?.nome_curso}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-primary-600">{req.desconto_solicitado_percent}% OFF</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onNavigate('analise_coordenador', { solicitacaoId: req.id })}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-black rounded-lg transition-all shadow-md shadow-primary-500/10"
                      >
                        ANALISAR
                      </button>
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


export default CoordenadorDashboard;

