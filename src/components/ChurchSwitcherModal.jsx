import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChurch } from '../context/ChurchContext';

export default function ChurchSwitcherModal({ isOpen, onClose }) {
    const { userChurches, currentChurch, switchChurch } = useChurch();
    const navigate = useNavigate();

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!isOpen) return null;

    const handleSwitch = (churchId) => {
        switchChurch(churchId);
        onClose();
    };

    const handleCreate = () => {
        onClose();
        navigate('/create-church');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl transform transition-all sm:max-w-md w-full overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-serif font-bold text-gray-900 leading-6">
                            Mes Églises
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-2 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-1">
                        {userChurches.map((church) => (
                            <button
                                key={church.id}
                                onClick={() => handleSwitch(church.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentChurch?.id === church.id
                                    ? 'bg-primary/5 border border-primary/20'
                                    : 'hover:bg-gray-50 border border-transparent'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${currentChurch?.id === church.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {church.logo_url ? (
                                        <img src={church.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <span className="font-bold text-lg">{church.name[0].toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className={`font-medium truncate ${currentChurch?.id === church.id ? 'text-primary' : 'text-gray-900'
                                        }`}>
                                        {church.name}
                                    </p>
                                    {currentChurch?.id === church.id && (
                                        <p className="text-xs text-primary">Actuellement sélectionnée</p>
                                    )}
                                </div>
                                {currentChurch?.id === church.id && (
                                    <div className="text-primary">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handleCreate}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 p-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Créer une nouvelle église
                    </button>
                </div>
            </div>
        </div>
    );
}
