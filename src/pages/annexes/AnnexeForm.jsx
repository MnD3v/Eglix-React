import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { annexeService } from '../../services/annexeService';
import Loader from '../../components/Loader';

export default function AnnexeForm() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [form, setForm] = useState({
        name: '',
        address: '',
        description: '',
        pastor_name: '',
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditing);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState(null);

    // Load existing annexe for editing
    useEffect(() => {
        if (!isEditing) return;
        (async () => {
            try {
                setLoadingData(true);
                const data = await annexeService.getById(id);
                setForm({
                    name: data.name || '',
                    address: data.address || '',
                    description: data.description || '',
                    pastor_name: data.pastor_name || '',
                });
            } catch (err) {
                console.error(err);
                setSubmitError('Impossible de charger les données de l\'annexe.');
            } finally {
                setLoadingData(false);
            }
        })();
    }, [id, isEditing]);

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Le nom est obligatoire.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            setSubmitError(null);

            const payload = {
                ...form,
                church_id: currentChurch.id,
            };

            if (isEditing) {
                await annexeService.update(id, payload);
            } else {
                await annexeService.create(payload);
            }

            navigate('/annexes');
        } catch (err) {
            console.error(err);
            setSubmitError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex justify-center py-16">
                <Loader />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate('/annexes')}
                    className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-4 transition-colors"
                >
                    ← Retour aux annexes
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditing ? 'Modifier l\'annexe' : 'Nouvelle annexe'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {isEditing
                        ? 'Mettez à jour les informations de cette annexe.'
                        : `Créer une nouvelle annexe pour ${currentChurch?.name}.`}
                </p>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {submitError}
                    </div>
                )}

                {/* Nom */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="annexe-name">
                        Nom de l'annexe <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="annexe-name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Ex: Annexe de Douala-Bonamoussadi"
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-all ${
                            errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                        }`}
                    />
                    {errors.name && (
                        <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                </div>

                {/* Pasteur responsable */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="annexe-pastor">
                        Pasteur / Responsable
                    </label>
                    <input
                        id="annexe-pastor"
                        type="text"
                        name="pastor_name"
                        value={form.pastor_name}
                        onChange={handleChange}
                        placeholder="Nom du responsable de l'annexe"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                    />
                </div>

                {/* Adresse */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="annexe-address">
                        Adresse
                    </label>
                    <input
                        id="annexe-address"
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Quartier, ville..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="annexe-description">
                        Description
                    </label>
                    <textarea
                        id="annexe-description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Informations complémentaires sur cette annexe..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => navigate('/annexes')}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader />}
                        {isEditing ? 'Enregistrer' : 'Créer l\'annexe'}
                    </button>
                </div>
            </form>
        </div>
    );
}
