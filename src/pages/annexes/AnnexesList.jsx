import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { annexeService } from '../../services/annexeService';
import Loader from '../../components/Loader';
import ConfirmModal from '../../components/ConfirmModal';

const Icons = {
    Building: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    MapPin: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    User: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    Plus: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    Pencil: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    Trash: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    ChevronRight: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
};

export default function AnnexesList() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();

    const [annexes, setAnnexes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const loadAnnexes = useCallback(async () => {
        if (!currentChurch) return;
        try {
            setLoading(true);
            setError(null);
            const { data } = await annexeService.getAll(currentChurch.id);
            setAnnexes(data || []);
        } catch (err) {
            console.error(err);
            setError('Impossible de charger les annexes.');
        } finally {
            setLoading(false);
        }
    }, [currentChurch]);

    useEffect(() => {
        loadAnnexes();
    }, [loadAnnexes]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await annexeService.delete(deleteTarget.id);
            setAnnexes(prev => prev.filter(a => a.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la suppression.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Annexes</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Antennes et sous-groupes de {currentChurch?.name}
                    </p>
                </div>
                <Link
                    to="/annexes/new"
                    className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm text-sm"
                >
                    <Icons.Plus />
                    Nouvelle annexe
                </Link>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader />
                </div>
            ) : annexes.length === 0 ? (
                /* Empty State */
                <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400"><Icons.Building /></span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune annexe</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                        Votre église n'a pas encore d'annexe. Créez-en une pour gérer ses membres et ses finances séparément.
                    </p>
                    <Link
                        to="/annexes/new"
                        className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                    >
                        <Icons.Plus />
                        Créer une annexe
                    </Link>
                </div>
            ) : (
                /* Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {annexes.map((annexe) => (
                        <AnnexeCard
                            key={annexe.id}
                            annexe={annexe}
                            onEdit={() => navigate(`/annexes/${annexe.id}/edit`)}
                            onDelete={() => setDeleteTarget(annexe)}
                        />
                    ))}
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Supprimer l'annexe"
                message={`Êtes-vous sûr de vouloir supprimer l'annexe "${deleteTarget?.name}" ? Les membres, dîmes, offrandes et dons rattachés seront détachés (non supprimés).`}
                confirmLabel="Supprimer"
                confirmVariant="danger"
            />
        </div>
    );
}

function AnnexeCard({ annexe, onEdit, onDelete }) {
    const navigate = useNavigate();

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-gray-300 transition-all group flex flex-col gap-4">
            {/* Top */}
            <div className="flex items-start justify-between gap-3">
                <div
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    onClick={() => navigate(`/annexes/${annexe.id}`)}
                >
                    <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Icons.Building />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate group-hover:text-black">
                            {annexe.name}
                        </h3>
                        {annexe.pastor_name && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Icons.User />
                                {annexe.pastor_name}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={onEdit}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700"
                        title="Modifier"
                    >
                        <Icons.Pencil />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                        title="Supprimer"
                    >
                        <Icons.Trash />
                    </button>
                </div>
            </div>

            {/* Description */}
            {annexe.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{annexe.description}</p>
            )}

            {/* Address */}
            {annexe.address && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Icons.MapPin />
                    <span className="truncate">{annexe.address}</span>
                </div>
            )}

            {/* Footer: link to detail */}
            <button
                onClick={() => navigate(`/annexes/${annexe.id}`)}
                className="mt-auto flex items-center justify-between w-full pt-4 border-t border-gray-100 text-sm font-medium text-gray-500 hover:text-black transition-colors"
            >
                <span>Voir les détails</span>
                <Icons.ChevronRight />
            </button>
        </div>
    );
}
