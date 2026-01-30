

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { RequestStatus } from '../types';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState([
    { label: 'Total Solicitações', value: '0', change: '0%', color: 'text-blue-600', bg: 'bg-blue-50', icon: 'list_alt' },
    { label: 'Em Análise', value: '0', change: '0%', color: 'text-amber-600', bg: 'bg-amber-50', icon: 'pending_actions' },
    { label: 'Deferidos', value: '0', change: '0%', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'verified' },
    { label: 'Indeferidos', value: '0', change: '0%', color: 'text-rose-600', bg: 'bg-rose-50', icon: 'cancel' },
  ]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: solicitacoes } = await supabase.from('solicitacoes_desconto').select('status, criado_em');

      if (solicitacoes) {
        const total = solicitacoes.length;
        const agDiretor = solicitacoes.filter(s => s.status === RequestStatus.AGUARDANDO_DIRETOR).length;
        const deferidos = solicitacoes.filter(s => s.status === RequestStatus.DEFERIDO).length;
        const indeferidos = solicitacoes.filter(s => s.status === RequestStatus.INDEFERIDO).length;

        setStats([
          { label: 'Total Solicitações', value: total.toString(), change: 'Atualizado', color: 'text-blue-600', bg: 'bg-blue-50', icon: 'list_alt' },
          { label: 'Aguardando Diretor', value: agDiretor.toString(), change: `${((agDiretor / total) * 100 || 0).toFixed(0)}%`, color: 'text-amber-600', bg: 'bg-amber-50', icon: 'pending_actions' },
          { label: 'Deferidos', value: deferidos.toString(), change: `${((deferidos / total) * 100 || 0).toFixed(0)}%`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'verified' },
          { label: 'Indeferidos', value: indeferidos.toString(), change: `${((indeferidos / total) * 100 || 0).toFixed(0)}%`, color: 'text-rose-600', bg: 'bg-rose-50', icon: 'cancel' },
        ]);
      }

      const { data: recent } = await supabase
        .from('solicitacoes_desconto')
        .select('*, users_profile(nome)')
        .order('criado_em', { ascending: false })
        .limit(5);

      if (recent) setRecentActivity(recent);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Carregando painel...</div>;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Painel Administrativo</h2>
        <p className="text-gray-500 mt-1">Visão macro de todas as concessões acadêmicas do período vigente.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-2 rounded-xl`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase">
                {stat.change}
              </span>
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-gray-900">Acessos Rápidos</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Gerenciar Usuários', icon: 'group', color: 'bg-indigo-50 text-indigo-600', page: 'gerenciar_usuarios' },
              { label: 'Gerenciar Cursos', icon: 'school', color: 'bg-purple-50 text-purple-600', page: 'gerenciar_cursos' },
              { label: 'Vincular Cursos', icon: 'hub', color: 'bg-amber-50 text-amber-600', page: 'admin_master' },
              { label: 'Exportar Relatórios', icon: 'download_for_offline', color: 'bg-primary-50 text-primary-600', page: 'dashboard_admin' },
            ].map((link, i) => (
              <button
                key={i}
                onClick={() => onNavigate(link.page)}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-50 hover:border-primary-200 hover:bg-primary-50/30 transition-all text-center group"
              >
                <div className={`${link.color} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-3xl">{link.icon}</span>
                </div>
                <span className="text-xs font-bold text-gray-700">{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h3 className="font-black text-gray-900 mb-6">Atividade Recente</h3>
          <div className="space-y-6">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma atividade recente.</p>
            ) : (
              recentActivity.map((act, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="size-2 rounded-full bg-primary-500"></div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">Nova solicitação: {act.nome_aluno}</p>
                    <p className="text-[10px] text-gray-400">Criado por: {act.users_profile?.nome || 'Consultor'} • {new Date(act.criado_em).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button onClick={fetchData} className="w-full mt-10 py-3 text-xs font-black text-primary-600 uppercase tracking-widest border border-primary-100 rounded-xl hover:bg-primary-50">
            Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  );
};


export default AdminDashboard;

