import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface EditCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (course: any, coordenadorId?: string) => void;
    course?: any; // Se fornecido, modo edição. Se null, modo criação
    coordenadores: UserProfile[];
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ isOpen, onClose, onSave, course, coordenadores }) => {
    const [formData, setFormData] = useState({
        nome_curso: '',
        mensalidade_padrao: '',
        desconto_padrao: '',
        desconto_enem: '0',
        desconto_diploma: '0',
        desconto_transferencia: '0',
        ativo: true,
        coordenador_id: ''
    });

    useEffect(() => {
        if (course) {
            setFormData({
                nome_curso: course.nome_curso || '',
                mensalidade_padrao: course.mensalidade_padrao?.toString() || '',
                desconto_padrao: course.desconto_padrao?.toString() || '',
                desconto_enem: course.desconto_enem?.toString() || '0',
                desconto_diploma: course.desconto_diploma?.toString() || '0',
                desconto_transferencia: course.desconto_transferencia?.toString() || '0',
                ativo: course.ativo ?? true,
                coordenador_id: course.coordenador_id || ''
            });
        } else {
            setFormData({
                nome_curso: '',
                mensalidade_padrao: '',
                desconto_padrao: '0',
                desconto_enem: '0',
                desconto_diploma: '0',
                desconto_transferencia: '0',
                ativo: true,
                coordenador_id: ''
            });
        }
    }, [course, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            mensalidade_padrao: parseFloat(formData.mensalidade_padrao),
            desconto_padrao: parseFloat(formData.desconto_padrao),
            desconto_enem: parseFloat(formData.desconto_enem),
            desconto_diploma: parseFloat(formData.desconto_diploma),
            desconto_transferencia: parseFloat(formData.desconto_transferencia)
        }, formData.coordenador_id);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary-500 text-white flex items-center justify-center">
                                <span className="material-symbols-outlined">{course ? 'edit' : 'add'}</span>
                            </div>
                            <h3 className="text-xl font-black text-gray-900">
                                {course ? 'Editar Curso' : 'Novo Curso'}
                            </h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-gray-400">close</span>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Nome do Curso</label>
                            <input
                                type="text"
                                value={formData.nome_curso}
                                onChange={(e) => setFormData({ ...formData, nome_curso: e.target.value })}
                                placeholder="Ex: Administração"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Mensalidade Padrão (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.mensalidade_padrao}
                                    onChange={(e) => setFormData({ ...formData, mensalidade_padrao: e.target.value })}
                                    placeholder="1000.00"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Coordenador Responsável</label>
                                <select
                                    value={formData.coordenador_id}
                                    onChange={(e) => setFormData({ ...formData, coordenador_id: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-bold text-gray-700 bg-white"
                                >
                                    <option value="">Nenhum coordenador vinculado</option>
                                    {coordenadores.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4 border-t border-gray-50">
                            <div className="col-span-2">
                                <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">Descontos por Ingresso (%)</h4>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Vestibular (Padrão)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.desconto_padrao}
                                    onChange={(e) => setFormData({ ...formData, desconto_padrao: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">ENEM</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.desconto_enem}
                                    onChange={(e) => setFormData({ ...formData, desconto_enem: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Portador de Diploma</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.desconto_diploma}
                                    onChange={(e) => setFormData({ ...formData, desconto_diploma: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Transferência</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.desconto_transferencia}
                                    onChange={(e) => setFormData({ ...formData, desconto_transferencia: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <input
                                type="checkbox"
                                id="ativo"
                                checked={formData.ativo}
                                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                                className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
                            />
                            <label htmlFor="ativo" className="text-sm font-bold text-gray-700 cursor-pointer">
                                Curso Ativo
                            </label>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-white border-2 border-gray-200 text-gray-700 font-black rounded-xl hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs shadow-lg shadow-primary-500/30"
                        >
                            {course ? 'Salvar Alterações' : 'Criar Curso'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCourseModal;
