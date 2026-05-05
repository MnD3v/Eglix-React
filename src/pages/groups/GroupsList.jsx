import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import { useChurch } from '../../context/ChurchContext';
import FixedButton from '../../components/FixedButton';
import ConfirmModal from '../../components/ConfirmModal';
import Loader from '../../components/Loader';

export default function GroupsList() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [types, setTypes] = useState([]);
    const [deleteModal, setDeleteModal] = useState({ open: false, group: null });

    const loadData = useCallback(async () => {
        if (!currentChurch) return;
        try {
            setLoading(true);
            const [groupsData, typesData] = await Promise.all([
                groupService.getAll(currentChurch.id),
                groupService.getTypes(currentChurch.id)
            ]);
            setGroups(groupsData);
            setTypes(typesData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentChurch]);

    useEffect(() => {
        if (currentChurch) loadData();
    }, [currentChurch, loadData]);

    const handleDelete = async () => {
        if (!deleteModal.group) return;
        try {
            await groupService.delete(deleteModal.group.id);
            setGroups(groups.filter(g => g.id !== deleteModal.group.id));
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la suppression');
        } finally {
            setDeleteModal({ open: false, group: null });
        }
    };

    const filtered = groups.filter(g => {
        const matchSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType ? g.group_type_id === parseInt(filterType) : true;
        return matchSearch && matchType;
    });

    const getMemberCount = (group) => {
        return group.group_members?.[0]?.count || 0;
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Groupes</h1>
                <p className="text-gray-500 mt-1">{groups.length} groupe{groups.length > 1 ? 's' : ''} au total</p>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total groupes</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{groups.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Types</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{types.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 col-span-2 md:col-span-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total membres (groupes)</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {groups.reduce((acc, g) => acc + getMemberCount(g), 0)}
                    </p>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Rechercher un groupe..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                    <option value="">Tous les types</option>
                    {types.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>

            {/* Liste */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <svg className="mx-auto w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="font-medium">Aucun groupe trouvé</p>
                    <p className="text-sm mt-1">Créez votre premier groupe pour commencer</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(group => (
                        <div
                            key={group.id}
                            onClick={() => navigate(`/groups/${group.id}`)}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                        >
                            {/* Type badge */}
                            {group.group_types && (
                                <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 mb-3">
                                    {group.group_types.name}
                                </span>
                            )}

                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{group.name}</h3>

                            {group.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.description}</p>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                <span className="text-sm text-gray-500">
                                    <span className="font-semibold text-gray-900">{getMemberCount(group)}</span> membre{getMemberCount(group) > 1 ? 's' : ''}
                                </span>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={e => { e.stopPropagation(); navigate(`/groups/${group.id}/edit`); }}
                                        className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={e => { e.stopPropagation(); setDeleteModal({ open: true, group }); }}
                                        className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <FixedButton to="/groups/new" text="Nouveau groupe" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            } />

            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, group: null })}
                onConfirm={handleDelete}
                title="Supprimer le groupe"
                message={`Êtes-vous sûr de vouloir supprimer le groupe "${deleteModal.group?.name}" ? Tous les membres seront retirés du groupe.`}
                confirmText="Supprimer"
            />
        </div>
    );
}
