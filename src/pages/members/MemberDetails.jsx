import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { memberService } from '../../services/memberService';
import { titheService } from '../../services/titheService';
import { useChurch } from '../../context/ChurchContext';

import Loader from '../../components/Loader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const REMARK_TYPES = [
    { value: 'spiritual', label: 'Spirituel', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'social', label: 'Social', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'administrative', label: 'Administratif', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    { value: 'other', label: 'Autre', color: 'bg-amber-100 text-amber-700 border-amber-200' }
];

export default function MemberDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentChurch } = useChurch();

    const [member, setMember] = useState(null);
    const [tithes, setTithes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRemarkForm, setShowRemarkForm] = useState(false);
    const [remarkForm, setRemarkForm] = useState({
        type: 'spiritual',
        content: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const loadData = useCallback(async () => {
        if (!currentChurch) return;
        try {
            setLoading(true);
            const [memberData, tithesData] = await Promise.all([
                memberService.getById(id),
                titheService.getAll(currentChurch.id, { member_id: id })
            ]);
            setMember(memberData);
            setTithes(tithesData.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    }, [id, currentChurch]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddRemark = async (e) => {
        e.preventDefault();
        if (!remarkForm.content.trim()) return;

        setSubmitting(true);
        try {
            const newRemark = {
                id: crypto.randomUUID(),
                type: remarkForm.type,
                content: remarkForm.content,
                created_at: new Date().toISOString()
            };

            const currentRemarks = member.remarks || [];
            await memberService.update(id, {
                remarks: [...currentRemarks, newRemark]
            });

            // Recharger le membre uniquement
            const updatedMember = await memberService.getById(id);
            setMember(updatedMember);

            // Réinitialiser le formulaire
            setRemarkForm({ type: 'spiritual', content: '' });
            setShowRemarkForm(false);
        } catch (error) {
            console.error('Error adding remark:', error);
            alert('Erreur lors de l\'ajout de la remarque');
        } finally {
            setSubmitting(false);
        }
    };

    const getRemarkTypeInfo = (type) => {
        return REMARK_TYPES.find(t => t.value === type) || REMARK_TYPES[3];
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const chartData = useMemo(() => {
        if (!tithes.length) return [];

        const sorted = [...tithes].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstDate = new Date(sorted[0].date);
        const lastDate = new Date(sorted[sorted.length - 1].date);
        const diffDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);

        // If range is less than 60 days, show daily, otherwise monthly
        const isDaily = diffDays <= 60;

        const grouped = sorted.reduce((acc, tithe) => {
            const date = new Date(tithe.date);
            let key;
            if (isDaily) {
                key = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            } else {
                // Sortable key for object, display name for chart
                key = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
            }

            if (!acc[key]) {
                acc[key] = { name: key, amount: 0, sortDate: date };
            }
            acc[key].amount += parseFloat(tithe.amount);
            return acc;
        }, {});

        return Object.values(grouped);
    }, [tithes]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader />
            </div>
        );
    }

    if (!member) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Membre introuvable</p>
                <Link to="/members" className="text-primary hover:underline mt-4 inline-block">
                    Retour à la liste
                </Link>
            </div>
        );
    }

    const remarks = member.remarks || [];
    const totalTithes = tithes.reduce((sum, t) => sum + Number(t.amount), 0);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/members')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {member.first_name} {member.last_name}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Détails du membre</p>
                    </div>
                </div>
                <Link
                    to={`/members/${id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-xl hover:bg-primary-dark transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Member Info & Tithes */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-start gap-6">
                            {member.photo_url ? (
                                <img
                                    src={member.photo_url}
                                    alt={`${member.first_name} ${member.last_name}`}
                                    className="w-24 h-24 rounded-xl object-cover"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-3xl">
                                    {member.first_name[0]}{member.last_name[0]}
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        : member.status === 'pending'
                                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                                        }`}>
                                        {member.status === 'active' ? 'Actif' : member.status === 'pending' ? 'En attente' : 'Inactif'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.gender === 'male'
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-pink-100 text-pink-700 border border-pink-200'
                                        }`}>
                                        {member.gender === 'male' ? 'Homme' : 'Femme'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {member.email && (
                                        <div>
                                            <p className="text-gray-500 font-medium">Email</p>
                                            <p className="text-gray-900">{member.email}</p>
                                        </div>
                                    )}
                                    {member.phone && (
                                        <div>
                                            <p className="text-gray-500 font-medium">Téléphone</p>
                                            <p className="text-gray-900">{member.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Informations Détaillées</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {member.birth_date && (
                                <div>
                                    <p className="text-gray-500 font-medium">Date de naissance</p>
                                    <p className="text-gray-900">{new Date(member.birth_date).toLocaleDateString('fr-FR')}</p>
                                </div>
                            )}
                            {member.marital_status && (
                                <div>
                                    <p className="text-gray-500 font-medium">Statut matrimonial</p>
                                    <p className="text-gray-900 capitalize">{member.marital_status}</p>
                                </div>
                            )}
                            {member.address && (
                                <div className="md:col-span-2">
                                    <p className="text-gray-500 font-medium">Adresse</p>
                                    <p className="text-gray-900">{member.address}</p>
                                </div>
                            )}
                            {member.function && (
                                <div>
                                    <p className="text-gray-500 font-medium">Fonction</p>
                                    <p className="text-gray-900">{member.function}</p>
                                </div>
                            )}
                            {member.joined_at && (
                                <div>
                                    <p className="text-gray-500 font-medium">Date d'adhésion</p>
                                    <p className="text-gray-900">{new Date(member.joined_at).toLocaleDateString('fr-FR')}</p>
                                </div>
                            )}
                            {member.baptized_at && (
                                <div>
                                    <p className="text-gray-500 font-medium">Date de baptême</p>
                                    <p className="text-gray-900">{new Date(member.baptized_at).toLocaleDateString('fr-FR')}</p>
                                </div>
                            )}
                            {member.baptism_responsible && (
                                <div>
                                    <p className="text-gray-500 font-medium">Baptisé par</p>
                                    <p className="text-gray-900">{member.baptism_responsible}</p>
                                </div>
                            )}
                        </div>
                        {member.notes && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-gray-500 font-medium mb-2">Notes</p>
                                <p className="text-gray-900 whitespace-pre-wrap">{member.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Tithes Chart */}
                    {chartData.length > 0 && (
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-80">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Évolution des contributions</h2>
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

                    {/* Tithes History */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Historique des Dîmes</h2>
                                <p className="text-sm text-gray-500 mt-1">Total contribué : <span className="font-bold text-gray-900">{formatCurrency(totalTithes)}</span></p>
                            </div>
                            <Link
                                to="/tithes/new"
                                className="text-sm font-medium text-primary hover:text-primary-dark"
                            >
                                + Nouvelle dîme
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            {tithes.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Date</th>
                                            <th className="px-6 py-3 font-medium">Montant</th>
                                            <th className="px-6 py-3 font-medium">Méthode</th>
                                            <th className="px-6 py-3 font-medium">Description</th>
                                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {tithes.map((tithe) => (
                                            <tr key={tithe.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                    {new Date(tithe.date).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                    {formatCurrency(tithe.amount)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tithe.payment_method === 'cash' ? 'bg-green-100 text-green-800' :
                                                        tithe.payment_method === 'mobile' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {tithe.payment_method === 'cash' ? 'Espèces' :
                                                            tithe.payment_method === 'mobile' ? 'Mobile' :
                                                                tithe.payment_method === 'bank' ? 'Virement' : 'Chèque'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                                    {tithe.description || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <Link
                                                        to={`/tithes/${tithe.id}`}
                                                        className="text-primary hover:text-primary-dark font-medium"
                                                    >
                                                        Voir
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    Aucune dîme enregistrée pour ce membre.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Remarks */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Remarques</h2>
                            <button
                                onClick={() => setShowRemarkForm(!showRemarkForm)}
                                className="text-primary hover:text-primary-dark font-medium text-sm flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Ajouter
                            </button>
                        </div>

                        {/* Add Remark Form */}
                        {showRemarkForm && (
                            <form onSubmit={handleAddRemark} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={remarkForm.type}
                                            onChange={(e) => setRemarkForm({ ...remarkForm, type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        >
                                            {REMARK_TYPES.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Remarque</label>
                                        <textarea
                                            value={remarkForm.content}
                                            onChange={(e) => setRemarkForm({ ...remarkForm, content: e.target.value })}
                                            rows={3}
                                            required
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="Écrivez votre remarque..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2 bg-primary text-black rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                            {submitting ? 'Ajout...' : 'Ajouter'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowRemarkForm(false)}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-sm font-medium"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Remarks List */}
                        <div className="space-y-3">
                            {remarks.length === 0 ? (
                                <p className="text-center text-gray-400 py-8 text-sm">Aucune remarque pour le moment</p>
                            ) : (
                                remarks.slice().reverse().map((remark) => {
                                    const typeInfo = getRemarkTypeInfo(remark.type);
                                    return (
                                        <div key={remark.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-start justify-between mb-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${typeInfo.color}`}>
                                                    {typeInfo.label}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(remark.created_at).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{remark.content}</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
