import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import { useChurch } from '../../context/ChurchContext';

export default function GroupForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentChurch } = useChurch();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [types, setTypes] = useState([]);
    const [showNewType, setShowNewType] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [savingType, setSavingType] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        group_type_id: '',
        description: ''
    });

    const loadData = useCallback(async () => {
        if (!currentChurch) return;
        try {
            const typesData = await groupService.getTypes(currentChurch.id);
            setTypes(typesData);

            if (isEditMode) {
                setLoading(true);
                const group = await groupService.getById(id);
                setFormData({
                    name: group.name || '',
                    group_type_id: group.group_type_id || '',
                    description: group.description || ''
                });
            }
        } catch (err) {
            console.error(err);
            alert('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    }, [currentChurch, id, isEditMode]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddType = async () => {
        if (!newTypeName.trim()) return;
        try {
            setSavingType(true);
            const created = await groupService.createType(currentChurch.id, newTypeName.trim());
            setTypes(prev => [...prev, created]);
            setFormData(prev => ({ ...prev, group_type_id: created.id }));
            setNewTypeName('');
            setShowNewType(false);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la création du type');
        } finally {
            setSavingType(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentChurch) return;

        try {
            setLoading(true);
            const payload = {
                name: formData.name,
                description: formData.description,
                group_type_id: formData.group_type_id || null
            };

            if (isEditMode) {
                await groupService.update(id, payload);
            } else {
                await groupService.create(currentChurch.id, payload);
            }
            navigate('/groups');
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/groups')}
                    className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour aux groupes
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Modifier le groupe' : 'Nouveau groupe'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
                    <h2 className="font-semibold text-gray-900">Informations du groupe</h2>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                            Nom du groupe <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="ex: Chorale, Jeunesse, Cellule Nord..."
                            className="block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-100 transition-all sm:text-sm"
                        />
                    </div>

                    {/* Type de groupe */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Type de groupe</label>
                        <div className="flex gap-2">
                            <select
                                name="group_type_id"
                                value={formData.group_type_id}
                                onChange={handleChange}
                                className="flex-1 px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-100 transition-all sm:text-sm"
                            >
                                <option value="">Sans type</option>
                                {types.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowNewType(!showNewType)}
                                className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all text-sm font-medium whitespace-nowrap"
                            >
                                + Nouveau type
                            </button>
                        </div>

                        {/* Formulaire nouveau type inline */}
                        {showNewType && (
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    value={newTypeName}
                                    onChange={e => setNewTypeName(e.target.value)}
                                    placeholder="Nom du type (ex: Département)"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddType())}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={handleAddType}
                                    disabled={savingType || !newTypeName.trim()}
                                    className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-all disabled:opacity-50"
                                >
                                    {savingType ? '...' : 'Ajouter'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowNewType(false); setNewTypeName(''); }}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Décrivez brièvement ce groupe..."
                            className="block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-100 transition-all sm:text-sm"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/groups')}
                        className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-2.5 rounded-full text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </div>
    );
}
