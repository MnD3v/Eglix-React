import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';

export default function SuperAdminDashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [churches, setChurches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [error, setError] = useState(null);

    // Double check email security on client side
    useEffect(() => {
        if (user && user.email !== 'em.djatika@gmail.com') {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        loadAllChurches();
    }, []);

    const loadAllChurches = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('churches')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setChurches(data || []);
        } catch (err) {
            console.error('Error fetching churches:', err);
            setError("Impossible de charger les églises. Avez-vous exécuté le script SQL SuperAdmin ?");
        } finally {
            setLoading(false);
        }
    };

    const [activationMonths, setActivationMonths] = useState({});

    const updateSubscription = async (churchId, newStatus, newPlan) => {
        setUpdating(churchId);
        try {
            const { error } = await supabase
                .from('churches')
                .update({ 
                    subscription_status: newStatus,
                    subscription_plan: newPlan
                })
                .eq('id', churchId);

            if (error) throw error;

            setChurches(prev => prev.map(church => 
                church.id === churchId 
                    ? { ...church, subscription_status: newStatus, subscription_plan: newPlan } 
                    : church
            ));
        } catch (err) {
            console.error('Error updating subscription:', err);
            alert("Erreur lors de la mise à jour de l'abonnement.");
        } finally {
            setUpdating(null);
        }
    };

    const activateSubscription = async (churchId, churchPlan) => {
        const months = parseInt(activationMonths[churchId] || 1);
        setUpdating(churchId);
        try {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + months);
            
            const { error } = await supabase
                .from('churches')
                .update({ 
                    subscription_status: 'active',
                    subscription_plan: churchPlan || 'free',
                    subscription_end_date: endDate.toISOString()
                })
                .eq('id', churchId);

            if (error) throw error;

            setChurches(prev => prev.map(church => 
                church.id === churchId 
                    ? { ...church, subscription_status: 'active', subscription_plan: churchPlan || 'free', subscription_end_date: endDate.toISOString() } 
                    : church
            ));
        } catch (err) {
            console.error('Error activating subscription:', err);
            alert("Erreur lors de l'activation de l'abonnement.");
        } finally {
            setUpdating(null);
        }
    };

    // Calcul des KPIs
    const totalChurches = churches.length;
    const activeSubscriptions = churches.filter(c => c.subscription_status === 'active' || c.subscription_status === 'trial').length;
    const inactiveSubscriptions = churches.filter(c => c.subscription_status === 'inactive' || !c.subscription_status).length;
    const newThisMonth = churches.filter(c => {
        const churchDate = new Date(c.created_at);
        const now = new Date();
        return churchDate.getMonth() === now.getMonth() && churchDate.getFullYear() === now.getFullYear();
    }).length;

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navigation */}
            <header className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/images/eglix-black.png" alt="Eglix Logo" className="h-8 w-auto invert brightness-0" />
                    <span className="text-sm font-semibold bg-primary/20 text-primary-dark px-2.5 py-0.5 rounded-full border border-primary/30">
                        SUPER ADMIN
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-300">{user?.email}</span>
                    <button 
                        onClick={() => signOut()}
                        className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        Déconnexion
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vue d'ensemble</h1>
                        <p className="text-gray-500">Surveillez l'activité et gérez les abonnements de la plateforme.</p>
                    </div>
                    <button 
                        onClick={loadAllChurches}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Rafraîchir
                    </button>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 11V7a2 2 0 114 0v4a2 2 0 11-4 0z"/></svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-500 mb-2 tracking-wide uppercase">Total Églises</span>
                        <span className="text-4xl font-extrabold text-gray-900">{totalChurches}</span>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 text-green-600">
                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-500 mb-2 tracking-wide uppercase">Actifs</span>
                        <span className="text-4xl font-extrabold text-green-600">{activeSubscriptions}</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 text-red-600">
                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-500 mb-2 tracking-wide uppercase">Inactifs / Suspendus</span>
                        <span className="text-4xl font-extrabold text-red-600">{inactiveSubscriptions}</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 text-primary-dark">
                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/></svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-500 mb-2 tracking-wide uppercase">Croissance (Ce mois)</span>
                        <span className="text-4xl font-extrabold text-primary-dark">+{newThisMonth}</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Église</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Création</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Forfait</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions rapides</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {churches.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500">Aucune église trouvée.</td>
                                    </tr>
                                ) : churches.map(church => (
                                    <tr key={church.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                                                    {church.logo_url ? (
                                                        <img src={church.logo_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-500 font-bold">{church.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{church.name}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">ID: {church.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-gray-900">{church.email || '-'}</p>
                                            <p className="text-xs text-gray-500">{church.phone || '-'}</p>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {new Date(church.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="py-4 px-6">
                                            <select 
                                                value={church.subscription_plan || 'free'}
                                                onChange={(e) => updateSubscription(church.id, church.subscription_status, e.target.value)}
                                                disabled={updating === church.id}
                                                className="text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary py-1.5"
                                            >
                                                <option value="free">Gratuit</option>
                                                <option value="starter">Starter</option>
                                                <option value="pro">Pro</option>
                                                <option value="enterprise">Entreprise</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-6">
                                            <select 
                                                value={church.subscription_status || 'inactive'}
                                                onChange={(e) => updateSubscription(church.id, e.target.value, church.subscription_plan)}
                                                disabled={updating === church.id}
                                                className={`text-sm rounded-lg py-1.5 font-medium ${
                                                    church.subscription_status === 'active' 
                                                        ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-500' 
                                                        : church.subscription_status === 'trial'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500'
                                                        : 'bg-red-50 text-red-700 border-red-200 focus:ring-red-500'
                                                }`}
                                            >
                                                <option value="active">Actif</option>
                                                <option value="trial">Essai</option>
                                                <option value="inactive">Inactif</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                {church.subscription_status !== 'active' ? (
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            className="w-16 text-xs p-1.5 border border-gray-200 rounded-lg text-center focus:ring-primary focus:border-primary"
                                                            placeholder="Mois"
                                                            value={activationMonths[church.id] || 1}
                                                            onChange={(e) => setActivationMonths({...activationMonths, [church.id]: e.target.value})}
                                                            disabled={updating === church.id}
                                                        />
                                                        <span className="text-xs text-gray-500 mr-2">mois</span>
                                                        <button 
                                                            onClick={() => activateSubscription(church.id, church.subscription_plan || 'free')}
                                                            disabled={updating === church.id}
                                                            className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                                        >
                                                            {updating === church.id ? '...' : 'Activer'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        {church.subscription_end_date && (
                                                            <span className="text-xs text-green-600 font-medium">
                                                                Jusqu'au {new Date(church.subscription_end_date).toLocaleDateString('fr-FR')}
                                                            </span>
                                                        )}
                                                        <button 
                                                            onClick={() => updateSubscription(church.id, 'inactive', church.subscription_plan || 'free')}
                                                            disabled={updating === church.id}
                                                            className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                                        >
                                                            {updating === church.id ? '...' : 'Suspendre'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
