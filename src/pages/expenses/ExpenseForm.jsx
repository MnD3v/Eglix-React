import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { expenseService } from '../../services/expenseService';

export default function ExpenseForm() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState(null);
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        paid_at: new Date().toISOString().split('T')[0],
        project_id: '',
        church_id: '',
    });

    useEffect(() => {
        if (!currentChurch) return;
        setFormData(f => ({ ...f, church_id: currentChurch.id }));
        expenseService.getProjects(currentChurch.id).then(setProjects).catch(console.error);
        if (isEdit) {
            expenseService.getById(id).then(data => {
                setFormData({
                    amount: data.amount || '',
                    description: data.description || '',
                    paid_at: data.paid_at ? data.paid_at.split('T')[0] : '',
                    project_id: data.project_id || '',
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
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isEdit) {
                await expenseService.update(id, formData);
            } else {
                await expenseService.create(formData);
            }
            navigate('/expenses');
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
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate('/expenses')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mb-4 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour aux dépenses
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Modifier la dépense' : 'Nouvelle dépense'}
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
                {/* Montant */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Montant (FCFA) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        min="0"
                        step="1"
                        placeholder="Ex: 50000"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Objet de la dépense..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="paid_at"
                        value={formData.paid_at}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                </div>

                {/* Projet lié */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Projet lié (optionnel)</label>
                    <select
                        name="project_id"
                        value={formData.project_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                    >
                        <option value="">Dépense générale</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/expenses')}
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
