


import React, { useEffect, useState } from 'react';
import { UserRole, UserProfile, Curso } from '../types';
import { supabase } from '../supabase';
import Modal from '../components/Modal';
import EditCourseModal from '../components/EditCourseModal';
import { formatCurrency, parseCurrencyToNumber } from '../utils/formatters';

const GerenciarCursos: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [coordenadores, setCoordenadores] = useState<UserProfile[]>([]);
  const [cursoCoordenadores, setCursoCoordenadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCourseModal, setEditCourseModal] = useState<{ isOpen: boolean; course: Curso | null }>({ isOpen: false, course: null });

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [curRes, usrRes, ccRes] = await Promise.all([
        supabase.from('cursos').select('*').order('nome_curso'),
        supabase.from('users_profile').select('*').eq('perfil', UserRole.COORDENADOR),
        supabase.from('curso_coordenador').select('*')
      ]);

      if (curRes.data) setCursos(curRes.data);
      if (usrRes.data) setCoordenadores(usrRes.data);
      if (ccRes.data) setCursoCoordenadores(ccRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurso = async (courseData: any) => {
    try {
      if (editCourseModal.course) {
        // Editar curso existente
        const { error } = await supabase
          .from('cursos')
          .update(courseData)
          .eq('id', editCourseModal.course.id);

        if (error) throw error;
        setModal({ isOpen: true, title: 'Sucesso', message: 'Curso atualizado com sucesso!', type: 'success' });
      } else {
        // Criar novo curso
        const { error } = await supabase
          .from('cursos')
          .insert([courseData]);

        if (error) throw error;
        setModal({ isOpen: true, title: 'Sucesso', message: 'Curso criado com sucesso!', type: 'success' });
      }

      fetchData();
      setEditCourseModal({ isOpen: false, course: null });
    } catch (error: any) {
      setModal({ isOpen: true, title: 'Erro', message: error.message, type: 'error' });
    }
  };

  const handleAssignCoordinator = async (cursoId: string, coordenadorId: string) => {
    try {
      // First, remove existing assignment for this course (if any)
      await supabase.from('curso_coordenador').delete().eq('curso_id', cursoId);

      if (coordenadorId) {
        const { error } = await supabase.from('curso_coordenador').insert({
          curso_id: cursoId,
          coordenador_id: coordenadorId
        });
        if (error) throw error;
      }

      fetchData();
      setModal({ isOpen: true, title: 'Vínculo Atualizado', message: 'O coordenador foi vinculado ao curso com sucesso.', type: 'success' });
    } catch (error: any) {
      setModal({ isOpen: true, title: 'Erro ao Vincular', message: error.message, type: 'error' });
    }
  };

  if (loading) return <div className="p-20 text-center">Carregando cursos...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Gerenciar Cursos</h2>
          <p className="text-gray-500 mt-1">Configure o vínculo entre departamentos e coordenadores.</p>
        </div>
        <button
          onClick={() => setEditCourseModal({ isOpen: true, course: null })}
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary-500/20 flex items-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          ADICIONAR CURSO
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Curso</th>
                <th className="px-6 py-4">Valor Cheio</th>
                <th className="px-6 py-4">Desconto Atual</th>
                <th className="px-6 py-4">Coordenador Vinculado</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cursos.map(course => {
                const currentCoordId = cursoCoordenadores.find(cc => cc.curso_id === course.id)?.coordenador_id || '';

                return (
                  <tr key={course.id} className="hover:bg-gray-50/30 group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{course.nome_curso}</span>
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${course.ativo ? 'text-emerald-500' : 'text-gray-400'}`}>
                          {course.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">R$</span>
                        <input
                          type="text"
                          defaultValue={formatCurrency(course.mensalidade_padrao)}
                          onFocus={(e) => e.target.select()}
                          onBlur={async (e) => {
                            const val = parseCurrencyToNumber(e.target.value);
                            if (val !== course.mensalidade_padrao) {
                              await supabase.from('cursos').update({ mensalidade_padrao: val }).eq('id', course.id);
                              fetchData();
                            }
                          }}
                          className="w-32 text-sm font-bold border-none bg-gray-50 rounded-lg py-1 px-2 focus:ring-2 focus:ring-primary-500/20 text-right outline-none"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={course.desconto_padrao.toLocaleString('pt-BR')}
                          onFocus={(e) => e.target.select()}
                          onBlur={async (e) => {
                            const val = parseFloat(e.target.value.replace(/[^0-9,]/g, '').replace(',', '.'));
                            if (!isNaN(val) && val !== course.desconto_padrao) {
                              await supabase.from('cursos').update({ desconto_padrao: val }).eq('id', course.id);
                              fetchData();
                            }
                          }}
                          className="w-16 text-sm font-bold border-none bg-gray-50 rounded-lg py-1 px-2 focus:ring-2 focus:ring-primary-500/20 text-right outline-none"
                        />
                        <span className="text-xs text-gray-400">%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={currentCoordId}
                        onChange={(e) => handleAssignCoordinator(course.id, e.target.value)}
                        className="text-xs font-bold border-none bg-gray-50 rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="">Sem coordenador</option>
                        {coordenadores.map(coord => (
                          <option key={coord.id} value={coord.id}>
                            {coord.nome.includes('@') ? coord.nome.split('@')[0] : coord.nome}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditCourseModal({ isOpen: true, course })}
                          className="p-2 text-gray-300 hover:text-primary-600 transition-colors"
                          title="Editar Curso"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button className="p-2 text-gray-300 hover:text-primary-600 transition-colors" title="Ver Detalhes">
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      <EditCourseModal
        isOpen={editCourseModal.isOpen}
        onClose={() => setEditCourseModal({ isOpen: false, course: null })}
        onSave={handleSaveCurso}
        course={editCourseModal.course}
      />
    </div>
  );
};


export default GerenciarCursos;


