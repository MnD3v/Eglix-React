import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { journalService } from '../../services/journalService';
import ConfirmModal from '../../components/ConfirmModal';

export default function JournalDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        journalService.getById(id)
            .then(data => { setEntry(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [id]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    const handleDelete = async () => {
        try {
            await journalService.delete(id);
            navigate('/journal');
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error || !entry) return (
        <div className="text-center py-16">
            <p className="text-gray-500">{error || 'Entrée introuvable'}</p>
            <button onClick={() => navigate('/journal')} className="mt-4 text-primary underline text-sm">
                Retour au journal
            </button>
        </div>
    );

    return (
        <div className="max-w-xl mx-auto space-y-6 pb-12">
            {/* Back button */}
            <div>
                <button
                    onClick={() => navigate('/journal')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mb-4 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour au journal
                </button>
            </div>

            {/* Entry card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 px-6 py-6 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            {entry.category && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-700 text-xs font-medium mb-2">
                                    {entry.category}
                                </span>
                            )}
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">{entry.title}</h1>
                            <p className="text-sm text-gray-500 mt-1 capitalize">{formatDate(entry.occurred_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(`/journal/${id}/edit`)}
                                className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-xl transition-all"
                                title="Modifier"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                                title="Supprimer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {entry.description ? (
                        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {entry.description}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-sm">Aucune description</p>
                    )}
                </div>

                {/* Attachment Section */}
                {entry.attachments && entry.attachments.length > 0 && (
                    <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pièces jointes</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {entry.attachments.map((file, idx) => (
                                <a
                                    key={idx}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 shadow-sm hover:shadow transition-all group w-full"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                                        {file.url.toLowerCase().endsWith('.pdf') || file.name?.toLowerCase().endsWith('.pdf') ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{file.name || "Fichier joint"}</p>
                                        <p className="text-xs text-gray-400">Cliquez pour ouvrir le fichier</p>
                                    </div>
                                    <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 00-2 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* Images Grid Preview */}
                        {entry.attachments.some(f => !(f.url.toLowerCase().endsWith('.pdf') || f.name?.toLowerCase().endsWith('.pdf'))) && (
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                {entry.attachments
                                    .filter(f => !(f.url.toLowerCase().endsWith('.pdf') || f.name?.toLowerCase().endsWith('.pdf')))
                                    .map((file, idx) => (
                                        <a 
                                            key={idx} 
                                            href={file.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="rounded-xl border border-gray-100 overflow-hidden bg-white hover:border-gray-200 transition-all shadow-sm max-h-40 flex items-center justify-center p-1.5"
                                        >
                                            <img src={file.url} alt={file.name} className="max-h-36 object-contain rounded-lg" />
                                        </a>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Supprimer l'entrée du journal"
                message="Êtes-vous sûr de vouloir supprimer cette entrée ? Cette action est définitive et irréversible."
                confirmText="Supprimer"
                cancelText="Annuler"
                onConfirm={() => {
                    setIsDeleteModalOpen(false);
                    handleDelete();
                }}
                onCancel={() => setIsDeleteModalOpen(false)}
                type="danger"
            />
        </div>
    );
}
