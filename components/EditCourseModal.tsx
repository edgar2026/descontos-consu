import React, { useState, useEffect } from 'react';

interface EditCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (course: any) => void;
    course?: any; // Se fornecido, modo edição. Se null, modo criação
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ isOpen, onClose, onSave, course }) => {
    const [formData, setFormData] = useState({
        nome_curso: '',
        mensalidade_padrao: '',
        desconto_padrao: '',
        ativo: true
    });

    useEffect(() => {
        if (course) {
            setFormData({
                nome_curso: course.nome_curso || '',
                mensalidade_padrao: course.mensalidade_padrao?.toString() || '',
                desconto_padrao: course.desconto_padrao?.toString() || '',
                ativo: course.ativo ?? true
            });
        } else {
            setFormData({
                nome_curso: '',
                mensalidade_padrao: '',
                desconto_padrao: '',
                ativo: true
            });
        }
    }, [course, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            mensalidade_padrao: parseFloat(formData.mensalidade_padrao),
            desconto_padrao: parseFloat(formData.desconto_padrao)
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-100">
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

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
                            <label className="text-xs font-bold text-gray-500 uppercase">Desconto Padrão (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.desconto_padrao}
                                onChange={(e) => setFormData({ ...formData, desconto_padrao: e.target.value })}
                                placeholder="10"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 -mx-8 -mb-8 mt-8">
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
