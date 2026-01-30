import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { RequestStatus, SolicitacaoDesconto, Curso } from '../types';
import { supabase } from '../supabase';
import Modal from '../components/Modal';

interface AnaliseDiretorProps {
    onBack: () => void;
    solicitationId?: string;
}

const AnaliseDiretor: React.FC<AnaliseDiretorProps> = ({ onBack, solicitationId }) => {
    const [solicitacao, setSolicitacao] = useState<SolicitacaoDesconto | null>(null);
    const [curso, setCurso] = useState<Curso | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        if (!solicitacao || !file) {
            setModal({ isOpen: true, title: 'Atenção', message: 'Você deve anexar o comprovante para prosseguir.', type: 'error', redirectOnClose: false });
            return;
        }
        setSaving(true);

        try {
            // 1. Upload file
            const fileName = `solicitacao_${solicitacao.id}.pdf`;
            const { error: uploadError } = await supabase.storage
                .from('comprovantes')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Update solicitation status to AGUARDANDO_COORDENADOR
            const { error: updateError } = await supabase
                .from('solicitacoes_desconto')
                .update({
                    status: RequestStatus.AGUARDANDO_COORDENADOR,
                    atualizado_em: new Date().toISOString()
                })
                .eq('id', solicitacao.id);

            if (updateError) throw updateError;

            setModal({
                isOpen: true,
                title: 'Aprovado pelo Diretor!',
                message: 'O comprovante foi anexado e a solicitação enviada para o Coordenador.',
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
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Aprovação Direção: {solicitacao.nome_aluno}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-widest">Etapa 1: Inserção de Comprovante</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Informações da Solicitação</h3>
                            <StatusBadge status={solicitacao.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estudante</p>
                                <p className="font-bold text-gray-900">{solicitacao.nome_aluno}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Curso</p>
                                <p className="font-bold text-gray-900">{curso?.nome_curso}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Desconto Solicitado</p>
                                <p className="font-black text-primary-600 text-lg">{solicitacao.desconto_solicitado_percent}%</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mensalidade Proposta</p>
                                <p className="font-black text-gray-900 text-lg">R$ {Number(solicitacao.mensalidade_solicitada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary-500">notes</span>
                            Justificativa do Consultor
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-6 italic text-sm text-gray-600">
                            {solicitacao.observacoes || 'Sem observações.'}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border-2 border-primary-500 p-8 shadow-xl">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary-500">upload_file</span>
                            Upload Coletivo
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Anexar Comprovante (PDF)</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="diretor-upload"
                                />
                                <label
                                    htmlFor="diretor-upload"
                                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer text-center ${file ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50 hover:bg-primary-50'}`}
                                >
                                    <span className={`material-symbols-outlined text-4xl mb-3 ${file ? 'text-primary-500' : 'text-gray-300'}`}>
                                        {file ? 'task' : 'cloud_upload'}
                                    </span>
                                    <p className={`text-xs font-black uppercase tracking-widest ${file ? 'text-primary-700' : 'text-gray-400'}`}>
                                        {file ? file.name : 'Selecionar Arquivo'}
                                    </p>
                                    {!file && <p className="text-[10px] text-gray-400 mt-2">Clique para buscar o PDF</p>}
                                </label>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-amber-500 text-sm">info</span>
                                <p className="text-[10px] text-amber-800 font-medium leading-tight">
                                    Ao salvar, esta solicitação será encaminhada para o coordenador do curso para finalização do processo.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={saving || !file}
                                className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                            >
                                {saving ? 'ENVIANDO...' : 'APROVAR E ENVIAR'}
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
        </div>
    );
};

export default AnaliseDiretor;
