import { useState, useEffect } from 'react';
import { useChurch } from '../../context/ChurchContext';
import { memberService } from '../../services/memberService';

export default function Settings() {
    const { currentChurch, refreshChurch } = useChurch();
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        description: ''
    });

    useEffect(() => {
        if (currentChurch) {
            setFormData({
                name: currentChurch.name || '',
                address: currentChurch.address || '',
                phone: currentChurch.phone || '',
                email: currentChurch.email || '',
                website: currentChurch.website || '',
                description: currentChurch.description || ''
            });
        }
    }, [currentChurch]);

    if (!currentChurch) return null;

    // Encode church ID to Base64 to hide the raw UUID
    const encodedChurchId = btoa(currentChurch.id);
    const inviteLink = `${window.location.origin}/join/${encodedChurchId}`;

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await memberService.updateChurch(currentChurch.id, formData);
            await refreshChurch();
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating church:', error);
            alert('Erreur lors de la mise à jour des informations.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold font-serif text-gray-900">Paramètres</h1>
            </div>

            {/* Communication Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold font-serif text-gray-900 px-1">Communication</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-6 group cursor-pointer hover:border-gray-200 transition-all">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Gérez les alertes email et Telegram pour suivre l'activité de votre église.</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-6 group cursor-pointer hover:border-gray-200 transition-all">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Support client</h3>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Configurez vos informations de contact et les options de support.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comptes Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold font-serif text-gray-900 px-1">Comptes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-6 group cursor-pointer hover:border-gray-200 transition-all">
                        <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0 text-yellow-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Mon Profil</h3>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Gérez vos informations personnelles, mot de passe et préférences.</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-6 group cursor-pointer hover:border-gray-200 transition-all">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Équipe & Collaborateurs</h3>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Gérez vos collaborateurs et suivez leur activité sur votre plateforme.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invitation Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold font-serif text-gray-900 px-1">Invitation</h2>
                <div className="bg-white rounded-xl p-8 border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-start gap-6">
                        <div className="hidden sm:flex w-16 h-16 bg-gray-50 rounded-xl items-center justify-center flex-shrink-0">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900">Lien d'invitation public</h2>
                            <p className="text-gray-500 mt-1 mb-6">
                                Partagez ce lien avec vos membres pour qu'ils puissent s'inscrire eux-mêmes à votre église.
                            </p>

                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-600 font-mono text-sm truncate select-all">
                                    {inviteLink}
                                </div>
                                <button
                                    onClick={copyLink}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${copied
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'premium-button-primary !w-auto'
                                        }`}
                                >
                                    {copied ? 'Copié !' : 'Copier'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Church Info */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Informations de l'Église</h2>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-primary hover:text-primary-dark font-medium flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Modifier
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-gray-500 hover:text-gray-700 font-medium"
                                disabled={loading}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-primary text-black px-4 py-2 rounded-xl font-medium hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
                            >
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'église</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        ) : (
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-900 border border-gray-200">
                                {currentChurch.name}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID de l'église (Public)</label>
                        <div className="p-3 bg-gray-50 rounded-xl text-gray-500 font-mono text-sm border border-gray-200 break-all">
                            {encodedChurchId}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        ) : (
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-900 border border-gray-200 min-h-[46px]">
                                {currentChurch.address || <span className="text-gray-400 italic">Non renseigné</span>}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        ) : (
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-900 border border-gray-200 min-h-[46px]">
                                {currentChurch.phone || <span className="text-gray-400 italic">Non renseigné</span>}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        ) : (
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-900 border border-gray-200 min-h-[46px]">
                                {currentChurch.email || <span className="text-gray-400 italic">Non renseigné</span>}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Site Web</label>
                        {isEditing ? (
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        ) : (
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-900 border border-gray-200 min-h-[46px]">
                                {currentChurch.website ? (
                                    <a href={currentChurch.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        {currentChurch.website}
                                    </a>
                                ) : (
                                    <span className="text-gray-400 italic">Non renseigné</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        {isEditing ? (
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        ) : (
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-900 border border-gray-200 min-h-[80px] whitespace-pre-wrap">
                                {currentChurch.description || <span className="text-gray-400 italic">Non renseigné</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
