import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChurch } from '../context/ChurchContext';
import { memberService } from '../services/memberService';
import { titheService } from '../services/titheService';
import Loader from '../components/Loader';

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
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        if (!currentChurch) return;

        try {
            setLoading(true);
            const [memberData, titheData] = await Promise.all([
                memberService.getStats(currentChurch.id),
                titheService.getStats(currentChurch.id)
            ]);
            setStats(memberData);
            setTitheStats(titheData);
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
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 border border-primary/10 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                        Bienvenue sur Eglix
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif flex items-center gap-3">
                        Salut {userName}
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
                    </h1>
                    <p className="text-gray-700 max-w-2xl mb-6">
                        Gérez votre église simplement et efficacement.
                    </p>
                    <Link to="/members/new" className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm hover:shadow-md">
                        Ajouter un membre →
                    </Link>
                </div>

                {/* Decorative element */}
                <div className="absolute right-0 top-0 w-64 h-64 opacity-10">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                        <path fill="currentColor" className="text-primary" d="M100,20 L120,80 L180,80 L130,120 L150,180 L100,140 L50,180 L70,120 L20,80 L80,80 Z" />
                    </svg>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/members/new" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all text-left group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
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
                        <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
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

                <button className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all text-left group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                            <span className="text-green-600">
                                <Icons.Calendar />
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Créer un événement</h3>
                            <p className="text-sm text-gray-500">Planifier une activité</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Membres totaux</h3>
                        <span className="text-gray-400">
                            <Icons.Info />
                        </span>
                    </div>
                    <div className="text-4xl font-bold text-gray-900 min-h-[40px] flex items-center">
                        {loading ? <Loader /> : stats.total}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {loading ? '...' : `${stats.active} actifs`}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Invités récents</h3>
                        <span className="text-gray-400">
                            <Icons.Info />
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-500 mt-2">7 derniers jours</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Événements</h3>
                        <span className="text-gray-400">
                            <Icons.Info />
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-500 mt-2">À venir ce mois-ci</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Dîmes du mois</h3>
                        <span className="text-gray-400">
                            <Icons.Money />
                        </span>
                    </div>
                    <div className="text-4xl font-bold text-gray-900 min-h-[40px] flex items-center">
                        {loading ? <Loader /> : formatCurrency(titheStats.thisMonth)}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Total: {loading ? '...' : formatCurrency(titheStats.totalAmount)}
                    </p>
                </div>
            </div>
        </div>
    );
}
