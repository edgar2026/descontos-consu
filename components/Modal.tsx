
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message, type = 'success' }) => {
    if (!isOpen) return null;

    const icons = {
        success: { name: 'check_circle', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        error: { name: 'error', color: 'text-rose-500', bg: 'bg-rose-50' },
        info: { name: 'info', color: 'text-blue-500', bg: 'bg-blue-50' },
    };

    const currentIcon = icons[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    <div className={`size-16 ${currentIcon.bg} ${currentIcon.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                        <span className="material-symbols-outlined text-4xl">{currentIcon.name}</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-gray-800 transition-all uppercase tracking-widest text-xs"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
