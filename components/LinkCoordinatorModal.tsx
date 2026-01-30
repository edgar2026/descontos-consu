
import React, { useState } from 'react';
import { Curso, UserProfile } from '../types';

interface LinkCoordinatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (cursoId: string, coordenadorId: string) => void;
    cursos: Curso[];
    coordenadores: UserProfile[];
}

const LinkCoordinatorModal: React.FC<LinkCoordinatorModalProps> = ({ isOpen, onClose, onSave, cursos, coordenadores }) => {
    const [selectedCurso, setSelectedCurso] = useState('');
    const [selectedCoordenador, setSelectedCoordenador] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 leading-tight">Vincular Coordenador</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Definir responsabilidade por curso</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-600 shadow-sm">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Curso</label>
                        <select
                            value={selectedCurso}
                            onChange={(e) => setSelectedCurso(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none"
                        >
                            <option value="">Selecione um curso...</option>
                            {cursos.map(c => (
                                <option key={c.id} value={c.id}>{c.nome_curso}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Coordenador</label>
                        <select
                            value={selectedCoordenador}
                            onChange={(e) => setSelectedCoordenador(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none"
                        >
                            <option value="">Selecione um coordenador...</option>
                            {coordenadores.map(u => (
                                <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-8 bg-gray-50/50 flex gap-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave(selectedCurso, selectedCoordenador)}
                        disabled={!selectedCurso || !selectedCoordenador}
                        className="flex-[2] py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-primary-500/25"
                    >
                        Confirmar Vínculo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkCoordinatorModal;
