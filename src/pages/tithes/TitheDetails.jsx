import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { titheService } from '../../services/titheService';
import { useChurch } from '../../context/ChurchContext';
import ConfirmModal from '../../components/ConfirmModal';

import Loader from '../../components/Loader';

export default function TitheDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentChurch } = useChurch();

    const [tithe, setTithe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const loadTithe = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await titheService.getById(id);
            if (data) {
                setTithe(data);
            } else {
                setError("Dîme introuvable");
            }
        } catch (err) {
            console.error("Error loading tithe:", err);
            setError("Impossible de charger les détails de la dîme.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadTithe();
    }, [loadTithe]);

    const handleDelete = async () => {
        try {
            await titheService.delete(id);
            navigate('/tithes');
        } catch (error) {
            console.error("Error deleting tithe:", error);
            alert("Erreur lors de la suppression");
        }
    };

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



    // ... (imports existants)

    // ... (début du composant TitheDetails)

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader />
        </div>
    );

    if (error || !tithe) return (
        <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Une erreur est survenue</h3>
            <p className="mt-2 text-gray-500">{error || "Dîme introuvable"}</p>
            <button
                onClick={() => navigate('/tithes')}
                className="mt-6 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
                Retour à la liste
            </button>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/tithes')}
                        className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Retour aux dîmes
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Détails de la transaction
                    </h1>
                    <p className="text-gray-500 mt-1">Ref: #{tithe.id.toString().padStart(6, '0')}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setDeleteModalOpen(true)}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                        Supprimer
                    </button>
                    <Link
                        to={`/tithes/${tithe.id}/edit`}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Modifier
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Main Amount Section */}
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 text-center">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Montant</p>
                    <h2 className="text-4xl font-bold text-gray-900">{formatCurrency(tithe.amount)}</h2>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm">
                        <span className={`w-2 h-2 rounded-full ${tithe.payment_method === 'cash' ? 'bg-blue-500' :
                            tithe.payment_method === 'mobile' ? 'bg-purple-500' :
                                tithe.payment_method === 'bank' ? 'bg-amber-500' :
                                    'bg-gray-500'
                            }`}></span>
                        {getPaymentMethodLabel(tithe.payment_method)}
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Informations</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-400">Date</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {new Date(tithe.date).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Description</p>
                                    <p className="text-base text-gray-900">
                                        {tithe.description || <span className="text-gray-400 italic">Aucune description</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Membre</h3>
                            {tithe.members ? (
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                        {tithe.members.first_name[0]}{tithe.members.last_name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            {tithe.members.first_name} {tithe.members.last_name}
                                        </p>
                                        {tithe.members.email && (
                                            <p className="text-xs text-gray-500">{tithe.members.email}</p>
                                        )}
                                        {tithe.members.phone && (
                                            <p className="text-xs text-gray-500">{tithe.members.phone}</p>
                                        )}
                                        <Link
                                            to={`/members/${tithe.member_id}`}
                                            className="text-xs font-medium text-primary hover:text-primary/80 mt-2 inline-block"
                                        >
                                            Voir le profil
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 italic text-sm">
                                    Don anonyme
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                    <span>Ajouté le {new Date(tithe.created_at).toLocaleDateString('fr-FR')}</span>
                    <span>Dernière modification : {new Date(tithe.updated_at).toLocaleDateString('fr-FR')}</span>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Supprimer la transaction"
                message="Êtes-vous sûr de vouloir supprimer cette dîme ? Cette action est irréversible."
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
            />
        </div>
    );
}
