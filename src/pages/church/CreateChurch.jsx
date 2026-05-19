import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Spinner from '../../components/Spinner';

export default function CreateChurch() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, signOut } = useAuth();
    const { confirm } = useNotification();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignOut = async () => {
        const ok = await confirm({
            title: 'Déconnexion',
            message: 'Voulez-vous vraiment vous déconnecter ? Vos progrès dans ce formulaire seront perdus.',
            confirmText: 'Déconnexion',
            cancelText: 'Rester',
            type: 'warning'
        });
        if (!ok) return;

        try {
            await signOut();
            navigate('/login');
        } catch (err) {
            console.error(err);
            window.location.href = '/login';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Créer l'église
            // Exclude website from insert if it doesn't exist in schema yet
            const { website, ...churchData } = formData;

            // Ajouter 2 mois d'essai gratuit
            const trialEndDate = new Date();
            trialEndDate.setMonth(trialEndDate.getMonth() + 2);

            const { data: church, error: churchError } = await supabase
                .from('churches')
                .insert([{
                    ...churchData,
                    subscription_status: 'trial',
                    subscription_plan: searchParams.get('plan') || 'starter',
                    subscription_end_date: trialEndDate.toISOString()
                }])
                .select()
                .single();

            if (churchError) throw churchError;

            // 2. Associer l'utilisateur comme propriétaire
            const { error: cuError } = await supabase
                .from('church_users')
                .insert([{
                    church_id: church.id,
                    user_id: user.id,
                    role: 'owner',
                    permissions: {
                        members: ['view', 'create', 'edit', 'delete'],
                        guests: ['view', 'create', 'edit', 'delete'],
                        finances: ['view', 'create', 'edit', 'delete']
                    }
                }]);

            if (cuError) throw cuError;

            // 3. Rediriger vers le dashboard
            window.location.href = '/';
        } catch (err) {
            console.error('Error creating church:', err);
            setError(err.message || 'Une erreur est survenue lors de la création de l\'église.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            {/* Top Navigation Action */}
            <div className="absolute top-6 right-6">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                </button>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-primary rounded-xl flex items-center justify-center shadow-lg mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Créez votre église
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Vous n'avez pas encore d'église associée à votre compte. Créez-en une pour commencer.
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-lg rounded-3xl sm:px-10 border border-gray-100">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-xl">
                            <div className="flex">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="ml-3 text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Nom de l'église */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nom de l'église <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm"
                                placeholder="Ex: Église Évangélique de Paris"
                            />
                        </div>

                        {/* Adresse */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Adresse
                            </label>
                            <input
                                type="text"
                                name="address"
                                id="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm"
                                placeholder="123 Rue de l'Église, 75001 Paris"
                            />
                        </div>

                        {/* Téléphone et Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Téléphone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm"
                                    placeholder="01 23 45 67 89"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm"
                                    placeholder="contact@eglise.com"
                                />
                            </div>
                        </div>

                        {/* Site Web */}
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                Site Web
                            </label>
                            <input
                                type="url"
                                name="website"
                                id="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm"
                                placeholder="https://www.eglise.com"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm"
                                placeholder="Décrivez votre église, sa mission, sa vision..."
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-black bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Spinner size="md" className="text-black" />
                            ) : (
                                "Créer mon église"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
