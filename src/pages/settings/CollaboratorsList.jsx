import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { collaboratorService } from '../../services/collaboratorService';
import ConfirmModal from '../../components/ConfirmModal';
import FixedButton from '../../components/FixedButton';

export default function CollaboratorsList() {
    const { currentChurch, userRole } = useChurch();
    const navigate = useNavigate();
    const [collaborators, setCollaborators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [collabToDelete, setCollabToDelete] = useState(null);

    const loadCollaborators = useCallback(async () => {
        if (!currentChurch) return;
        try {
            setLoading(true);
            const data = await collaboratorService.getCollaborators(currentChurch.id);
            setCollaborators(data);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du chargement des collaborateurs');
        } finally {
            setLoading(false);
        }
    }, [currentChurch]);

    useEffect(() => {
        // Pre-flight check: Only owners and admins
        if (userRole && userRole !== 'owner' && userRole !== 'admin') {
            navigate('/settings');
            return;
        }
        
        loadCollaborators();
    }, [currentChurch, userRole, loadCollaborators, navigate]);

    const handleDeleteClick = (e, collab) => {
        e.stopPropagation();
        setCollabToDelete(collab);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!collabToDelete) return;
        try {
            await collaboratorService.removeCollaborator(collabToDelete.id);
            setCollaborators(prev => prev.filter(c => c.id !== collabToDelete.id));
        } catch (err) {
            console.error(err);
            alert('Impossible de retirer ce collaborateur.');
        } finally {
            setDeleteModalOpen(false);
            setCollabToDelete(null);
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'owner':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'admin':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'owner': return 'Propriétaire';
            case 'admin': return 'Administrateur';
            default: return 'Collaborateur';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="flex space-x-2">
                <div className="w-2 h-2 bg-[#ff2600] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-[#ff2600] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-[#ff2600] rounded-full animate-bounce"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12 max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    to="/settings"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Équipe & Collaborateurs</h1>
                    <p className="text-sm text-gray-500 mt-1">Gérez l'accès de vos membres aux différentes sections et annexes.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Desktop View - Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Collaborateur</th>
                                <th className="px-6 py-4">Rôle</th>
                                <th className="px-6 py-4">Permissions Sections</th>
                                <th className="px-6 py-4">Accès Annexes</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {collaborators.map((collab) => {
                                const profile = collab.profile || {};
                                const perms = collab.permissions || {};
                                const sectionCount = perms.sections ? Object.values(perms.sections).filter(Boolean).length : 0;
                                const isAnnexeGen = perms.annexes?.is_general_manager;
                                const specificAnnexeCount = perms.annexes?.managed_annex_ids?.length || 0;

                                return (
                                    <tr 
                                        key={collab.id} 
                                        onClick={() => navigate(`/settings/collaborators/${collab.id}/edit`)}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-sm">
                                                    {(profile.full_name || profile.email || 'C')[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{profile.full_name || 'En attente de profil'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getBadgeClasses(collab.role)}`}>
                                                {getRoleLabel(collab.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {collab.role === 'owner' || collab.role === 'admin' ? (
                                                <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded">Total</span>
                                            ) : (
                                                <span className="text-xs bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                    {sectionCount} section(s)
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {collab.role === 'owner' || collab.role === 'admin' ? (
                                                <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded">Total</span>
                                            ) : isAnnexeGen ? (
                                                <span className="text-indigo-600 font-medium text-xs bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                    Resp. Général
                                                </span>
                                            ) : specificAnnexeCount > 0 ? (
                                                <span className="text-xs bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                    {specificAnnexeCount} annexe(s)
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Aucun accès</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Link
                                                    to={`/settings/collaborators/${collab.id}/edit`}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </Link>
                                                {collab.role !== 'owner' && (
                                                    <button
                                                        onClick={(e) => handleDeleteClick(e, collab)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {collaborators.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <p className="font-bold text-gray-900">Aucun collaborateur</p>
                        <p className="text-sm text-gray-400 mt-1">Ajoutez un membre de votre équipe pour gérer votre église ensemble.</p>
                    </div>
                )}
            </div>

            {/* Fixed add button */}
            <FixedButton
                to="/settings/collaborators/new"
                text="Ajouter un collaborateur"
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                }
            />

            {/* Confirm Modal for Deletion */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Retirer le collaborateur"
                message={`Êtes-vous sûr de vouloir retirer l'accès à ${collabToDelete?.profile?.full_name || collabToDelete?.profile?.email || 'ce collaborateur'} ? Il perdra tout accès à cette église.`}
                confirmText="Retirer l'accès"
                cancelText="Annuler"
                type="danger"
            />
        </div>
    );
}

// Helper for styling badges dynamically
function getBadgeClasses(role) {
    switch (role) {
        case 'owner':
            return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        case 'admin':
            return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        default:
            return 'bg-gray-50 text-gray-600 border-gray-100';
    }
}
