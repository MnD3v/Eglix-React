import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { titheService } from '../../services/titheService';
import { useChurch } from '../../context/ChurchContext';
import MemberSelectorModal from '../../components/MemberSelectorModal';

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

export default function TitheForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentChurch } = useChurch();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    // donorMode: 'member' | 'external' | 'anonymous'
    const [donorMode, setDonorMode] = useState('member');
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    const [formData, setFormData] = useState({
        member_id: '',
        donor_name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        description: ''
    });

    const loadData = useCallback(async () => {
        if (!currentChurch) return;

        try {
            setLoading(true);
            // Load members for dropdown
            const membersData = await titheService.getMembers(currentChurch.id);
            setMembers(membersData);

            // If edit mode, load tithe data
            if (id) {
                const titheData = await titheService.getById(id);
                if (titheData) {
                    setFormData({
                        ...titheData,
                        member_id: titheData.member_id || '',
                        donor_name: titheData.donor_name || '',
                        date: titheData.date ? titheData.date.split('T')[0] : ''
                    });

                    if (titheData.member_id) {
                        const member = membersData.find(m => m.id === titheData.member_id) || titheData.members;
                        setSelectedMember(member);
                        setDonorMode('member');
                    } else if (titheData.donor_name) {
                        setDonorMode('external');
                    } else {
                        setDonorMode('anonymous');
                    }
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

    const handleMemberSelect = (member) => {
        setSelectedMember(member);
        setFormData(prev => ({ ...prev, member_id: member.id }));
    };

    const handleDonorMode = (mode) => {
        setDonorMode(mode);
        setSelectedMember(null);
        setFormData(prev => ({ ...prev, member_id: '', donor_name: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentChurch) { alert("Aucune église sélectionnée"); return; }
        if (donorMode === 'member' && !formData.member_id) {
            alert("Veuillez sélectionner un membre.");
            return;
        }
        if (donorMode === 'external' && !formData.donor_name.trim()) {
            alert("Veuillez saisir le nom du donateur.");
            return;
        }

        setLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                church_id: currentChurch.id,
                member_id: donorMode === 'member' ? formData.member_id : null,
                donor_name: donorMode === 'external' ? formData.donor_name.trim() : null,
            };
            if (isEditMode) {
                await titheService.update(id, dataToSubmit);
            } else {
                await titheService.create(dataToSubmit);
            }
            navigate('/tithes');
        } catch (error) {
            console.error('Error saving tithe:', error);
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
                        onClick={() => navigate('/tithes')}
                        className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Retour aux dîmes
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {isEditMode ? 'Modifier la dîme' : 'Nouvelle dîme'}
                    </h1>
                    <p className="text-gray-500 mt-1">Remplissez les informations ci-dessous pour {isEditMode ? 'mettre à jour' : 'enregistrer'} une contribution.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Montant et Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <InputGroup
                            label="Date"
                            name="date"
                            type="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Donateur */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Donateur <span className="text-red-500">*</span></label>
                        {/* Mode selector */}
                        <div className="flex gap-2">
                            {[
                                { key: 'member',    label: 'Membre' },
                                { key: 'external',  label: 'Non-membre' },
                                { key: 'anonymous', label: 'Anonyme' },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => handleDonorMode(opt.key)}
                                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                                        donorMode === opt.key
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Member picker */}
                        {donorMode === 'member' && (
                            <div onClick={() => setIsMemberModalOpen(true)} className="relative cursor-pointer group">
                                <div className={`block w-full px-4 py-3 rounded-xl border ${
                                    selectedMember ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                                } text-gray-900 sm:text-sm flex items-center justify-between group-hover:border-gray-400 transition-all`}>
                                    <span className={selectedMember ? 'font-medium' : 'text-gray-400'}>
                                        {selectedMember ? `${selectedMember.first_name} ${selectedMember.last_name}` : 'Sélectionner un membre...'}
                                    </span>
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* External name input */}
                        {donorMode === 'external' && (
                            <input
                                type="text"
                                name="donor_name"
                                value={formData.donor_name}
                                onChange={handleChange}
                                placeholder="Nom et prénom du donateur"
                                className="block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all sm:text-sm placeholder-gray-400"
                            />
                        )}

                        {/* Anonymous */}
                        {donorMode === 'anonymous' && (
                            <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 sm:text-sm italic">
                                Dîme anonyme — aucun nom enregistré
                            </div>
                        )}
                    </div>

                    {/* Mode de paiement */}
                    <SelectGroup
                        label="Mode de paiement"
                        name="payment_method"
                        required
                        value={formData.payment_method}
                        onChange={handleChange}
                        options={paymentMethodOptions}
                    />

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description / Note</label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description || ''}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 sm:text-sm placeholder-gray-400"
                            placeholder="Ex: Dîme du mois de Janvier..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/tithes')}
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

            <MemberSelectorModal
                isOpen={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
                onSelect={handleMemberSelect}
                members={members}
            />
        </div>
    );
}
