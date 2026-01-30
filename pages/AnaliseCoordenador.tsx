


import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { RequestStatus, SolicitacaoDesconto, Curso } from '../types';
import { supabase } from '../supabase';
import Modal from '../components/Modal';

interface AnaliseCoordenadorProps {
  onBack: () => void;
  solicitationId?: string;
}

const AnaliseCoordenador: React.FC<AnaliseCoordenadorProps> = ({ onBack, solicitationId }) => {
  const [solicitacao, setSolicitacao] = useState<SolicitacaoDesconto | null>(null);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<RequestStatus>(RequestStatus.AGUARDANDO_COORDENADOR);
  const [numeroChamado, setNumeroChamado] = useState('');

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error', redirectOnClose: false });

  useEffect(() => {
    if (solicitationId) fetchData();
  }, [solicitationId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: solData, error: solError } = await supabase
        .from('solicitacoes_desconto')
        .select('*')
        .eq('id', solicitationId)
        .single();

      if (solError) throw solError;
      setSolicitacao(solData);
      setStatus(solData.status);
      setNumeroChamado(solData.numero_chamado || '');

      const { data: curData } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', solData.curso_id)
        .single();

      if (curData) setCurso(curData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = async () => {
    if (!solicitacao) return;
    try {
      const fileName = `solicitacao_${solicitacao.id}.pdf`;
      const { data, error } = await supabase.storage
        .from('comprovantes')
        .createSignedUrl(fileName, 60);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      alert('Erro ao abrir comprovante: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitacao) return;
    if (status === RequestStatus.AGUARDANDO_COORDENADOR) {
      setModal({ isOpen: true, title: 'Atenção', message: 'Selecione um status final (Deferido ou Indeferido).', type: 'error' });
      return;
    }
    setSaving(true);

    try {
      // Update solicitation
      const { error: updateError } = await supabase
        .from('solicitacoes_desconto')
        .update({
          status,
          numero_chamado: numeroChamado,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', solicitacao.id);

      if (updateError) throw updateError;

      setModal({
        isOpen: true,
        title: 'Finalizado!',
        message: 'A solicitação foi concluída e o status atualizado.',
        type: 'success',
        redirectOnClose: true
      });
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: 'Erro ao Salvar',
        message: error.message,
        type: 'error',
        redirectOnClose: false
      });
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    const shouldRedirect = modal.redirectOnClose;
    setModal({ ...modal, isOpen: false });
    if (shouldRedirect) onBack();
  };

  if (loading) return <div className="p-20 text-center">Carregando detalhes...</div>;
  if (!solicitacao) return <div className="p-20 text-center">Solicitação não encontrada.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Finalização Coordenador: {solicitacao.nome_aluno}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-widest">Etapa Final: Abertura de Chamado</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Dados para Chamado</h3>
              <StatusBadge status={solicitacao.status} />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aluno</p>
                <p className="text-base font-bold text-gray-900">{solicitacao.nome_aluno}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Curso</p>
                <p className="text-base font-bold text-gray-900">{curso?.nome_curso}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Ingresso</p>
                <p className="text-base font-bold text-gray-900">{solicitacao.tipo_ingresso || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matrícula/CPF</p>
                <p className="text-base font-bold text-gray-900">{solicitacao.cpf_matricula}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocolo</p>
                <p className="text-base font-bold text-gray-900">{solicitacao.inscricao}</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Comprovante Anexado</h4>
                <p className="text-xs text-gray-500 italic">Disponibilizado pela Direção Acadêmica</p>
              </div>
              <button
                onClick={handleViewFile}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 font-black rounded-xl hover:bg-indigo-100 transition-all text-[10px] uppercase tracking-widest shadow-sm"
              >
                <span className="material-symbols-outlined text-xl">download_for_offline</span>
                Baixar PDF
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              <div>
                <h4 className="font-black text-gray-900 uppercase tracking-[0.2em] text-[10px]">Impacto Financeiro</h4>
                <p className="text-xs text-gray-500 mt-0.5">Resumo da concessão</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Desconto</p>
                <p className="text-xl font-black text-gray-800">{solicitacao.desconto_solicitado_percent}%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Novo Líquido</p>
                <p className="text-xl font-black text-primary-600">R$ {Number(solicitacao.mensalidade_solicitada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Economia</p>
                <p className="text-xl font-black text-emerald-600">R$ {(Number(solicitacao.mensalidade_atual) - Number(solicitacao.mensalidade_solicitada)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-primary-500 p-8 shadow-xl">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-500">fact_check</span>
              Formalização
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase font-red">Número do Chamado (Externo)</label>
                <input
                  type="text"
                  required
                  value={numeroChamado}
                  onChange={e => setNumeroChamado(e.target.value)}
                  placeholder="Ex: 2024-ABC-123"
                  className="w-full rounded-xl border-gray-200 focus:ring-primary-500 bg-gray-50 py-3"
                />
                <p className="text-[9px] text-gray-400 italic mt-1">Insira o ID do chamado aberto no sistema acadêmico</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Status Final</label>
                <select
                  required
                  value={status}
                  onChange={e => setStatus(e.target.value as RequestStatus)}
                  className="w-full rounded-xl border-gray-200 focus:ring-primary-500 bg-white py-3"
                >
                  <option value={RequestStatus.AGUARDANDO_COORDENADOR}>Escolha uma opção...</option>
                  <option value={RequestStatus.DEFERIDO}>Deferido</option>
                  <option value={RequestStatus.INDEFERIDO}>Indeferido</option>
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                <span className="material-symbols-outlined text-blue-500 text-sm">help</span>
                <p className="text-[10px] text-blue-800 font-medium leading-tight">
                  O consultor e o aluno serão notificados assim que você salvar o status final.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black rounded-xl shadow-lg transition-all disabled:opacity-50 uppercase tracking-widest text-xs mt-4"
              >
                {saving ? 'PROCESSANDO...' : 'FINALIZAR PROCESSO'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={handleModalClose}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div >
  );
};


export default AnaliseCoordenador;


