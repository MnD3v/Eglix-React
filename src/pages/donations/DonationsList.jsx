import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { donationService } from '../../services/donationService';

export default function DonationsList() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', search: '', donation_type: '' });

    const fetchDonations = async () => {
        if (!currentChurch) return;
        setLoading(true);
        try {
            const { data } = await donationService.getAll(currentChurch.id, filters);
            setDonations(data || []);
            const total = await donationService.getTotalAmount(currentChurch.id, filters);
            setTotalAmount(total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDonations(); }, [currentChurch, filters]);

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce don ?')) return;
        try {
            await donationService.delete(id);
            fetchDonations();
        } catch (err) {
            console.error(err);
        }
    };

    const formatAmount = (amount) =>
        new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0)) + ' FCFA';

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getDonorName = (donation) => {
        if (donation.donor_name) return donation.donor_name;
        if (donation.members) return `${donation.members.last_name} ${donation.members.first_name}`;
        return 'Anonyme';
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dons</h1>
                    <p className="text-gray-500 mt-1">Gérez les dons reçus par votre église</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{formatAmount(totalAmount)}</div>
                        <div className="text-xs text-gray-500">Total des dons (argent)</div>
                    </div>
                    <Link
                        to="/donations/new"
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-dark shadow-sm transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">Nouveau don</span>
                        <span className="sm:hidden">Nouveau</span>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Recherche</label>
                        <input
                            type="text"
                            placeholder="Donateur, référence..."
                            value={filters.search}
                            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div className="min-w-[140px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                        <select
                            value={filters.donation_type}
                            onChange={e => setFilters(f => ({ ...f, donation_type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                        >
                            <option value="">Tous les types</option>
                            <option value="money">Argent</option>
                            <option value="physical">Objet physique</option>
                        </select>
                    </div>
                    <div className="min-w-[150px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Du</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Au</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    {(filters.startDate || filters.endDate || filters.search || filters.donation_type) && (
                        <button
                            onClick={() => setFilters({ startDate: '', endDate: '', search: '', donation_type: '' })}
                            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : donations.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun don</h3>
                        <p className="text-gray-500 text-sm mb-4">Commencez par enregistrer votre premier don.</p>
                        <Link to="/donations/new" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-all shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nouveau don
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {donations.map((donation) => (
                            <div key={donation.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors">
                                {/* Date badge */}
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
                                        {formatDate(donation.received_at)}
                                    </span>
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{getDonorName(donation)}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        {donation.donation_type === 'money' ? (
                                            <span className="text-sm font-semibold text-gray-800">{formatAmount(donation.amount)}</span>
                                        ) : (
                                            <span className="text-sm text-gray-500">Objet physique</span>
                                        )}
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            {donation.donation_type === 'money'
                                                ? <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Argent</>
                                                : <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> {donation.physical_item || 'Objet'}</>
                                            }
                                            {donation.payment_method && ` · ${donation.payment_method}`}
                                        </span>
                                        {donation.reference && (
                                            <span className="text-xs text-gray-400">#{donation.reference}</span>
                                        )}
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => navigate(`/donations/${donation.id}/edit`)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                        title="Modifier"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(donation.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
        </div>
    );
}
