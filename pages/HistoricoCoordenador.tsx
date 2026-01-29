
import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { RequestStatus, SolicitacaoDesconto, Curso } from '../types';
import { supabase } from '../supabase';

interface HistoricoCoordenadorProps {
    onNavigate: (page: string, params?: any) => void;
}

const HistoricoCoordenador: React.FC<HistoricoCoordenadorProps> = ({ onNavigate }) => {
    const [solicitacoes, setSolicitacoes] = useState<SolicitacaoDesconto[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get coordinator's courses
            const { data: coordCourses } = await supabase
                .from('curso_coordenador')
                .select('curso_id')
                .eq('coordenador_id', user.id);

            const courseIds = coordCourses?.map(cc => cc.curso_id) || [];

            if (courseIds.length === 0) {
                setSolicitacoes([]);
                setLoading(false);
                return;
            }

            // 2. Fetch solicitations and courses
            const [solRes, curRes] = await Promise.all([
                supabase
                    .from('solicitacoes_desconto')
                    .select('*')
                    .in('curso_id', courseIds)
                    .order('atualizado_em', { ascending: false }),
                supabase
                    .from('cursos')
                    .select('*')
                    .in('id', courseIds)
            ]);

            if (solRes.data) setSolicitacoes(solRes.data);
            if (curRes.data) setCursos(curRes.data);
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSolicitacoes = solicitacoes.filter(sol => {
        const matchesSearch = sol.nome_aluno.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sol.cpf_matricula.includes(searchTerm) ||
            sol.inscricao.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || sol.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-20 text-center">Carregando histórico...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Histórico de Análises</h2>
                <p className="text-gray-500 mt-1">Consulte todas as decisões tomadas nos cursos sob sua coordenação.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por aluno, CPF ou protocolo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-48 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-600 focus:ring-2 focus:ring-primary-500/20"
                    >
                        <option value="ALL">Todos os Status</option>
                        <option value={RequestStatus.DEFERIDO}>Deferidos</option>
                        <option value={RequestStatus.INDEFERIDO}>Indeferidos</option>
                        <option value={RequestStatus.EM_ANALISE}>Em Análise</option>
                    </select>
                    <button
                        onClick={fetchData}
                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary-600 rounded-xl transition-colors"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Data Decisão</th>
                                <th className="px-6 py-4">Acadêmico</th>
                                <th className="px-6 py-4">Curso</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Número do Chamado</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredSolicitacoes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <span className="material-symbols-outlined text-4xl">history_toggle_off</span>
                                            <p className="text-sm font-medium">Nenhum registro encontrado no histórico.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSolicitacoes.map((sol) => (
                                    <tr key={sol.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {new Date(sol.atualizado_em).toLocaleDateString('pt-BR')}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(sol.atualizado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{sol.nome_aluno}</span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-tighter">CPF: {sol.cpf_matricula}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-gray-600">
                                                {cursos.find(c => c.id === sol.curso_id)?.nome_curso}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={sol.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono font-bold text-gray-400">
                                                {sol.numero_chamado || '---'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onNavigate('analise_coordenador', { solicitacaoId: sol.id })}
                                                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                                title="Ver Detalhes"
                                            >
                                                <span className="material-symbols-outlined">visibility</span>
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

export default HistoricoCoordenador;
