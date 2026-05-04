import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { useChurch } from '../../context/ChurchContext';
import FixedButton from '../../components/FixedButton';
import ConfirmModal from '../../components/ConfirmModal';
import Loader from '../../components/Loader';

export default function ProjectsList() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        completed: 0,
        totalTarget: 0,
        totalCollected: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ status: '' });

    // Modals State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    const loadProjects = useCallback(async () => {
        if (!currentChurch) return;

        try {
            setLoading(true);
            const { data } = await projectService.getAll(currentChurch.id);
            const statsData = await projectService.getStats(currentChurch.id);
            setProjects(data);
            setStats(statsData);
        } catch (err) {
            setError('Erreur lors du chargement des projets');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentChurch]);

    useEffect(() => {
        if (currentChurch) {
            loadProjects();
        }
    }, [currentChurch, loadProjects]);

    const handleDeleteClick = (e, project) => {
        e.stopPropagation();
        setProjectToDelete(project);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;

        try {
            await projectService.delete(projectToDelete.id);
            setProjects(projects.filter(p => p.id !== projectToDelete.id));
            loadProjects(); // Reload to update stats properly
        } catch (error) {
            console.error("Error deleting project:", error);
            alert("Erreur lors de la suppression");
        } finally {
            setDeleteModalOpen(false);
            setProjectToDelete(null);
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch =
            project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filters.status ? project.status === filters.status : true;

        return matchesSearch && matchesStatus;
    });

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
        <div className="flex justify-center items-center min-h-[80vh]">
            <Loader />
        </div>
    );

    return (
        <div className="space-y-8 font-sans pb-12 max-w-full overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight">Projets</h1>
                    <p className="text-gray-500 mt-2 text-lg font-light">Gestion des projets de l'église</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/projects/new"
                        className="hidden md:flex flex-row items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nouveau Projet
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    {
                        label: 'PROJETS EN COURS',
                        value: stats.active,
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: 'bg-primary/5',
                        filter: { status: 'active' },
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        )
                    },
                    {
                        label: 'OBJECTIF TOTAL',
                        value: formatCurrency(stats.totalTarget),
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: 'bg-blue-50',
                        filter: null,
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        )
                    },
                    {
                        label: 'MONTANT COLLECTÉ',
                        value: formatCurrency(stats.totalCollected),
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: 'bg-emerald-50',
                        filter: null,
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )
                    }
                ].map((stat, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (stat.filter) {
                                setFilters(stat.filter);
                            } else {
                                setFilters({ status: '' });
                            }
                        }}
                        className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 text-left cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                {stat.subValue && <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>}
                            </div>
                            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.iconColor}`}>
                                {stat.icon}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Filters & Search - Floating Bar */}
            <div className="sticky top-4 z-10 bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/20 flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher un projet..."
                        className="block w-full pl-11 pr-4 py-3 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto p-1">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="block w-full md:w-48 pl-3 pr-8 py-2 bg-gray-50 border-none text-gray-600 text-sm rounded-xl focus:ring-2 focus:ring-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="active">En cours</option>
                        <option value="completed">Terminé</option>
                        <option value="cancelled">Annulé</option>
                    </select>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
                {filteredProjects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                                <div className="text-sm text-gray-600 mt-1 flex gap-2">
                                    <span className="font-semibold">{formatCurrency(project.collected_amount || 0)}</span>
                                    {project.target_amount && (
                                        <span className="text-gray-400">/ {formatCurrency(project.target_amount)}</span>
                                    )}
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                project.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    'bg-gray-50 text-gray-600 border border-gray-100'
                                }`}>
                                {getStatusLabel(project.status)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div className={`h-1.5 rounded-full ${project.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${Math.min(100, ((project.collected_amount || 0) / (project.target_amount || 1)) * 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{new Date(project.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Projet</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Progression</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Période</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProjects.map((project) => (
                                <tr
                                    key={project.id}
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{project.name}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-xs">{project.description || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                            project.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                'bg-gray-50 text-gray-600 border border-gray-100'
                                            }`}>
                                            {getStatusLabel(project.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 w-full max-w-[200px]">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-bold text-gray-700">{formatCurrency(project.collected_amount || 0)}</span>
                                                {project.target_amount && (
                                                    <span className="text-gray-400">{formatCurrency(project.target_amount)}</span>
                                                )}
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div className={`h-1.5 rounded-full ${project.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${Math.min(100, ((project.collected_amount || 0) / (project.target_amount || 1)) * 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-col">
                                            <span>Du: {project.start_date ? new Date(project.start_date).toLocaleDateString('fr-FR') : '-'}</span>
                                            <span>Au: {project.end_date ? new Date(project.end_date).toLocaleDateString('fr-FR') : '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/projects/${project.id}/edit`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </Link>
                                            <button
                                                onClick={(e) => handleDeleteClick(e, project)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Aucun projet trouvé</h3>
                    <p className="text-gray-500 mt-2 mb-6">Commencez par créer votre premier projet.</p>
                </div>
            )}

            {/* <FixedButton
                to="/projects/new"
                text="Nouveau projet"
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                }
            /> */}

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Supprimer le projet"
                message={`Êtes-vous sûr de vouloir supprimer le projet "${projectToDelete?.name}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
            />
        </div>
    );
}
