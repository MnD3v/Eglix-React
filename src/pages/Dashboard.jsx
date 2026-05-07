import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChurch } from '../context/ChurchContext';
import { memberService } from '../services/memberService';
import { titheService } from '../services/titheService';
import { offeringService } from '../services/offeringService';
import { expenseService } from '../services/expenseService';
import Loader from '../components/Loader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Icons components
const Icons = {
    UserAdd: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    ),
    GroupAdd: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    Calendar: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Info: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Money: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
};

export default function Dashboard() {
    const { user } = useAuth();
    const { currentChurch } = useChurch();
    const [stats, setStats] = useState({ total: 0, active: 0, male: 0, female: 0 });
    const [titheStats, setTitheStats] = useState({ thisMonth: 0, totalAmount: 0 });
    const [offeringStats, setOfferingStats] = useState({ thisMonth: 0, totalAmount: 0 });
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        if (!currentChurch) return;

        try {
            setLoading(true);
            const now = new Date();
            const firstDayThisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

            const [memberData, titheData, offeringData, expensesData, allTithes, allOfferings, allExpenses] = await Promise.all([
                memberService.getStats(currentChurch.id),
                titheService.getStats(currentChurch.id),
                offeringService.getStats(currentChurch.id),
                expenseService.getTotalAmount(currentChurch.id, { startDate: firstDayThisMonth }),
                titheService.getAll(currentChurch.id),
                offeringService.getAll(currentChurch.id),
                expenseService.getAll(currentChurch.id)
            ]);
            setStats(memberData);
            setTitheStats(titheData);
            setOfferingStats(offeringData);
            setMonthlyExpenses(expensesData);

            // Aggregate last 6 months
            const last6Months = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = d.toLocaleDateString('fr-FR', { month: 'short' });
                last6Months.push({
                    name: monthName,
                    monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                    recettes: 0,
                    depenses: 0
                });
            }

            if (allTithes.data) {
                allTithes.data.forEach(t => {
                    const date = new Date(t.date);
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const month = last6Months.find(m => m.monthKey === key);
                    if (month) month.recettes += parseFloat(t.amount || 0);
                });
            }

            if (allOfferings.data) {
                allOfferings.data.forEach(o => {
                    const date = new Date(o.date);
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const month = last6Months.find(m => m.monthKey === key);
                    if (month) month.recettes += parseFloat(o.amount || 0);
                });
            }

            if (allExpenses.data) {
                allExpenses.data.forEach(e => {
                    const date = new Date(e.paid_at || e.created_at);
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const month = last6Months.find(m => m.monthKey === key);
                    if (month) month.depenses += parseFloat(e.amount || 0);
                });
            }

            setChartData(last6Months);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    }, [currentChurch]);

    useEffect(() => {
        if (currentChurch) {
            loadStats();
        }
    }, [currentChurch, loadStats]);

    const userName = user?.email?.split('@')[0] || 'Utilisateur';

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            {/* Welcome Banner */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif">
                        Salut {userName}
                    </h1>
                    <p className="text-gray-500 max-w-2xl mb-6">
                        Gérez votre église simplement et efficacement.
                    </p>
                    <Link to="/members/new" className="inline-block bg-primary hover:bg-primary/90 text-black font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
                        Ajouter un membre →
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/members/new" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all text-left group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <span className="text-blue-600">
                                <Icons.UserAdd />
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Ajouter un membre</h3>
                            <p className="text-sm text-gray-500">Enregistrer un nouveau membre</p>
                        </div>
                    </div>
                </Link>

                <Link to="/tithes/new" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all text-left group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                            <span className="text-emerald-600">
                                <Icons.Money />
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Ajouter une dîme</h3>
                            <p className="text-sm text-gray-500">Enregistrer une contribution</p>
                        </div>
                    </div>
                </Link>

                <Link to="/offerings/new" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all text-left group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <span className="text-purple-600">
                                <Icons.Money />
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Ajouter une offrande</h3>
                            <p className="text-sm text-gray-500">Enregistrer une offrande globale</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold text-gray-900">Membres totaux</h3>
                        <span className="text-gray-300">
                            <Icons.Info />
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 min-h-[40px] flex items-center">
                        {loading ? <Loader /> : stats.total}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold text-gray-900">Dîmes du mois</h3>
                        <span className="text-gray-300">
                            <Icons.Info />
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 min-h-[40px] flex items-center">
                        {loading ? <Loader /> : formatCurrency(titheStats.thisMonth)}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold text-gray-900">Offrandes du mois</h3>
                        <span className="text-gray-300">
                            <Icons.Info />
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 min-h-[40px] flex items-center">
                        {loading ? <Loader /> : formatCurrency(offeringStats.thisMonth)}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold text-gray-900">Dépenses du mois</h3>
                        <span className="text-gray-300">
                            <Icons.Info />
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 min-h-[40px] flex items-center">
                        {loading ? <Loader /> : formatCurrency(monthlyExpenses)}
                    </div>
                </div>
            </div>

            {/* Financial Chart Comparison */}
            {!loading && chartData.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Aperçu Financier</h3>
                            <p className="text-xs text-gray-500">Comparaison des recettes (dîmes + offrandes) et des dépenses sur les 6 derniers mois</p>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-gray-600">
                                <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block" />
                                Recettes
                            </div>
                            <div className="flex items-center gap-1.5 font-medium text-gray-600">
                                <span className="w-3 h-3 bg-rose-500 rounded-full inline-block" />
                                Dépenses
                            </div>
                        </div>
                    </div>
                    <div className="h-[80%] w-full pb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRecettes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
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
                                    formatter={(value, name) => [formatCurrency(value), name === 'recettes' ? 'Recettes' : 'Dépenses']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="recettes"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRecettes)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="depenses"
                                    stroke="#f43f5e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorDepenses)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
