import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const config = {
        danger: {
            icon: 'delete_forever',
            iconColor: 'text-red-500',
            iconBg: 'bg-red-50',
            buttonBg: 'bg-red-500 hover:bg-red-600'
        },
        warning: {
            icon: 'warning',
            iconColor: 'text-amber-500',
            iconBg: 'bg-amber-50',
            buttonBg: 'bg-amber-500 hover:bg-amber-600'
        },
        info: {
            icon: 'info',
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            buttonBg: 'bg-blue-500 hover:bg-blue-600'
        },
    };

    const current = config[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    <div className={`size-16 ${current.iconBg} ${current.iconColor} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                        <span className="material-symbols-outlined text-4xl">{current.icon}</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white border-2 border-gray-200 text-gray-700 font-black rounded-xl hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-3 ${current.buttonBg} text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs shadow-lg`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
