

import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { SolicitacaoDesconto, Curso } from '../types';
import { supabase } from '../supabase';

interface VisualizarSolicitacaoProps {
  onBack: () => void;
  solicitationId?: string;
}

const VisualizarSolicitacao: React.FC<VisualizarSolicitacaoProps> = ({ onBack, solicitationId }) => {
  const [solicitacao, setSolicitacao] = useState<SolicitacaoDesconto | null>(null);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleViewPDF = async () => {
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
      alert('Erro ao abrir PDF: ' + error.message);
    }
  };

  if (loading) return <div className="p-20 text-center">Carregando detalhes...</div>;
  if (!solicitacao) return <div className="p-20 text-center">Solicitação não encontrada.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-start no-print">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Solicitação do Aluno: {solicitacao.nome_aluno}</h2>
              <StatusBadge status={solicitacao.status} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-widest">ID: {solicitacao.id.split('-')[0]}</span>
              <span className="text-gray-400 text-xs">•</span>
              <p className="text-gray-500 text-xs">Aberto em {new Date(solicitacao.criado_em).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50"
          >
            <span className="material-symbols-outlined text-xl">print</span>
            Imprimir
          </button>
          {solicitacao.numero_chamado && (
            <button
              onClick={handleViewPDF}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 shadow-lg shadow-primary-500/20"
            >
              <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
              Ver Termo
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-500">info</span>
              Dados Gerais da Solicitação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estudante</p>
                <p className="text-sm font-bold text-gray-900">{solicitacao.nome_aluno}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CPF/Matrícula</p>
                <p className="text-sm font-bold text-gray-900">{solicitacao.cpf_matricula}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Curso</p>
                <p className="text-sm font-bold text-gray-900">{curso?.nome_curso}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocolo</p>
                <p className="text-sm font-bold text-gray-900">{solicitacao.inscricao}</p>
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

          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-500">attach_file</span>
              Documentação Comprobatória
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {solicitacao.numero_chamado ? (
                <div
                  onClick={handleViewPDF}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary-500 cursor-pointer group transition-all"
                >
                  <div className="size-12 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                    <span className="material-symbols-outlined">picture_as_pdf</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 truncate">Termo_Assinado.pdf</p>
                    <p className="text-[10px] text-gray-500">Chamado: {solicitacao.numero_chamado}</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-primary-500">visibility</span>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Nenhum documento anexado ainda.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="font-black text-gray-900 mb-6">Status Atual</h3>
            <div className="relative space-y-8">
              <div className="relative flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center size-10 rounded-full ring-8 ring-white z-10 ${solicitacao.status === 'DEFERIDO' ? 'bg-emerald-100 text-emerald-600' : solicitacao.status === 'INDEFERIDO' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                    <span className="material-symbols-outlined text-xl">
                      {solicitacao.status === 'DEFERIDO' ? 'check' : solicitacao.status === 'INDEFERIDO' ? 'close' : 'rate_review'}
                    </span>
                  </div>
                  <div className="ml-6 flex flex-col">
                    <span className="text-xs font-black text-gray-900">{solicitacao.status}</span>
                    <span className="text-[10px] text-gray-500">Atualizado em {new Date(solicitacao.atualizado_em).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary-500 rounded-2xl p-8 text-white shadow-xl shadow-primary-500/20">
            <h3 className="font-black mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined">analytics</span>
              Impacto Financeiro
            </h3>
            <p className="text-sm opacity-90 mb-6">Visualização resumida do benefício solicitado para este acadêmico.</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="text-xs font-bold uppercase">De</span>
                <span className="font-black">R$ {solicitacao.mensalidade_atual.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="text-xs font-bold uppercase">Para</span>
                <span className="font-black">R$ {solicitacao.mensalidade_solicitada.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold uppercase">Economia</span>
                <span className="text-2xl font-black">{solicitacao.desconto_solicitado_percent}% OFF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizarSolicitacao;

