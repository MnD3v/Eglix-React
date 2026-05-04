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
            <div>
                <h1 className="text-2xl font-bold font-serif text-gray-900">Paramètres</h1>
                <p className="text-gray-500 mt-1">Gérez les paramètres de votre église.</p>
            </div>

            {/* Invitation Section */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-6">
                    <div className="hidden sm:flex w-16 h-16 bg-primary/5 rounded-2xl items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-900">Lien d'invitation public</h2>
                        <p className="text-gray-500 mt-1 mb-6">
                            Partagez ce lien avec vos membres pour qu'ils puissent s'inscrire eux-mêmes à votre église.
                            Les nouveaux inscrits apparaîtront automatiquement dans votre liste de membres.
                        </p>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 font-mono text-sm truncate select-all">
                                {inviteLink}
                            </div>
                            <button
                                onClick={copyLink}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${copied
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md'
                                    }`}
                            >
                                {copied ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                )}
                                {copied ? 'Copié !' : 'Copier'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Church Info */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
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
                                className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
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
