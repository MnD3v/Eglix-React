import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { useChurch } from '../../context/ChurchContext';
import ConfirmModal from '../../components/ConfirmModal';
import Loader from '../../components/Loader';

export default function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentChurch } = useChurch();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const loadProject = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await projectService.getById(id);
            if (data) {
                setProject(data);
            } else {
                setError("Projet introuvable");
            }
        } catch (err) {
            console.error("Error loading project:", err);
            setError("Impossible de charger les détails du projet.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadProject();
    }, [loadProject]);

    const handleDelete = async () => {
        try {
            await projectService.delete(id);
            navigate('/projects');
        } catch (error) {
            console.error("Error deleting project:", error);
            alert("Erreur lors de la suppression");
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusLabel = (status) => {
        const labels = {
            active: 'En cours',
            completed: 'Terminé',
            cancelled: 'Annulé'
        };
        return labels[status] || status;
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader />
        </div>
    );

    if (error || !project) return (
        <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Une erreur est survenue</h3>
            <p className="mt-2 text-gray-500">{error || "Projet introuvable"}</p>
            <button
                onClick={() => navigate('/projects')}
                className="mt-6 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
                Retour à la liste
            </button>
        </div>
    );

    const progressPercentage = Math.min(100, Math.round(((project.collected_amount || 0) / (project.target_amount || 1)) * 100));

    return (
        <div className="max-w-3xl mx-auto pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/projects')}
                        className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Retour aux projets
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Détails du projet
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setDeleteModalOpen(true)}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                        Supprimer
                    </button>
                    <Link
                        to={`/projects/${project.id}/edit`}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Modifier
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Main Section */}
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${project.status === 'active' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            project.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                'bg-gray-50 text-gray-600 border border-gray-100'
                            }`}>
                            {getStatusLabel(project.status)}
                        </span>
                    </div>

                    <div className="mt-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Montant collecté</p>
                                <p className="text-3xl font-bold text-gray-900">{formatCurrency(project.collected_amount || 0)}</p>
                            </div>
                            {project.target_amount && (
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Objectif</p>
                                    <p className="text-xl font-bold text-gray-400">{formatCurrency(project.target_amount)}</p>
                                </div>
                            )}
                        </div>

                        {project.target_amount > 0 && (
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1 text-gray-600 font-medium">
                                    <span>Progression</span>
                                    <span>{progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div className={`h-2.5 rounded-full ${project.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Informations</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-400">Date de début</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {project.start_date ? new Date(project.start_date).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Date de fin prévue</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {project.end_date ? new Date(project.end_date).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Description</h3>
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 h-full">
                                <p className="text-base text-gray-600 whitespace-pre-wrap">
                                    {project.description || <span className="text-gray-400 italic">Aucune description</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                    <span>Ajouté le {new Date(project.created_at).toLocaleDateString('fr-FR')}</span>
                    <span>Dernière modification : {new Date(project.updated_at).toLocaleDateString('fr-FR')}</span>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Supprimer le projet"
                message={`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
            />
        </div>
    );
}
