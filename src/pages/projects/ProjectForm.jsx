import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { useChurch } from '../../context/ChurchContext';

const InputGroup = ({ label, name, type = "text", required = false, placeholder = "", value, onChange, className = "", min, max, step }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <input
            type={type}
            name={name}
            required={required}
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            className="block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 sm:text-sm placeholder-gray-400"
        />
    </div>
);

const SelectGroup = ({ label, name, value, onChange, options, className = "", required = false }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 sm:text-sm appearance-none cursor-pointer"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    </div>
);

export default function ProjectForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentChurch } = useChurch();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        target_amount: '',
        collected_amount: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'active'
    });

    const loadData = useCallback(async () => {
        if (!currentChurch || !id) return;

        try {
            setLoading(true);
            const projectData = await projectService.getById(id);
            if (projectData) {
                setFormData({
                    ...projectData,
                    start_date: projectData.start_date ? projectData.start_date.split('T')[0] : '',
                    end_date: projectData.end_date ? projectData.end_date.split('T')[0] : ''
                });
            }
        } catch (error) {
            console.error('Error loading project data:', error);
            alert('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    }, [currentChurch, id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentChurch) {
            alert("Aucune église sélectionnée");
            return;
        }

        setLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                church_id: currentChurch.id,
            };

            if (isEditMode) {
                await projectService.update(id, dataToSubmit);
            } else {
                await projectService.create(dataToSubmit);
            }
            navigate('/projects');
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = [
        { value: 'active', label: 'En cours' },
        { value: 'completed', label: 'Terminé' },
        { value: 'cancelled', label: 'Annulé' }
    ];

    if (loading && isEditMode && !formData.name) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

    return (
        <div className="max-w-3xl mx-auto pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/projects')}
                        className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Retour aux projets
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {isEditMode ? 'Modifier le projet' : 'Nouveau projet'}
                    </h1>
                    <p className="text-gray-500 mt-1">Remplissez les informations ci-dessous pour gérer ce projet.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nom et Statut */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup
                            label="Nom du projet"
                            name="name"
                            required
                            placeholder="Ex: Construction, Achat matériel..."
                            value={formData.name}
                            onChange={handleChange}
                        />

                        <SelectGroup
                            label="Statut"
                            name="status"
                            required
                            value={formData.status}
                            onChange={handleChange}
                            options={statusOptions}
                        />
                    </div>

                    {/* Objectif et Collecté */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Objectif à atteindre (FCFA)</label>
                            <input
                                type="number"
                                name="target_amount"
                                min="0"
                                step="1000"
                                placeholder="0"
                                value={formData.target_amount}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 sm:text-sm placeholder-gray-400"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Montant déjà collecté (FCFA)</label>
                            <input
                                type="number"
                                name="collected_amount"
                                min="0"
                                step="100"
                                placeholder="0"
                                value={formData.collected_amount}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 sm:text-sm placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup
                            label="Date de début"
                            name="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={handleChange}
                        />
                        <InputGroup
                            label="Date de fin"
                            name="end_date"
                            type="date"
                            value={formData.end_date}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description / Note</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description || ''}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 sm:text-sm placeholder-gray-400"
                            placeholder="Détails du projet..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/projects')}
                            className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-2.5 rounded-full text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
