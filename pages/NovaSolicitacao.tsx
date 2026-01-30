


import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Curso, RequestStatus } from '../types';
import Modal from '../components/Modal';

interface NovaSolicitacaoProps {
  onBack: () => void;
}

const NovaSolicitacao: React.FC<NovaSolicitacaoProps> = ({ onBack }) => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    inscricao: '',
    cpf_matricula: '',
    nome_aluno: '',
    tipo_ingresso: '' as string,
    curso_id: '',
    mensalidade_atual: 0,
    desconto_atual_percent: 0,
    mensalidade_solicitada: 0,
    desconto_solicitado_percent: 0,
    observacoes: '',
  });

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error', redirectOnClose: false });

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    const { data } = await supabase.from('cursos').select('*').eq('ativo', true).order('nome_curso', { ascending: true });
    if (data) setCursos(data);
  };

  const calculateDefaultDiscount = (curso: Curso, tipoIngresso: string) => {
    switch (tipoIngresso) {
      case 'ENEM': return curso.desconto_enem || 0;
      case 'VESTIBULAR': return curso.desconto_padrao || 0;
      case 'PORTADOR DE DIPLOMA': return curso.desconto_diploma || 0;
      case 'TRANSFERÊNCIA': return curso.desconto_transferencia || 0;
      default: return curso.desconto_padrao || 0;
    }
  };

  const handleCourseChange = (cursoId: string) => {
    const selectedCourse = cursos.find(c => c.id === cursoId);
    if (selectedCourse) {
      const mensalidade = selectedCourse.mensalidade_padrao || 0;
      const desconto = calculateDefaultDiscount(selectedCourse, formData.tipo_ingresso);
      setFormData({
        ...formData,
        curso_id: cursoId,
        mensalidade_atual: mensalidade,
        desconto_atual_percent: desconto,
        desconto_solicitado_percent: desconto,
        mensalidade_solicitada: mensalidade * (1 - (desconto / 100))
      });
    } else {
      setFormData({ ...formData, curso_id: cursoId });
    }
  };

  const handleTipoIngressoChange = (tipo: string) => {
    const selectedCourse = cursos.find(c => c.id === formData.curso_id);
    if (selectedCourse) {
      const desconto = calculateDefaultDiscount(selectedCourse, tipo);
      setFormData({
        ...formData,
        tipo_ingresso: tipo,
        desconto_atual_percent: desconto,
        desconto_solicitado_percent: desconto,
        mensalidade_solicitada: formData.mensalidade_atual * (1 - (desconto / 100))
      });
    } else {
      setFormData({ ...formData, tipo_ingresso: tipo });
    }
  };

  // Auto-calculate requested monthly fee
  useEffect(() => {
    const calculada = formData.mensalidade_atual * (1 - (formData.desconto_solicitado_percent / 100));
    if (calculada !== formData.mensalidade_solicitada) {
      setFormData(prev => ({
        ...prev,
        mensalidade_solicitada: Number(calculada.toFixed(2))
      }));
    }
  }, [formData.mensalidade_atual, formData.desconto_solicitado_percent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('solicitacoes_desconto')
        .insert({
          ...formData,
          status: RequestStatus.AGUARDANDO_DIRETOR,
          criado_por: user.id
        });

      if (error) throw error;

      setModal({
        isOpen: true,
        title: 'Solicitação Criada!',
        message: 'O pedido de desconto foi enviado para análise do coordenador.',
        type: 'success',
        redirectOnClose: true
      });
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: 'Erro ao Criar',
        message: error.message,
        type: 'error',
        redirectOnClose: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    const shouldRedirect = modal.redirectOnClose;
    setModal({ ...modal, isOpen: false });
    if (shouldRedirect) onBack();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Nova Solicitação</h2>
          <p className="text-gray-500">Preencha todos os campos para iniciar o processo de análise.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna da Esquerda: Dados do Aluno e Curso */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="size-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <span className="material-symbols-outlined">person_search</span>
              </div>
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Dados do Acadêmico</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inscrição/Protocolo</label>
                <input
                  type="text"
                  required
                  value={formData.inscricao}
                  onChange={e => setFormData({ ...formData, inscricao: e.target.value })}
                  className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="Ex: 2024-ABC"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CPF ou Matrícula</label>
                <input
                  type="text"
                  required
                  value={formData.cpf_matricula}
                  onChange={e => setFormData({ ...formData, cpf_matricula: e.target.value })}
                  className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.nome_aluno}
                  onChange={e => setFormData({ ...formData, nome_aluno: e.target.value })}
                  className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="Nome do aluno"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Ingresso</label>
                <select
                  required
                  value={formData.tipo_ingresso}
                  onChange={e => handleTipoIngressoChange(e.target.value)}
                  className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                >
                  <option value="">Selecione o tipo de ingresso...</option>
                  <option value="ENEM">ENEM</option>
                  <option value="PORTADOR DE DIPLOMA">PORTADOR DE DIPLOMA</option>
                  <option value="TRANSFERÊNCIA">TRANSFERÊNCIA</option>
                  <option value="VESTIBULAR">VESTIBULAR</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Curso de Interesse</label>
                <select
                  required
                  value={formData.curso_id}
                  onChange={e => handleCourseChange(e.target.value)}
                  className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                >
                  <option value="">Selecione o curso...</option>
                  {cursos.map(c => <option key={c.id} value={c.id}>{c.nome_curso}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined">notes</span>
              </div>
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Observações Adicionais</h3>
            </div>
            <textarea
              value={formData.observacoes}
              onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-4 px-4 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[150px] resize-none"
              placeholder="Descreva detalhes importantes sobre esta solicitação..."
            />
          </div>
        </div>

        {/* Coluna da Direita: Análise Financeira */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Análise Financeira</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider h-7 flex items-end">Valor Cheio (Mensalidade)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                      <input
                        type="number"
                        required
                        value={formData.mensalidade_atual}
                        onChange={e => setFormData({ ...formData, mensalidade_atual: Number(e.target.value) })}
                        className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider h-7 flex items-end">Desconto Atual (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={formData.desconto_atual_percent}
                        onChange={e => setFormData({ ...formData, desconto_atual_percent: Number(e.target.value) })}
                        className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 pr-10 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Valor com Desconto Atual (Líquido)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600/50 text-xs font-bold">R$</span>
                    <input
                      type="text"
                      readOnly
                      value={(formData.mensalidade_atual * (1 - formData.desconto_atual_percent / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      className="w-full rounded-2xl border-emerald-100 bg-emerald-50/30 py-3 pl-10 pr-4 text-sm font-black text-emerald-700 cursor-default focus:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-primary-500 rounded-2xl text-white space-y-6 shadow-xl shadow-primary-500/20">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black opacity-70 uppercase tracking-wider">Mensalidade Solicitada</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xs font-bold">R$</span>
                    <input
                      type="text"
                      readOnly
                      value={formData.mensalidade_solicitada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      className="w-full rounded-xl border-none bg-white/10 py-3 pl-10 pr-4 text-sm font-black text-white focus:ring-0 cursor-default"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black opacity-70 uppercase tracking-wider">Desconto Solicitado</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={formData.desconto_solicitado_percent}
                      onChange={e => setFormData({ ...formData, desconto_solicitado_percent: Number(e.target.value) })}
                      className="w-full rounded-xl border-none bg-white/10 py-3 px-4 pr-10 text-sm font-black text-white focus:ring-2 focus:ring-white/20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-xs font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
              >
                {loading ? 'PROCESSANDO...' : 'CRIAR SOLICITAÇÃO'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onBack}
                className="w-full py-3 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors text-xs uppercase tracking-widest"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      </form>

      <Modal
        isOpen={modal.isOpen}
        onClose={handleModalClose}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};


export default NovaSolicitacao;


