


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
  const [status, setStatus] = useState<RequestStatus>(RequestStatus.EM_ANALISE);
  const [numeroChamado, setNumeroChamado] = useState('');
  const [file, setFile] = useState<File | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitacao) return;
    setSaving(true);

    try {
      // 1. Upload file if exists
      if (file) {
        const fileName = `solicitacao_${solicitacao.id}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('comprovantes')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;
      }

      // 2. Update solicitation
      const { error: updateError } = await supabase
        .from('solicitacoes_desconto')
        .update({
          status,
          numero_chamado: numeroChamado,
        })
        .eq('id', solicitacao.id);

      if (updateError) throw updateError;

      setModal({
        isOpen: true,
        title: 'Decisão Salva!',
        message: 'A análise foi registrada com sucesso no sistema.',
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
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Solicitação do Aluno: {solicitacao.nome_aluno}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-widest">ID: {solicitacao.id.split('-')[0]}</span>
            <span className="text-gray-400 text-xs">•</span>
            <p className="text-gray-500 text-xs">Formalize o parecer sobre a solicitação de desconto.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Informações da Solicitação</h3>
              <span className="text-xs font-mono text-gray-400 uppercase">ID: {solicitacao.id.split('-')[0]}</span>
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
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matrícula/CPF</p>
                <p className="text-base font-bold text-gray-900">{solicitacao.cpf_matricula}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocolo</p>
                <p className="text-base font-bold text-gray-900">{solicitacao.inscricao}</p>
              </div>
            </div>

            <div className="mt-10 bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full -mr-48 -mt-48 blur-[100px]"></div>

              <div className="flex items-center gap-4 mb-10 relative">
                <div className="size-12 rounded-2xl bg-white shadow-sm border border-gray-100 text-primary-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">analytics</span>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 uppercase tracking-[0.2em] text-[10px]">Impacto Financeiro</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Análise comparativa de viabilidade</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Grupo Atual */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-8">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cenário Atual</span>
                    <span className="material-symbols-outlined text-gray-300">history</span>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Valor Bruto Mensal</p>
                      <p className="text-2xl font-black text-gray-800">
                        <span className="text-sm font-bold text-gray-400 mr-1.5">R$</span>
                        {Number(solicitacao.mensalidade_atual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="pt-6 border-t border-gray-50">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Líquido Recebido Hoje</p>
                      <p className="text-2xl font-black text-gray-800">
                        <span className="text-sm font-bold text-gray-400 mr-1.5">R$</span>
                        {(Number(solicitacao.mensalidade_atual) * (1 - Number(solicitacao.desconto_atual_percent) / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grupo Proposto */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 rounded-[2rem] shadow-xl shadow-primary-500/20 text-white space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Cenário Proposto</span>
                    <span className="material-symbols-outlined text-white/40 animate-pulse">trending_up</span>
                  </div>
                  <div className="space-y-6 relative z-10">
                    <div>
                      <p className="text-[9px] font-black text-white/60 uppercase mb-2">Novo Desconto Solicitado</p>
                      <p className="text-3xl font-black text-white">
                        {solicitacao.desconto_solicitado_percent}%
                        <span className="text-sm font-bold ml-2 text-white/60">OFF</span>
                      </p>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <p className="text-[9px] font-black text-white/60 uppercase mb-2">Nova Mensalidade Líquida</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white/60">R$</span>
                        <p className="text-4xl font-black text-white tracking-tight">
                          {Number(solicitacao.mensalidade_solicitada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer de Economia */}
              <div className="mt-8 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="material-symbols-outlined text-2xl">savings</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Economia Real para o Aluno</p>
                    <p className="text-xl font-black text-emerald-600">
                      R$ {(Number(solicitacao.mensalidade_atual) - Number(solicitacao.mensalidade_solicitada)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <span className="text-xs font-bold ml-2 opacity-60">/mês</span>
                    </p>
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-2 text-gray-300">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cálculo Auditado</span>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-500">notes</span>
              Observações do Consultor
            </h3>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed italic">
                {solicitacao.observacoes || 'Nenhuma observação adicional foi registrada para esta solicitação.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-primary-500 p-8 shadow-xl shadow-primary-500/10">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-500">fact_check</span>
              Parecer Final
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Novo Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as RequestStatus)}
                  className="w-full rounded-xl border-gray-200 focus:ring-primary-500"
                >
                  <option value={RequestStatus.EM_ANALISE}>Em Análise</option>
                  <option value={RequestStatus.DEFERIDO}>Deferido</option>
                  <option value={RequestStatus.INDEFERIDO}>Indeferido</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Número do Chamado</label>
                <input
                  type="text"
                  value={numeroChamado}
                  onChange={e => setNumeroChamado(e.target.value)}
                  placeholder="2024-XXXX"
                  className="w-full rounded-xl border-gray-200 focus:ring-primary-500"
                />
              </div>
              {status !== RequestStatus.EM_ANALISE && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Upload Termo (PDF)</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer text-center ${file ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-gray-50 hover:bg-primary-50'}`}
                    >
                      <span className={`material-symbols-outlined text-3xl mb-2 ${file ? 'text-primary-500' : 'text-gray-300'}`}>upload_file</span>
                      <span className={`text-[10px] font-bold uppercase ${file ? 'text-primary-600' : 'text-gray-400'}`}>
                        {file ? file.name : 'Anexar PDF Assinado'}
                      </span>
                    </label>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">warning</span>
                    <p className="text-[10px] text-amber-800 font-medium leading-tight">
                      Após deferido, esta solicitação será bloqueada para edição manual. Somente o <span className="font-bold">ADMIN</span> poderá realizar alterações futuras.
                    </p>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50"
              >
                {saving ? 'SALVANDO...' : 'SALVAR DECISÃO'}
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


