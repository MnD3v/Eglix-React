import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { administrationService } from '../../services/administrationService';

export default function AdministrationForm() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState(null);
    const [churchMembers, setChurchMembers] = useState([]);
    const [formData, setFormData] = useState({
        member_id: '',
        function_title: '',
        start_date: '',
        end_date: '',
        is_active: true,
        notes: '',
        church_id: '',
    });

    const FUNCTIONS = [
        'Pasteur', 'Président', 'Vice-Président', 'Secrétaire', 'Trésorier',
        'Diacre', 'Ancien', 'Responsable Jeunesse', 'Responsable Femmes',
        'Responsable Musique', 'Responsable Évangélisation', 'Autre'
    ];

    useEffect(() => {
        if (!currentChurch) return;
        setFormData(f => ({ ...f, church_id: currentChurch.id }));
        administrationService.getMembers(currentChurch.id).then(setChurchMembers).catch(console.error);
        if (isEdit) {
            administrationService.getById(id).then(data => {
                setFormData({
                    member_id: data.member_id || '',
                    function_title: data.function_title || '',
                    start_date: data.start_date ? data.start_date.split('T')[0] : '',
                    end_date: data.end_date ? data.end_date.split('T')[0] : '',
                    is_active: data.is_active !== false,
                    notes: data.notes || '',
                    church_id: currentChurch.id,
                });
                setFetchLoading(false);
            }).catch(err => {
                setError(err.message);
                setFetchLoading(false);
            });
        }
    }, [currentChurch, id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isEdit) {
                await administrationService.update(id, formData);
            } else {
                await administrationService.create(formData);
            }
            navigate('/administration');
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

    return (
        <div className="max-w-xl mx-auto space-y-6 pb-12">
            <div>
                <button
                    onClick={() => navigate('/administration')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mb-4 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour au bureau
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Modifier le membre du bureau' : 'Ajouter un membre au bureau'}
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
                {/* Membre */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Membre <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="member_id"
                        value={formData.member_id}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                    >
                        <option value="">— Choisir un membre —</option>
                        {churchMembers.map(m => (
                            <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                        ))}
                    </select>
                </div>

                {/* Titre de fonction */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre / Fonction <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {FUNCTIONS.map(fn => (
                            <button
                                key={fn}
                                type="button"
                                onClick={() => setFormData(f => ({ ...f, function_title: f.function_title === fn ? '' : fn }))}
                                className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${formData.function_title === fn
                                        ? 'bg-primary text-black border-primary'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {fn}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        name="function_title"
                        value={formData.function_title}
                        onChange={handleChange}
                        required
                        placeholder="Ou saisir un titre personnalisé..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        />
                    </div>
                </div>

                {/* Statut actif */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                        Membre actif du bureau
                    </label>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Notes ou informations supplémentaires..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/administration')}
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
