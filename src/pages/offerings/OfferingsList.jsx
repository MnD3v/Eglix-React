import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { offeringService } from '../../services/offeringService';
import { useChurch } from '../../context/ChurchContext';
import FixedButton from '../../components/FixedButton';
import ConfirmModal from '../../components/ConfirmModal';
import Loader from '../../components/Loader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import OfferingTypesModal from './OfferingTypesModal';

export default function OfferingsList() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const [offerings, setOfferings] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        totalAmount: 0,
        thisMonth: 0,
        lastMonth: 0,
        cash: 0,
        mobile: 0,
        bank: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ payment_method: '', offering_type_id: '' });
    const [offeringTypes, setOfferingTypes] = useState([]);

    // Modals State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [offeringToDelete, setOfferingToDelete] = useState(null);
    const [isTypesModalOpen, setIsTypesModalOpen] = useState(false);

    const loadOfferings = useCallback(async () => {
        if (!currentChurch) return;

        try {
            setLoading(true);
            const { data } = await offeringService.getAll(currentChurch.id);
            const statsData = await offeringService.getStats(currentChurch.id);
            const typesData = await offeringService.getTypes(currentChurch.id);
            setOfferings(data);
            setStats(statsData);
            setOfferingTypes(typesData);
        } catch (err) {
            setError('Erreur lors du chargement des offrandes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentChurch]);

    useEffect(() => {
        if (currentChurch) {
            loadOfferings();
        }
    }, [currentChurch, loadOfferings]);

    const handleDeleteClick = (e, offering) => {
        e.stopPropagation();
        setOfferingToDelete(offering);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!offeringToDelete) return;

        try {
            await offeringService.delete(offeringToDelete.id);
            setOfferings(offerings.filter(o => o.id !== offeringToDelete.id));
            // Update stats locally
            const newStats = { ...stats };
            newStats.total = Math.max(0, newStats.total - 1);
            newStats.totalAmount = Math.max(0, newStats.totalAmount - parseFloat(offeringToDelete.amount || 0));
            setStats(newStats);
        } catch (error) {
            console.error("Error deleting offering:", error);
            alert("Erreur lors de la suppression");
        } finally {
            setDeleteModalOpen(false);
            setOfferingToDelete(null);
        }
    };

    const filteredOfferings = offerings.filter(offering => {
        const matchesSearch =
            offering.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            offering.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (offering.members && `${offering.members.first_name} ${offering.members.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (offering.offering_types && offering.offering_types.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesPaymentMethod = filters.payment_method ? offering.payment_method === filters.payment_method : true;
        const matchesOfferingType = filters.offering_type_id ? offering.offering_type_id === filters.offering_type_id : true;

        const offeringDate = new Date(offering.date);
        const matchesStartDate = filters.startDate ? offeringDate >= new Date(filters.startDate) : true;

        let matchesEndDate = true;
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            matchesEndDate = offeringDate <= end;
        }

        return matchesSearch && matchesPaymentMethod && matchesOfferingType && matchesStartDate && matchesEndDate;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getPaymentMethodLabel = (method) => {
        const labels = {
            cash: 'Espèces',
            mobile: 'Mobile Money',
            bank: 'Virement',
            check: 'Chèque'
        };
        return labels[method] || method;
    };

    const chartData = useMemo(() => {
        if (!filteredOfferings.length) return [];

        const sorted = [...filteredOfferings].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstDate = new Date(sorted[0].date);
        const lastDate = new Date(sorted[sorted.length - 1].date);
        const diffDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);

        // If range is less than 60 days, show daily, otherwise monthly
        const isDaily = diffDays <= 60;

        const grouped = sorted.reduce((acc, offering) => {
            const date = new Date(offering.date);
            let key;
            if (isDaily) {
                key = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            } else {
                key = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
            }

            if (!acc[key]) {
                acc[key] = { name: key, amount: 0, sortDate: date };
            }
            acc[key].amount += parseFloat(offering.amount);
            return acc;
        }, {});

        return Object.values(grouped);
    }, [filteredOfferings]);

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
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight">Offrandes</h1>
                    <p className="text-gray-500 mt-2 text-lg font-light">Gestion des contributions de la communauté</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsTypesModalOpen(true)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        Types d'offrande
                    </button>
                    <Link
                        to="/offerings/new"
                        className="hidden md:flex flex-row items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Ajouter une offrande
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    {
                        label: 'TOTAL',
                        value: stats.total,
                        subValue: formatCurrency(stats.totalAmount),
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: 'bg-primary/5',
                        filter: null,
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        )
                    },
                    {
                        label: 'CE MOIS',
                        value: formatCurrency(stats.thisMonth),
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: 'bg-emerald-50',
                        filter: null,
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        )
                    },
                    {
                        label: 'ESPÈCES',
                        value: formatCurrency(stats.cash),
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: 'bg-blue-50',
                        filter: { payment_method: 'cash' },
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        )
                    },
                    {
                        label: 'MOBILE MONEY',
                        value: formatCurrency(stats.mobile),
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: 'bg-purple-50',
                        filter: { payment_method: 'mobile' },
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        )
                    },
                    {
                        label: 'VIREMENT',
                        value: formatCurrency(stats.bank),
                        color: 'text-gray-800',
                        iconColor: 'text-gray-900',
                        bg: 'bg-amber-50',
                        filter: { payment_method: 'bank' },
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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
                                setFilters({ payment_method: '' });
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

            {/* Chart Section */}
            {chartData.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Évolution des offrandes</h3>
                    <div className="h-full w-full pb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                                    formatter={(value) => [formatCurrency(value), 'Montant']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#0ea5e9"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

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

                <div className="flex flex-wrap gap-2 w-full md:w-auto p-1">
                    <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        className="block w-full md:w-auto pl-3 pr-3 py-2 bg-gray-50 border-none text-gray-600 text-sm rounded-xl focus:ring-2 focus:ring-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                        placeholder="Date début"
                    />
                    <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        className="block w-full md:w-auto pl-3 pr-3 py-2 bg-gray-50 border-none text-gray-600 text-sm rounded-xl focus:ring-2 focus:ring-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                        placeholder="Date fin"
                    />
                    <select
                        value={filters.offering_type_id}
                        onChange={(e) => setFilters(prev => ({ ...prev, offering_type_id: e.target.value }))}
                        className="block w-full md:w-32 pl-3 pr-8 py-2 bg-gray-50 border-none text-gray-600 text-sm rounded-xl focus:ring-2 focus:ring-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="">Tous les types</option>
                        {offeringTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <select
                        value={filters.payment_method}
                        onChange={(e) => setFilters(prev => ({ ...prev, payment_method: e.target.value }))}
                        className="block w-full md:w-48 pl-3 pr-8 py-2 bg-gray-50 border-none text-gray-600 text-sm rounded-xl focus:ring-2 focus:ring-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="">Tous les modes</option>
                        <option value="cash">Espèces</option>
                        <option value="mobile">Mobile Money</option>
                        <option value="bank">Virement</option>
                        <option value="check">Chèque</option>
                    </select>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
                {filteredOfferings.map((offering) => (
                    <div
                        key={offering.id}
                        onClick={() => navigate(`/offerings/${offering.id}`)}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{formatCurrency(offering.amount)}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {offering.members ? `${offering.members.first_name} ${offering.members.last_name}` : 'Anonyme'}
                                </p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${offering.payment_method === 'cash' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                offering.payment_method === 'mobile' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                    offering.payment_method === 'bank' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                        'bg-gray-50 text-gray-600 border border-gray-100'
                                }`}>
                                {getPaymentMethodLabel(offering.payment_method)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{new Date(offering.date).toLocaleDateString('fr-FR')}</span>
                            <div className="flex items-center gap-2 truncate ml-2">
                                {offering.offering_types && (
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{offering.offering_types.name}</span>
                                )}
                                {offering.description && <span>{offering.description}</span>}
                            </div>
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
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Membre</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mode de paiement</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Description</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOfferings.map((offering) => (
                                <tr
                                    key={offering.id}
                                    onClick={() => navigate(`/offerings/${offering.id}`)}
                                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {new Date(offering.date).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {offering.members ? `${offering.members.first_name} ${offering.members.last_name}` : 'Anonyme'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500">
                                            {offering.offering_types ? offering.offering_types.name : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{formatCurrency(offering.amount)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${offering.payment_method === 'cash' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                            offering.payment_method === 'mobile' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                offering.payment_method === 'bank' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                    'bg-gray-50 text-gray-600 border border-gray-100'
                                            }`}>
                                            {getPaymentMethodLabel(offering.payment_method)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                                        <div className="truncate max-w-xs">{offering.description || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/offerings/${offering.id}/edit`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </Link>
                                            <button
                                                onClick={(e) => handleDeleteClick(e, offering)}
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

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {filteredOfferings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Aucune offrande enregistrée</h3>
                    <p className="text-gray-500 mt-2 mb-6">Commencez par ajouter votre première offrande.</p>
                </div>
            )}

            {/* <FixedButton
                to="/offerings/new"
                text="Ajouter une offrande"
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                }
            /> */}

            <OfferingTypesModal
                isOpen={isTypesModalOpen}
                onClose={() => setIsTypesModalOpen(false)}
                churchId={currentChurch?.id}
            />

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Supprimer l'offrande"
                message={`Êtes-vous sûr de vouloir supprimer cette offrande de ${formatCurrency(offeringToDelete?.amount || 0)} ? Cette action est irréversible.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
            />
        </div>
    );
}
