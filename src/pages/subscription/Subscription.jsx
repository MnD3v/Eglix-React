import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { useAuth } from '../../context/AuthContext';

export default function Subscription() {
    const { currentChurch } = useChurch();
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const plans = [
        {
            name: "Starter",
            price: "6 000 FCFA",
            period: "/mois",
            description: "Idéal pour les petites églises qui démarrent.",
            features: [
                "Jusqu'à 100 membres",
                "Gestion des dons basique",
                "Support par email",
                "1 compte administrateur"
            ],
            buttonText: "Sélectionner",
            popular: false
        },
        {
            name: "Pro",
            price: "12 000 FCFA",
            period: "/mois",
            description: "Pour les églises en croissance avec des besoins avancés.",
            features: [
                "Membres illimités",
                "Gestion financière complète",
                "Support prioritaire 24/7",
                "Comptes administrateurs illimités",
                "Statistiques avancées"
            ],
            buttonText: "Obtenir 2 mois d'essai gratuit",
            popular: true
        }
    ];

    const handleAction = (plan) => {
        if (!currentChurch) {
            navigate(`/create-church?plan=${plan.name.toLowerCase()}`);
        } else {
            // Logique pour mettre à niveau l'abonnement existant (par ex: Stripe)
            alert(`Vous avez sélectionné le forfait ${plan.name}. La fonctionnalité de paiement sera bientôt disponible.`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Navbar simplifiée */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/images/eglix-black.png" alt="Eglix Logo" className="h-10 w-auto" />
                </div>
                <button 
                    onClick={() => signOut()} 
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                    Se déconnecter
                </button>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    {currentChurch?.subscription_status === 'inactive' ? (
                        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-700 text-sm font-medium border border-red-100">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Votre abonnement est inactif ou arrivé à expiration.
                        </div>
                    ) : (
                        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary-dark text-sm font-medium border border-primary/20">
                            Découvrez nos offres
                        </div>
                    )}
                    
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
                        Choisissez le forfait adapté à votre église
                    </h1>
                    <p className="text-xl text-gray-500">
                        Passez à la vitesse supérieure dans la gestion de votre communauté avec Eglix.
                        Sans engagement, annulez à tout moment.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch">
                    {plans.map((plan) => (
                        <div 
                            key={plan.name}
                            className={`relative flex flex-col bg-white rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-xl border ${
                                plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-6 -translate-y-1/2">
                                    <span className="bg-primary text-black text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-full shadow-sm">
                                        Le plus choisi
                                    </span>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-sm text-gray-500 h-10">{plan.description}</p>
                            </div>

                            <div className="mb-8 flex items-baseline gap-1">
                                <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                                <span className="text-lg font-medium text-gray-500">{plan.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-600 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => handleAction(plan)}
                                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all ${
                                plan.popular 
                                    ? 'bg-primary hover:bg-primary-dark text-black shadow-md hover:shadow-lg' 
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
                            }`}>
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
