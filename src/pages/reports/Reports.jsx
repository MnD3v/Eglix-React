import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { supabase } from '../../supabaseClient';

function getDateRange(preset) {
    const now = new Date();
    const year = now.getFullYear();
    switch (preset) {
        case 'year':
            return { from: `${year}-01-01`, to: `${year}-12-31` };
        case 'last_year':
            return { from: `${year - 1}-01-01`, to: `${year - 1}-12-31` };
        case '6months': {
            const d = new Date(now);
            d.setMonth(d.getMonth() - 6);
            return { from: d.toISOString().split('T')[0], to: now.toISOString().split('T')[0] };
        }
        case '3months': {
            const d = new Date(now);
            d.setMonth(d.getMonth() - 3);
            return { from: d.toISOString().split('T')[0], to: now.toISOString().split('T')[0] };
        }
        case 'month': {
            return {
                from: new Date(year, now.getMonth(), 1).toISOString().split('T')[0],
                to: new Date(year, now.getMonth() + 1, 0).toISOString().split('T')[0]
            };
        }
        default: return null;
    }
}

export default function Reports() {
    const { currentChurch } = useChurch();
    const year = new Date().getFullYear();
    const [dates, setDates] = useState({
        from: `${year}-01-01`,
        to: `${year}-12-31`
    });
    const [stats, setStats] = useState({ tithes: 0, offerings: 0, donations: 0, expenses: 0 });
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        if (!currentChurch) return;
        setLoading(true);
        try {
            const [tithesRes, offeringsRes, donationsRes, expensesRes] = await Promise.all([
                supabase.from('tithes').select('amount').eq('church_id', currentChurch.id)
                    .gte('paid_at', dates.from).lte('paid_at', dates.to),
                supabase.from('offerings').select('amount').eq('church_id', currentChurch.id)
                    .gte('date', dates.from).lte('date', dates.to),
                supabase.from('donations').select('amount').eq('church_id', currentChurch.id)
                    .eq('donation_type', 'money').gte('received_at', dates.from).lte('received_at', dates.to),
                supabase.from('expenses').select('amount').eq('church_id', currentChurch.id)
                    .gte('paid_at', dates.from).lte('paid_at', dates.to),
            ]);
            const sum = (res) => (res.data || []).reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
            setStats({ tithes: sum(tithesRes), offerings: sum(offeringsRes), donations: sum(donationsRes), expenses: sum(expensesRes) });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, [currentChurch, dates]);

    const applyPreset = (preset) => {
        const range = getDateRange(preset);
        if (range) setDates(range);
    };

    const formatAmount = (v) => new Intl.NumberFormat('fr-FR').format(Math.round(v)) + ' FCFA';
    const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

    const totalIncome = stats.tithes + stats.offerings + stats.donations;
    const balance = totalIncome - stats.expenses;

    const reportTypes = [
        {
            title: 'Rapport Dîmes',
            description: 'Analyse des dîmes collectées',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            color: 'blue',
            amount: stats.tithes,
            link: '/tithes',
        },
        {
            title: 'Rapport Offrandes',
            description: 'Analyse des offrandes reçues',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
            color: 'green',
            amount: stats.offerings,
            link: '/offerings',
        },
        {
            title: 'Rapport Dons',
            description: 'Analyse des dons reçus',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
            color: 'rose',
            amount: stats.donations,
            link: '/donations',
        },
        {
            title: 'Rapport Dépenses',
            description: 'Analyse des dépenses effectuées',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
            color: 'orange',
            amount: stats.expenses,
            link: '/expenses',
        },
    ];

    const colorMap = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    const PRESETS = [
        { label: 'Année en cours', value: 'year' },
        { label: 'Année précédente', value: 'last_year' },
        { label: '6 derniers mois', value: '6months' },
        { label: '3 derniers mois', value: '3months' },
        { label: 'Ce mois', value: 'month' },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rapports Financiers</h1>
                    <p className="text-gray-500 mt-1">
                        Période : {formatDate(dates.from)} — {formatDate(dates.to)}
                    </p>
                </div>
            </div>

            {/* Period filter card */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Période d'analyse</h2>
                <div className="flex flex-wrap gap-3 items-end mb-4">
                    <div className="min-w-[150px]">
                        <label className="block text-xs text-gray-500 mb-1">Du</label>
                        <input
                            type="date"
                            value={dates.from}
                            onChange={e => setDates(d => ({ ...d, from: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <label className="block text-xs text-gray-500 mb-1">Au</label>
                        <input
                            type="date"
                            value={dates.to}
                            onChange={e => setDates(d => ({ ...d, to: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>
                {/* Quick filters */}
                <div className="flex flex-wrap gap-2">
                    {PRESETS.map(p => (
                        <button
                            key={p.value}
                            onClick={() => applyPreset(p.value)}
                            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenus', value: totalIncome, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                    { label: 'Total Dépenses', value: stats.expenses, color: 'text-orange-700 bg-orange-50 border-orange-100' },
                    { label: 'Solde net', value: balance, color: balance >= 0 ? 'text-blue-700 bg-blue-50 border-blue-100' : 'text-red-700 bg-red-50 border-red-100' },
                    { label: 'Membres actifs', value: null, color: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
                ].slice(0, 3).map((kpi, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${kpi.color}`}>
                        <p className="text-xs font-medium opacity-70 mb-1">{kpi.label}</p>
                        <p className="text-lg font-bold leading-tight">{loading ? '...' : formatAmount(kpi.value)}</p>
                    </div>
                ))}
            </div>

            {/* Individual Reports */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50">
                    <h2 className="text-sm font-semibold text-gray-700">Rapports détaillés</h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {reportTypes.map((report) => (
                        <div key={report.title} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors">
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${colorMap[report.color]}`}>
                                {report.icon}
                            </div>
                            {/* Info */}
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{report.title}</p>
                                <p className="text-sm text-gray-500">{report.description}</p>
                            </div>
                            {/* Amount */}
                            <div className="text-right flex-shrink-0">
                                <p className="font-bold text-gray-900 text-sm">{loading ? '...' : formatAmount(report.amount)}</p>
                                <p className="text-xs text-gray-400">cette période</p>
                            </div>
                            {/* Link */}
                            <Link
                                to={report.link}
                                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                            >
                                Voir
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
