import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { offeringService } from '../../services/offeringService';
import { useChurch } from '../../context/ChurchContext';

// Reusable Input Component
const InputGroup = ({ label, name, type = "text", required = false, placeholder = "", value, onChange, className = "", min }) => (
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

export default function OfferingForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentChurch } = useChurch();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [offeringTypes, setOfferingTypes] = useState([]);

    const [formData, setFormData] = useState({
        offering_type_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        description: ''
    });

    const loadData = useCallback(async () => {
        if (!currentChurch) return;

        try {
            setLoading(true);
            const typesData = await offeringService.getTypes(currentChurch.id);
            setOfferingTypes(typesData);

            if (id) {
                const offeringData = await offeringService.getById(id);
                if (offeringData) {
                    setFormData({
                        ...offeringData,
                        offering_type_id: offeringData.offering_type_id || '',
                        date: offeringData.date ? offeringData.date.split('T')[0] : ''
                    });
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
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
                church_id: currentChurch.id
            };

            if (isEditMode) {
                await offeringService.update(id, dataToSubmit);
            } else {
                await offeringService.create(dataToSubmit);
            }
            navigate('/offerings');
        } catch (error) {
            console.error('Error saving offering:', error);
            alert('Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.amount) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

    const paymentMethodOptions = [
        { value: 'cash', label: 'Espèces' },
        { value: 'mobile', label: 'Mobile Money' },
        { value: 'bank', label: 'Virement' },
        { value: 'check', label: 'Chèque' }
    ];

    return (
        <div className="max-w-3xl mx-auto pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/offerings')}
                        className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Retour aux offrandes
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {isEditMode ? 'Modifier l\'offrande' : 'Nouvelle offrande'}
                    </h1>
                    <p className="text-gray-500 mt-1">Remplissez les informations ci-dessous pour {isEditMode ? 'mettre à jour' : 'enregistrer'} une contribution.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Montant et Date */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Montant <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">FCFA</span>
                                </div>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    min="0"
                                    step="100"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="block w-full pl-16 pr-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 sm:text-sm placeholder-gray-400"
                                />
                            </div>
                        </div>

                        <SelectGroup
                            label="Type d'offrande"
                            name="offering_type_id"
                            value={formData.offering_type_id}
                            onChange={handleChange}
                            options={[
                                { value: '', label: 'Sélectionner un type...' },
                                ...offeringTypes.map(t => ({ value: t.id, label: t.name }))
                            ]}
                        />

                        <InputGroup
                            label="Date"
                            name="date"
                            type="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Mode de paiement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectGroup
                            label="Mode de paiement"
                            name="payment_method"
                            required
                            value={formData.payment_method}
                            onChange={handleChange}
                            options={paymentMethodOptions}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description / Note</label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description || ''}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 sm:text-sm placeholder-gray-400"
                            placeholder="Ex: Offrande du dimanche..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/offerings')}
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
