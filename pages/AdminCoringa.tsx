

import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import DetailModal from '../components/DetailModal';
import EditCourseModal from '../components/EditCourseModal';
import Modal from '../components/Modal';
import { supabase } from '../supabase';
import { UserProfile, Curso, SolicitacaoDesconto } from '../types';
import { getDisplayName } from '../utils/nameUtils';

interface AdminCoringaProps {
  onNavigate?: (page: string, params?: any) => void;
}

const AdminCoringa: React.FC<AdminCoringaProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('solicitações');
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });
  const [detailModal, setDetailModal] = useState({ isOpen: false, title: '', data: [] as any[] });
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error' });
  const [editCourseModal, setEditCourseModal] = useState<{ isOpen: boolean; course: Curso | null }>({ isOpen: false, course: null });

  const tabs = ['solicitações', 'usuários', 'cursos'];

  // Filters
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pdfTitle, setPdfTitle] = useState('SOLICITAÇÃO DE DESCONTO CONSU');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'usuários') {
        const { data } = await supabase.from('users_profile').select('*').order('nome');
        if (data) setUsuarios(data);
      } else if (activeTab === 'cursos') {
        const { data } = await supabase.from('cursos').select('*').order('nome_curso');
        if (data) setCursos(data);
      } else if (activeTab === 'solicitações') {
        // Buscar solicitações básicas primeiro
        const { data: solicData, error } = await supabase
          .from('solicitacoes_desconto')
          .select('*')
          .order('criado_em', { ascending: false });

        if (error) {
          console.error('Erro ao buscar solicitações:', error);
          setSolicitacoes([]);
          return;
        }

        if (solicData && solicData.length > 0) {
          // Enriquecer com informações de usuários e cursos
          const enrichedData = await Promise.all(
            solicData.map(async (req) => {
              // Buscar consultor - apenas email
              const { data: consultorData } = await supabase
                .from('users_profile')
                .select('email, nome')
                .eq('id', req.criado_por)
                .maybeSingle();

              // Buscar curso
              const { data: curso } = await supabase
                .from('cursos')
                .select('nome_curso')
                .eq('id', req.curso_id)
                .maybeSingle();

              return {
                ...req,
                consultor: consultorData || null,
                curso: curso || { nome_curso: 'N/A' }
              };
            })
          );

          setSolicitacoes(enrichedData);
        } else {
          setSolicitacoes([]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    console.log('Iniciando exportação PDF...');
    const filtered = getFilteredSolicitacoes();
    console.log('Solicitações filtradas:', filtered.length);
    if (filtered.length === 0) {
      alert('Nenhuma solicitação encontrada para os filtros atuais.');
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Título e Cabeçalho
      doc.setFontSize(22);
      doc.setTextColor(17, 24, 39); // Gray-900
      doc.text(pdfTitle.toUpperCase(), 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // Gray-500
      doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
      doc.text(`Filtro: ${statusFilter === 'ALL' ? 'Todos os Status' : statusFilter}`, 14, 33);

      const headers = [
        ['MATRÍCULA / CPF', 'ALUNO', 'CURSO', 'CONSULTOR', 'INGRESSO', 'MENS. MÁXIMA', 'DESC. PADRÃO', 'MENSALIDADE APÓS DESC. INICIAL', 'DESC. SOLIC.', 'VALOR SOLIC.']
      ];

      const body = filtered.map(s => {
        const mensBruta = Number(s.mensalidade_atual || 0);
        const descPadrao = Number(s.desconto_atual_percent || 0);
        const liquidoPadrao = mensBruta * (1 - descPadrao / 100);

        return [
          s.cpf_matricula || s.inscricao || 'N/A',
          (s.nome_aluno || '').toUpperCase(),
          (s.curso?.nome_curso || 'N/A').toUpperCase(),
          (s.consultor?.nome || s.consultor?.email || 'N/A').toUpperCase(),
          (s.tipo_ingresso || 'N/A').toUpperCase(),
          `R$ ${mensBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `${descPadrao}%`,
          `R$ ${liquidoPadrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `${s.desconto_solicitado_percent || 0}%`,
          `R$ ${Number(s.mensalidade_solicitada || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        ];
      });

      autoTable(doc, {
        head: headers,
        body: body,
        startY: 40,
        styles: {
          fontSize: 7.5,
          cellPadding: 2.5,
          font: 'helvetica',
          valign: 'middle'
        },
        headStyles: {
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        didParseCell: function (data) {
          if (data.section === 'head') {
            // Azul para as informações iniciais (0 a 7 - até Mensalidade após Desconto Inicial)
            if (data.column.index <= 7) {
              data.cell.styles.fillColor = [10, 102, 194]; // Primary Blue
            }
            // Verde para os detalhes do desconto solicitado (8 e 9)
            else {
              data.cell.styles.fillColor = [16, 185, 129]; // Emerald Green
            }
          }
        },
        didDrawPage: function (data) {
          const str = "Página " + data.pageNumber;
          doc.setFontSize(8);
          doc.setTextColor(156, 163, 175); // Gray-400
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.text(str, data.settings.margin.left, pageHeight - 10);
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { cellWidth: 15 }, // ID
          1: { cellWidth: 30 }, // ALUNO
          2: { cellWidth: 40 }, // CURSO
          3: { cellWidth: 25 }, // CONSULTOR
          5: { halign: 'right' }, // MENS. MÁXIMA
          6: { halign: 'center' }, // DESC. PADRÃO
          7: { halign: 'right' }, // MENSALIDADE APÓS DESC. INICIAL
          8: { halign: 'center', fontStyle: 'bold' }, // DESC. SOLIC.
          9: { halign: 'right', fontStyle: 'bold' } // VALOR SOLIC.
        }
      });

      const safeTitle = pdfTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
      doc.save(`${safeTitle}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err: any) {
      console.error('Erro no PDF:', err);
      alert('Erro ao gerar PDF: ' + err.message);
    }
  };

  const getFilteredSolicitacoes = () => {
    return solicitacoes.filter(s => {
      const matchesSearch = s.nome_aluno.toLowerCase().includes(filterText.toLowerCase()) ||
        s.inscricao.toLowerCase().includes(filterText.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const handleDelete = async (type: string, id: string, name: string) => {
    const tables = { usuários: 'users_profile', cursos: 'cursos', solicitações: 'solicitacoes_desconto' };
    const table = tables[type as keyof typeof tables];

    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: `Deseja realmente excluir "${name}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) {
          setFeedbackModal({ isOpen: true, title: 'Erro', message: error.message, type: 'error' });
        } else {
          setFeedbackModal({ isOpen: true, title: 'Sucesso', message: 'Registro excluído com sucesso!', type: 'success' });
          fetchData();
        }
      }
    });
  };

  const handleViewUser = (user: UserProfile) => {
    setDetailModal({
      isOpen: true,
      title: `Detalhes de ${user.nome}`,
      data: [
        { label: 'ID', value: user.id },
        { label: 'Nome Completo', value: user.nome },
        { label: 'E-mail', value: user.email },
        {
          label: 'Perfil', value: <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.perfil === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
            user.perfil === 'COORDENADOR' ? 'bg-primary-100 text-primary-700' :
              'bg-gray-100 text-gray-700'
            }`}>{user.perfil}</span>
        },
        {
          label: 'Status', value: <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>{user.ativo ? 'Ativo' : 'Inativo'}</span>
        },
        { label: 'Criado em', value: new Date(user.created_at).toLocaleString('pt-BR') },
      ]
    });
  };

  const handleViewCourse = (course: Curso) => {
    setDetailModal({
      isOpen: true,
      title: `Detalhes do Curso`,
      data: [
        { label: 'ID', value: course.id },
        { label: 'Nome do Curso', value: course.nome_curso },
        { label: 'Mensalidade Padrão', value: `R$ ${Number(course.mensalidade_padrao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        { label: 'Desconto Padrão', value: `${course.desconto_padrao}%` },
        {
          label: 'Status', value: <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>{course.ativo ? 'Ativo' : 'Inativo'}</span>
        },
      ]
    });
  };

  const handleViewRequest = (req: any) => {
    setDetailModal({
      isOpen: true,
      title: `Solicitação de ${req.nome_aluno}`,
      data: [
        { label: 'ID', value: req.id },
        { label: 'Aluno', value: req.nome_aluno },
        { label: 'Curso', value: req.curso?.nome_curso || 'N/A' },
        { label: 'Inscrição', value: req.inscricao },
        { label: 'CPF/Matrícula', value: req.cpf_matricula },
        { label: 'Mensalidade Atual', value: `R$ ${Number(req.mensalidade_atual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        { label: 'Desconto Atual', value: `${req.desconto_atual_percent}%` },
        { label: 'Mensalidade Solicitada', value: `R$ ${Number(req.mensalidade_solicitada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        { label: 'Desconto Solicitado', value: `${req.desconto_solicitado_percent}%` },
        { label: 'Status', value: <StatusBadge status={req.status} /> },
        { label: 'Número do Chamado', value: req.numero_chamado || 'N/A' },
        { label: 'Observações', value: req.observacoes || 'Nenhuma' },
        { label: 'Aberto por (Consultor)', value: getDisplayName(req.consultor) },
        { label: 'Email do Consultor', value: req.consultor?.email || 'N/A' },
        { label: 'Analisado por (Coordenador)', value: req.coordenador ? getDisplayName(req.coordenador) : 'Ainda não analisado' },
        { label: 'Email do Coordenador', value: req.coordenador?.email || '-' },
        { label: 'Criado em', value: new Date(req.criado_em).toLocaleString('pt-BR') },
        { label: 'Atualizado em', value: new Date(req.atualizado_em).toLocaleString('pt-BR') },
      ]
    });
  };

  const handleSaveCourse = async (courseData: any) => {
    try {
      if (editCourseModal.course) {
        // Editar curso existente
        const { error } = await supabase
          .from('cursos')
          .update(courseData)
          .eq('id', editCourseModal.course.id);

        if (error) throw error;
        setFeedbackModal({ isOpen: true, title: 'Sucesso', message: 'Curso atualizado com sucesso!', type: 'success' });
      } else {
        // Criar novo curso
        const { error } = await supabase
          .from('cursos')
          .insert([courseData]);

        if (error) throw error;
        setFeedbackModal({ isOpen: true, title: 'Sucesso', message: 'Curso criado com sucesso!', type: 'success' });
      }

      fetchData();
      setEditCourseModal({ isOpen: false, course: null });
    } catch (error: any) {
      setFeedbackModal({ isOpen: true, title: 'Erro', message: error.message, type: 'error' });
    }
  };

  const renderTabContent = () => {
    if (loading) return <div className="p-20 text-center">Carregando...</div>;

    switch (activeTab) {
      case 'usuários':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Perfil</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuarios.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{user.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${user.perfil === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.perfil === 'COORDENADOR' ? 'bg-primary-100 text-primary-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                        {user.perfil}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={async () => {
                          await supabase.from('users_profile').update({ ativo: !user.ativo }).eq('id', user.id);
                          fetchData();
                        }}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase ${user.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 hover:bg-primary-50 rounded-lg text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <button className="p-2 hover:bg-primary-50 rounded-lg text-gray-400 hover:text-primary-600 transition-colors">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete('usuários', user.id, user.nome)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'cursos':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Curso</th>
                  <th className="px-6 py-4">Mensalidade</th>
                  <th className="px-6 py-4">Desconto Padrão</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cursos.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{course.nome_curso}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">R$ {Number(course.mensalidade_padrao).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary-600">{course.desconto_padrao}%</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={async () => {
                          await supabase.from('cursos').update({ ativo: !course.ativo }).eq('id', course.id);
                          fetchData();
                        }}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase ${course.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {course.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewCourse(course)}
                          className="p-2 hover:bg-primary-50 rounded-lg text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <button
                          onClick={() => setEditCourseModal({ isOpen: true, course })}
                          className="p-2 hover:bg-primary-50 rounded-lg text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete('cursos', course.id, course.nome_curso)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'solicitações':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Matrícula / CPF</th>
                  <th className="px-6 py-4">Aluno</th>
                  <th className="px-6 py-4">Curso</th>
                  <th className="px-6 py-4">Consultor</th>
                  <th className="px-6 py-4">Coordenador</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {getFilteredSolicitacoes().length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">inbox</span>
                        <p className="text-sm font-bold">Nenhuma solicitação encontrada</p>
                        <p className="text-xs mt-1">As solicitações aparecerão aqui conforme os filtros aplicados</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  getFilteredSolicitacoes().map(req => (
                    <tr key={req.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">{req.cpf_matricula || req.inscricao || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{req.nome_aluno}</td>
                      <td className="px-6 py-4 text-xs text-gray-600">{req.curso?.nome_curso || 'N/A'}</td>
                      <td className="px-6 py-4 text-xs text-gray-600">{getDisplayName(req.consultor)}</td>
                      <td className="px-6 py-4 text-xs text-gray-600">{req.coordenador ? getDisplayName(req.coordenador) : '-'}</td>
                      <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-4 text-xs text-gray-500">{new Date(req.criado_em).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === 'AGUARDANDO_DIRETOR' && onNavigate && (
                            <button
                              onClick={() => onNavigate('analise_diretor', { solicitacaoId: req.id })}
                              className="px-3 py-1.5 bg-primary-500 text-white text-[10px] font-black rounded-lg hover:bg-primary-600 transition-all uppercase tracking-widest shadow-lg shadow-primary-500/20 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-sm">fact_check</span>
                              Analisar
                            </button>
                          )}
                          <button
                            onClick={() => handleViewRequest(req)}
                            className="p-2 hover:bg-primary-50 rounded-lg text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                          <button className="p-2 hover:bg-primary-50 rounded-lg text-gray-400 hover:text-primary-600 transition-colors">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete('solicitações', req.id, req.nome_aluno)}
                            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Gerenciamento Master</h2>
          <p className="text-gray-500 mt-1">Controle total sobre as entidades do sistema e permissões globais.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50/30">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab
                ? 'border-primary-500 text-primary-600 bg-white'
                : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-0 min-h-[400px]">
          <div className="p-6 bg-white flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 gap-4">
            <div className="flex flex-1 gap-4">
              <div className="relative max-w-xs w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder={`Filtrar ${activeTab}...`}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              {activeTab === 'solicitações' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 px-4 py-2 font-bold text-gray-600"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="AGUARDANDO_DIRETOR">Aguardando Direção</option>
                  <option value="AGUARDANDO_COORDENADOR">Aguardando Coordenador</option>
                  <option value="DEFERIDO">Deferidos</option>
                  <option value="INDEFERIDO">Indeferidos</option>
                </select>
              )}
            </div>
            <div className="flex gap-2">
              {activeTab === 'cursos' && (
                <button
                  onClick={() => setEditCourseModal({ isOpen: true, course: null })}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg flex items-center gap-2 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  <span className="text-xs uppercase tracking-wider">Adicionar Curso</span>
                </button>
              )}
              {activeTab === 'solicitações' && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">title</span>
                    <input
                      type="text"
                      value={pdfTitle}
                      onChange={(e) => setPdfTitle(e.target.value)}
                      placeholder="Título do PDF..."
                      className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-64"
                    />
                  </div>
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg flex items-center gap-2 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    <span className="text-xs uppercase tracking-wider">Exportar PDF</span>
                  </button>
                </div>
              )}
              <button onClick={fetchData} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                <span className="material-symbols-outlined text-xl">refresh</span>
              </button>
            </div>
          </div>
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
      />

      <DetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ ...detailModal, isOpen: false })}
        title={detailModal.title}
        data={detailModal.data}
      />

      <Modal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
        title={feedbackModal.title}
        message={feedbackModal.message}
        type={feedbackModal.type}
      />

      <EditCourseModal
        isOpen={editCourseModal.isOpen}
        onClose={() => setEditCourseModal({ isOpen: false, course: null })}
        onSave={handleSaveCourse}
        course={editCourseModal.course}
      />
    </div>
  );
};


export default AdminCoringa;
