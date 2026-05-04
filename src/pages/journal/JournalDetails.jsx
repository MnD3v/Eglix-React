import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { journalService } from '../../services/journalService';

export default function JournalDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        if (!window.confirm('Supprimer cette entrée ?')) return;
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 px-6 py-6 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            {entry.category && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium mb-2">
                                    {entry.category}
                                </span>
                            )}
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">{entry.title}</h1>
                            <p className="text-sm text-gray-500 mt-1 capitalize">{formatDate(entry.occurred_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(`/journal/${id}/edit`)}
                                className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all"
                                title="Modifier"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
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
            </div>
        </div>
    );
}
