import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { administrationService } from '../../services/administrationService';

export default function AdministrationList() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchMembers = async () => {
        if (!currentChurch) return;
        setLoading(true);
        try {
            const { data } = await administrationService.getAll(currentChurch.id, { search });
            setMembers(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMembers(); }, [currentChurch, search]);

    const handleDelete = async (id) => {
        if (!window.confirm('Retirer ce membre du bureau ?')) return;
        try {
            await administrationService.delete(id);
            fetchMembers();
        } catch (err) {
            console.error(err);
        }
    };

    const getInitials = (m) => {
        if (!m?.members) return '?';
        return `${m.members.first_name?.[0] || ''}${m.members.last_name?.[0] || ''}`.toUpperCase();
    };

    const getMemberName = (m) => {
        if (!m?.members) return 'Membre inconnu';
        return `${m.members.first_name} ${m.members.last_name}`;
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
                    <p className="text-gray-500 mt-1">Membres du bureau et du conseil</p>
                </div>
                <Link
                    to="/administration/new"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-dark shadow-sm transition-all self-start sm:self-auto"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter un membre
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <input
                    type="text"
                    placeholder="Rechercher par titre de fonction..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : members.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-6">
                    <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun membre du bureau</h3>
                    <p className="text-gray-500 text-sm mb-4">Ajoutez les membres qui composent votre bureau.</p>
                    <Link to="/administration/new" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-all shadow-sm">
                        Ajouter un membre
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((admin) => (
                        <div key={admin.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
                                    {admin.members?.photo_url ? (
                                        <img src={admin.members.photo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        getInitials(admin)
                                    )}
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">{getMemberName(admin)}</p>
                                    <p className="text-primary font-semibold text-xs mt-0.5">{admin.function_title}</p>
                                    {admin.start_date && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Depuis {new Date(admin.start_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                        </p>
                                    )}
                                    {admin.members?.phone && (
                                        <p className="text-xs text-gray-500 mt-0.5">{admin.members.phone}</p>
                                    )}
                                </div>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => navigate(`/administration/${admin.id}/edit`)}
                                    className="flex-1 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={() => handleDelete(admin.id)}
                                    className="flex-1 py-1.5 text-xs font-medium text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-all"
                                >
                                    Retirer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
