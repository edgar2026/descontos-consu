

import React, { useEffect, useState } from 'react';
import { UserRole, UserProfile, Curso } from '../types';
import { supabase } from '../supabase';
import Modal from '../components/Modal';

const GerenciarUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usrRes, curRes] = await Promise.all([
        supabase.from('users_profile').select('*').order('nome'),
        supabase.from('cursos').select('*')
      ]);

      if (usrRes.data) setUsuarios(usrRes.data);
      if (curRes.data) setCursos(curRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('users_profile')
        .update({ perfil: newRole })
        .eq('id', userId);

      if (error) throw error;
      fetchData();
      setModal({ isOpen: true, title: 'Perfil Atualizado', message: 'O cargo do colaborador foi alterado com sucesso.', type: 'success' });
    } catch (error: any) {
      setModal({ isOpen: true, title: 'Erro', message: error.message, type: 'error' });
    }
  };

  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users_profile')
        .update({ ativo: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      fetchData();
      setModal({ isOpen: true, title: 'Status Alterado', message: `O usuário foi ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`, type: 'success' });
    } catch (error: any) {
      setModal({ isOpen: true, title: 'Erro', message: error.message, type: 'error' });
    }
  };

  if (loading) return <div className="p-20 text-center">Carregando colaboradores...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Colaboradores</h2>
          <p className="text-gray-500 mt-1">Gestão de permissões, perfis e status de acesso.</p>
        </div>
        <button onClick={fetchData} className="bg-primary-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/10">
          ATUALIZAR LISTA
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Colaborador</th>
                <th className="px-6 py-4">Perfil</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-black text-[10px]">
                        {user.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{user.nome}</span>
                        <span className="text-[10px] text-gray-400">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.perfil}
                      onChange={(e) => updateRole(user.id, e.target.value as UserRole)}
                      className="text-[10px] font-black uppercase border-none bg-gray-100 rounded-lg py-1 px-3"
                    >
                      <option value={UserRole.CONSULTOR}>Consultor</option>
                      <option value={UserRole.COORDENADOR}>Coordenador</option>
                      <option value={UserRole.ADMIN}>Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(user.id, user.ativo)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${user.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                    >
                      <span className="size-1.5 rounded-full bg-current"></span>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-primary-600" title="Ver Detalhes">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default GerenciarUsuarios;


