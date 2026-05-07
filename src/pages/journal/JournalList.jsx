import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { journalService } from '../../services/journalService';
import ConfirmModal from '../../components/ConfirmModal';

export default function JournalList() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', search: '', category: '' });
    const [categories, setCategories] = useState([]);
    const [entryToDelete, setEntryToDelete] = useState(null);

    const fetchEntries = async () => {
        if (!currentChurch) return;
        setLoading(true);
        try {
            const { data } = await journalService.getAll(currentChurch.id, filters);
            setEntries(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentChurch) journalService.getCategories(currentChurch.id).then(setCategories);
    }, [currentChurch]);

    useEffect(() => { fetchEntries(); }, [currentChurch, filters]);

    const handleDelete = async (id) => {
        try {
            await journalService.delete(id);
            fetchEntries();
        } catch (err) {
            console.error(err);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
                    <p className="text-gray-500 mt-1">Registre des événements et activités</p>
                </div>
                <Link
                    to="/journal/new"
                    className="flex items-center gap-2 bg-primary text-black px-4 py-2.5 rounded-xl font-medium hover:bg-primary-dark shadow-sm transition-all self-start sm:self-auto"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouvelle entrée
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Recherche</label>
                        <input
                            type="text"
                            placeholder="Titre, catégorie..."
                            value={filters.search}
                            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    {categories.length > 0 && (
                        <div className="min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Catégorie</label>
                            <select
                                value={filters.category}
                                onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                            >
                                <option value="">Toutes</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="min-w-[150px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Du</label>
                        <input type="date" value={filters.startDate}
                            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Au</label>
                        <input type="date" value={filters.endDate}
                            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    {(filters.startDate || filters.endDate || filters.search || filters.category) && (
                        <button
                            onClick={() => setFilters({ startDate: '', endDate: '', search: '', category: '' })}
                            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucune entrée</h3>
                        <p className="text-gray-500 text-sm mb-4">Commencez à documenter les activités de votre église.</p>
                        <Link to="/journal/new" className="inline-flex items-center gap-2 bg-primary text-black px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-all shadow-sm">
                            Nouvelle entrée
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {entries.map((entry) => (
                            <div key={entry.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors">
                                {/* Date badge */}
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-medium">
                                        {formatDate(entry.occurred_at)}
                                    </span>
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/journal/${entry.id}`)}>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-900 truncate hover:text-primary transition-colors">{entry.title}</p>
                                        {entry.attachments && entry.attachments.length > 0 && (
                                            <span className="flex-shrink-0 text-gray-400" title={`${entry.attachments.length} pièce(s) jointe(s)`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate mt-0.5">
                                        {entry.category && <span className="font-medium text-gray-600">{entry.category} · </span>}
                                        {entry.description || 'Aucune description'}
                                    </p>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => navigate(`/journal/${entry.id}/edit`)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                        title="Modifier"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setEntryToDelete(entry.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Supprimer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={entryToDelete !== null}
                title="Supprimer l'entrée du journal"
                message="Êtes-vous sûr de vouloir supprimer cette entrée de journal ? Cette action est définitive."
                confirmText="Supprimer"
                cancelText="Annuler"
                onConfirm={() => {
                    handleDelete(entryToDelete);
                    setEntryToDelete(null);
                }}
                onCancel={() => setEntryToDelete(null)}
                type="danger"
            />
        </div>
    );
}
