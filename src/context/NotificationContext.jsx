import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    // Toast State
    const [toasts, setToasts] = useState([]);
    
    // Confirm Dialog State
    const [confirmState, setConfirmState] = useState(null); // { title, message, resolve, confirmText, cancelText }

    // ─── TOAST LOGIC ───────────────────────────────────────────────
    
    const showToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Date.now() + Math.random();
        
        setToasts(prev => [...prev, { id, message, type }]);
        
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);
    }, []);

    // Helper methods
    const toast = {
        success: (msg) => showToast(msg, 'success'),
        error: (msg) => showToast(msg, 'error'),
        info: (msg) => showToast(msg, 'info'),
        warning: (msg) => showToast(msg, 'warning'),
    };

    // ─── CONFIRM DIALOG LOGIC ──────────────────────────────────────
    
    const confirm = useCallback(({ 
        title = 'Confirmation', 
        message = 'Êtes-vous sûr de vouloir continuer ?', 
        confirmText = 'Confirmer', 
        cancelText = 'Annuler',
        type = 'danger' // 'danger' | 'warning' | 'info'
    }) => {
        return new Promise((resolve) => {
            setConfirmState({
                title,
                message,
                confirmText,
                cancelText,
                type,
                resolve: (result) => {
                    setConfirmState(null);
                    resolve(result);
                }
            });
        });
    }, []);

    // ─── GLOBAL WINDOW OVERRIDE ───────────────────────────────────
    
    React.useEffect(() => {
        // Capture original
        const nativeAlert = window.alert;
        
        // Override with toast
        window.alert = (msg) => {
            const messageStr = String(msg);
            if (messageStr.toLowerCase().includes('erreur') || messageStr.toLowerCase().includes('impossible') || messageStr.toLowerCase().includes('failed')) {
                toast.error(messageStr);
            } else {
                toast.info(messageStr);
            }
        };

        return () => {
            window.alert = nativeAlert;
        };
    }, [toast]);

    return (
        <NotificationContext.Provider value={{ toast, confirm }}>
            {children}

            {/* ─── TOAST RENDERING CONTAINER ────────────────────────── */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-md pointer-events-none">
                {toasts.map((item) => (
                    <div
                        key={item.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-lg border animate-slideInRight max-w-sm ml-auto mr-6 md:mr-0 ${
                            item.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                            item.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
                            item.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                            'bg-gray-900 border-gray-800 text-white shadow-black/20'
                        }`}
                    >
                        {/* Dynamic Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                            {item.type === 'success' && (
                                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                            {item.type === 'error' && (
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                            {item.type === 'warning' && (
                                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                            {item.type === 'info' && (
                                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        
                        {/* Message */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-5 break-words">
                                {item.message}
                            </p>
                        </div>

                        {/* Close Button */}
                        <button 
                            onClick={() => setToasts(prev => prev.filter(t => t.id !== item.id))}
                            className="flex-shrink-0 ml-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg focus:outline-none"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* ─── CONFIRM DIALOG MODAL ───────────────────────────────── */}
            {confirmState && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-fadeIn">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scaleIn border border-gray-100 font-sans">
                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-serif font-bold text-gray-900">{confirmState.title}</h3>
                                <div className={`p-2 rounded-full ${
                                    confirmState.type === 'danger' ? 'bg-red-50 text-red-600' :
                                    confirmState.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                    {confirmState.type === 'danger' && (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    )}
                                    {confirmState.type !== 'danger' && (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8">
                                {confirmState.message}
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => confirmState.resolve(false)}
                                    className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                                >
                                    {confirmState.cancelText}
                                </button>
                                <button
                                    onClick={() => confirmState.resolve(true)}
                                    className={`px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5 ${
                                        confirmState.type === 'danger' ? 'bg-[#ff2600] hover:bg-red-700 shadow-red-200' :
                                        confirmState.type === 'warning' ? 'bg-primary hover:bg-primary-dark shadow-primary/20 !text-black' :
                                        'bg-primary hover:bg-primary-dark shadow-primary/20 !text-black'
                                    }`}
                                >
                                    {confirmState.confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Inject local styles if not defined */}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-slideInRight {
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
