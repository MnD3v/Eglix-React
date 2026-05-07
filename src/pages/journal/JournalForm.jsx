import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { journalService } from '../../services/journalService';

export default function JournalForm() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState(null);
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        occurred_at: new Date().toISOString().split('T')[0],
        church_id: '',
        attachments: [],
    });

    useEffect(() => {
        if (!currentChurch) return;
        setFormData(f => ({ ...f, church_id: currentChurch.id }));
        if (isEdit) {
            journalService.getById(id).then(data => {
                const cat = data.category || '';
                const isCustom = cat !== '' && !['Culte', 'Réunion', 'Événement', 'Outreach', 'Formation', 'Finance', 'Administration'].includes(cat);
                setFormData({
                    title: data.title || '',
                    category: cat,
                    description: data.description || '',
                    occurred_at: data.occurred_at ? data.occurred_at.split('T')[0] : '',
                    church_id: currentChurch.id,
                    attachments: Array.isArray(data.attachments) ? data.attachments : [],
                });
                if (isCustom) {
                    setIsOtherSelected(true);
                }
                setFetchLoading(false);
            }).catch(err => {
                setError(err.message);
                setFetchLoading(false);
            });
        }
    }, [currentChurch, id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
    };

    const handleCategoryClick = (cat) => {
        if (cat === 'Autre') {
            setIsOtherSelected(true);
            setFormData(f => ({ ...f, category: '' }));
        } else {
            setIsOtherSelected(false);
            setFormData(f => ({ ...f, category: cat }));
        }
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const currentCount = formData.attachments?.length || 0;
        if (currentCount + files.length > 4) {
            setError("Vous ne pouvez pas ajouter plus de 4 pièces jointes.");
            return;
        }

        setUploadingFile(true);
        setError(null);
        try {
            const uploaded = [];
            for (const file of files) {
                const result = await journalService.uploadAttachment(currentChurch.id, file);
                uploaded.push({
                    url: result.url,
                    name: result.name
                });
            }
            setFormData(f => ({
                ...f,
                attachments: [...(f.attachments || []), ...uploaded]
            }));
        } catch (err) {
            setError(err.message || "Erreur lors du chargement des fichiers.");
        } finally {
            setUploadingFile(false);
        }
    };

    const handleRemoveAttachment = (indexToRemove) => {
        setFormData(f => ({
            ...f,
            attachments: f.attachments.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isEdit) {
                await journalService.update(id, formData);
            } else {
                await journalService.create(formData);
            }
            navigate('/journal');
        } catch (err) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const CATEGORIES = [
        'Culte', 'Réunion', 'Événement', 'Outreach', 'Formation', 'Finance', 'Administration', 'Autre'
    ];

    return (
        <div className="max-w-xl mx-auto space-y-6 pb-12">
            <div>
                <button
                    onClick={() => navigate('/journal')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mb-4 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour au journal
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Modifier l\'entrée' : 'Nouvelle entrée'}
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
                {/* Titre */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Titre de l'entrée..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                </div>

                {/* Catégorie */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {['Culte', 'Réunion', 'Événement', 'Outreach', 'Formation', 'Finance', 'Administration'].map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategoryClick(cat)}
                                className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${formData.category === cat && !isOtherSelected
                                        ? 'bg-primary text-black border-primary'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleCategoryClick('Autre')}
                            className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${isOtherSelected
                                    ? 'bg-primary text-black border-primary'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Autre
                        </button>
                    </div>
                    {isOtherSelected && (
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            placeholder="Saisissez une catégorie personnalisée..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all animate-fadeIn"
                        />
                    )}
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="occurred_at"
                        value={formData.occurred_at}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Décrivez l'événement, les décisions prises, les points importants..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                    />
                </div>

                {/* Pièces Jointes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pièces jointes (Image ou PDF, max. 4)
                    </label>
                    <div className="mt-1 space-y-3">
                        <div className="flex items-center gap-4">
                            {(formData.attachments || []).length < 4 && (
                                <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    <span>{uploadingFile ? "Téléchargement..." : "Ajouter des fichiers"}</span>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        multiple
                                        onChange={handleFileChange}
                                        disabled={uploadingFile}
                                        className="hidden"
                                    />
                                </label>
                            )}
                            <span className="text-xs text-gray-400 font-medium">
                                {(formData.attachments || []).length} / 4 fichier(s)
                            </span>
                        </div>

                        {formData.attachments && formData.attachments.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {formData.attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-sm">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {file.url.toLowerCase().endsWith('.pdf') || file.name?.toLowerCase().endsWith('.pdf') ? (
                                                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                            <span className="text-xs text-gray-600 truncate font-semibold">{file.name || "Fichier joint"}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAttachment(index)}
                                            className="text-red-500 hover:text-red-700 text-xs font-bold p-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/journal')}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-primary text-black rounded-xl text-sm font-medium hover:bg-primary-dark shadow-sm transition-all disabled:opacity-50"
                    >
                        {loading ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Enregistrer')}
                    </button>
                </div>
            </form>
        </div>
    );
}
