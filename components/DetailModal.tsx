import React from 'react';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: { label: string; value: string | React.ReactNode }[];
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, title, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="p-8 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary-500 text-white flex items-center justify-center">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <h3 className="text-xl font-black text-gray-900">{title}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-gray-400">close</span>
                        </button>
                    </div>
                </div>
                <div className="p-8 space-y-4">
                    {data.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-50 last:border-0">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                            <div className="col-span-2 text-sm font-bold text-gray-900">{item.value}</div>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-gray-800 transition-all uppercase tracking-widest text-xs"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailModal;
