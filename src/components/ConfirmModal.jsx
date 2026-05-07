import { useEffect } from 'react';

export default function ConfirmModal({
    isOpen,
    title = 'Confirmer l\'action',
    message = 'Êtes-vous sûr de vouloir effectuer cette action ?',
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    onConfirm,
    onCancel,
    type = 'danger' // 'danger' | 'warning' | 'info'
}) {
    // Prevent background scrolling when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'bg-red-50 text-red-600',
            border: 'border-red-100',
            button: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/20',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        warning: {
            bg: 'bg-amber-50 text-amber-600',
            border: 'border-amber-100',
            button: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500/20',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        info: {
            bg: 'bg-indigo-50 text-indigo-600',
            border: 'border-indigo-100',
            button: 'bg-primary text-black hover:bg-primary-dark focus:ring-primary/20',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    };

    const currentStyle = colors[type] || colors.danger;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div 
                className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn"
                onClick={onCancel}
            />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-md rounded-2xl p-6 border border-gray-100 shadow-2xl overflow-hidden transition-all duration-300 animate-scaleUp z-10">
                <div className="flex gap-4 items-start">
                    {/* Icon Circle */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${currentStyle.bg} border ${currentStyle.border}`}>
                        {currentStyle.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 leading-snug">{title}</h3>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-gray-100"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 ${currentStyle.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
