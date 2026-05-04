import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { memberService } from '../../services/memberService';
import { useChurch } from '../../context/ChurchContext';
import FixedButton from '../../components/FixedButton';
import ConfirmModal from '../../components/ConfirmModal';

export default function MembersList() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, male: 0, female: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ status: '', gender: '' });

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

    const loadMembers = useCallback(async () => {
        if (!currentChurch) return;

        try {
            setLoading(true);
            const { data } = await memberService.getAll(currentChurch.id);
            const statsData = await memberService.getStats(currentChurch.id);
            setMembers(data);
            setStats(statsData);
        } catch (err) {
            setError('Erreur lors du chargement des membres');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentChurch]);

    useEffect(() => {
        if (currentChurch) {
            loadMembers();
        }
    }, [currentChurch, loadMembers]);

    const handleDeleteClick = (e, member) => {
        e.stopPropagation();
        setMemberToDelete(member);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!memberToDelete) return;

        try {
            await memberService.delete(memberToDelete.id);
            setMembers(members.filter(m => m.id !== memberToDelete.id));
            // Update stats locally
            const newStats = { ...stats };
            newStats.total = Math.max(0, newStats.total - 1);
            if (memberToDelete.status === 'active') newStats.active = Math.max(0, newStats.active - 1);
            if (memberToDelete.gender === 'male') newStats.male = Math.max(0, newStats.male - 1);
            if (memberToDelete.gender === 'female') newStats.female = Math.max(0, newStats.female - 1);
            setStats(newStats);
        } catch (error) {
            console.error("Error deleting member:", error);
            alert("Erreur lors de la suppression");
        } finally {
            setDeleteModalOpen(false);
            setMemberToDelete(null);
        }
    };

    const filteredMembers = members.filter(member => {
        const matchesSearch =
            member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = filters.status ? member.status === filters.status : true;
        const matchesGender = filters.gender ? member.gender === filters.gender : true;

        return matchesSearch && matchesStatus && matchesGender;
    });

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
        <div className="space-y-8 font-sans pb-12 max-w-full overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col ">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight">Membres</h1>
                    <p className="text-gray-500 mt-2 text-lg font-light">Vue d'ensemble de votre communauté</p>
                </div>
            </div>

            {/* Stats Overview - Clean & Minimal with Filtering */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'TOTAL',
                        value: stats.total,
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: 'bg-primary/5',
                        filter: null, // Show all
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        )
                    },
                    {
                        label: 'ACTIFS',
                        value: stats.active,
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: 'bg-emerald-50',
                        filter: { status: 'active' },
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )
                    },
                    {
                        label: 'EN ATTENTE',
                        value: stats.pending || 0,
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: (stats.pending || 0) > 1 ? 'bg-amber-50' : 'bg-purple-50',
                        filter: { status: 'pending' },
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )
                    },
                    {
                        label: 'HOMMES',
                        value: stats.male,
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: 'bg-blue-50',
                        filter: { gender: 'male' },
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        )
                    },
                    {
                        label: 'FEMMES',
                        value: stats.female,
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: 'bg-pink-50',
                        filter: { gender: 'female' },
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
                                setFilters({ status: '', gender: '' });
                            }
                        }}
                        className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 text-left cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
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
                        placeholder="Rechercher..."
                        className="block w-full pl-11 pr-4 py-3 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto p-1">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="block w-full md:w-40 pl-3 pr-8 py-2 bg-gray-50 border-none text-gray-600 text-sm rounded-xl focus:ring-2 focus:ring-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                        <option value="pending">En attente</option>
                    </select>

                    <select
                        value={filters.gender}
                        onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                        className="block w-full md:w-40 pl-3 pr-8 py-2 bg-gray-50 border-none text-gray-600 text-sm rounded-xl focus:ring-2 focus:ring-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="">Tous les genres</option>
                        <option value="male">Homme</option>
                        <option value="female">Femme</option>
                    </select>
                </div>
            </div>

            {/* Mobile View - Cards (Visible only on small screens) */}
            <div className="md:hidden space-y-3">
                {filteredMembers.map((member) => (
                    <div
                        key={member.id}
                        onClick={() => navigate(`/members/${member.id}`)}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center gap-4"
                    >
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative">
                            {member.photo_url ? (
                                <img className="h-12 w-12 rounded-full object-cover" src={member.photo_url} alt="" />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                                    {member.first_name[0]}{member.last_name[0]}
                                </div>
                            )}
                            {/* Status Dot on Avatar */}
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${member.status === 'active' ? 'bg-emerald-500' :
                                member.status === 'pending' ? 'bg-purple-500' :
                                    'bg-gray-400'
                                }`}></div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-bold text-gray-900 truncate pr-2">
                                    {member.first_name} {member.last_name}
                                </h3>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{member.email || 'Aucun email'}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                                    {member.gender === 'male' ? 'Homme' : 'Femme'}
                                </span>
                            </div>
                        </div>

                        {/* Arrow Icon */}
                        <div className="text-gray-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View - Table (Hidden on small screens) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Membre</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date d'ajout</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMembers.map((member) => (
                                <tr
                                    key={member.id}
                                    onClick={() => navigate(`/members/${member.id}`)}
                                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {member.photo_url ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={member.photo_url} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                                                        {member.first_name[0]}{member.last_name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-gray-900 truncate">{member.first_name} {member.last_name}</div>
                                                <div className="text-xs text-gray-500 truncate">{member.email || 'Aucun email'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{member.phone || '-'}</div>
                                        <div className="text-xs text-gray-500">{member.gender === 'male' ? 'Homme' : 'Femme'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${member.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            member.status === 'pending' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                'bg-gray-50 text-gray-600 border border-gray-100'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500' :
                                                member.status === 'pending' ? 'bg-purple-500' :
                                                    'bg-gray-400'
                                                }`}></span>
                                            {member.status === 'active' ? 'Actif' : member.status === 'pending' ? 'En attente' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                                        {new Date(member.created_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/members/${member.id}/edit`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </Link>
                                            <button
                                                onClick={(e) => handleDeleteClick(e, member)}
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

                {/* Pagination (Visual Only for now) */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {filteredMembers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">C'est un peu vide ici</h3>
                    <p className="text-gray-500 mt-2 mb-6">Commencez par ajouter votre premier membre.</p>
                </div>
            )}

            <FixedButton
                to="/members/new"
                text="Ajouter un membre"
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                }
            />

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Supprimer le membre"
                message={`Êtes-vous sûr de vouloir supprimer ${memberToDelete?.first_name} ${memberToDelete?.last_name} ? Cette action est irréversible.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
            />
        </div>
    );
}
