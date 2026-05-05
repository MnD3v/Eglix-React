import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { donationService } from '../../services/donationService';

export default function DonationForm() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState(null);
    const [members, setMembers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        donation_type: 'money',
        amount: '',
        physical_item: '',
        donor_name: '',
        member_id: '',
        project_id: '',
        payment_method: '',
        reference: '',
        received_at: new Date().toISOString().split('T')[0],
        church_id: '',
        notes: '',
    });

    useEffect(() => {
        if (!currentChurch) return;
        setFormData(f => ({ ...f, church_id: currentChurch.id }));
        donationService.getMembers(currentChurch.id).then(setMembers).catch(console.error);
        donationService.getProjects(currentChurch.id).then(setProjects).catch(console.error);
        if (isEdit) {
            donationService.getById(id).then(data => {
                setFormData({
                    donation_type: data.donation_type || 'money',
                    amount: data.amount || '',
                    physical_item: data.physical_item || '',
                    donor_name: data.donor_name || '',
                    member_id: data.member_id || '',
                    project_id: data.project_id || '',
                    payment_method: data.payment_method || '',
                    reference: data.reference || '',
                    received_at: data.received_at ? data.received_at.split('T')[0] : '',
                    church_id: currentChurch.id,
                    notes: data.notes || '',
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
                await donationService.update(id, formData);
            } else {
                await donationService.create(formData);
            }
            navigate('/donations');
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
                    onClick={() => navigate('/donations')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mb-4 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour aux dons
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Modifier le don' : 'Nouveau don'}
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
                {/* Type de don */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type de don</label>
                    <div className="flex gap-3">
                        {[
                            { value: 'money', label: 'Argent', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                            { value: 'physical', label: 'Objet physique', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
                        ].map(opt => (
                            <label key={opt.value} className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="donation_type"
                                    value={opt.value}
                                    checked={formData.donation_type === opt.value}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${formData.donation_type === opt.value
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}>
                                    {opt.icon}
                                    {opt.label}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Montant (si argent) */}
                {formData.donation_type === 'money' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Montant (FCFA) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required={formData.donation_type === 'money'}
                            min="0"
                            step="1"
                            placeholder="Ex: 25000"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        />
                    </div>
                )}

                {/* Objet physique */}
                {formData.donation_type === 'physical' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description de l'objet <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="physical_item"
                            value={formData.physical_item}
                            onChange={handleChange}
                            required={formData.donation_type === 'physical'}
                            placeholder="Ex: Chaises, tables, projecteur..."
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        />
                    </div>
                )}

                {/* Donateur */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du donateur</label>
                    <input
                        type="text"
                        name="donor_name"
                        value={formData.donor_name}
                        onChange={handleChange}
                        placeholder="Nom ou 'Anonyme'..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                </div>

                {/* Ou choisir un membre */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Membre lié (optionnel)</label>
                    <select
                        name="member_id"
                        value={formData.member_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                    >
                        <option value="">— Choisir un membre —</option>
                        {members.map(m => (
                            <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                        ))}
                    </select>
                </div>

                {/* Mode de paiement (argent seulement) */}
                {formData.donation_type === 'money' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
                        <select
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                        >
                            <option value="">— Choisir —</option>
                            <option value="cash">Espèces</option>
                            <option value="mobile">Mobile Money</option>
                            <option value="bank">Virement bancaire</option>
                            <option value="check">Chèque</option>
                        </select>
                    </div>
                )}

                {/* Référence */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Référence (optionnel)</label>
                    <input
                        type="text"
                        name="reference"
                        value={formData.reference}
                        onChange={handleChange}
                        placeholder="Numéro de référence..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date reçue <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="received_at"
                        value={formData.received_at}
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
                        <option value="">Aucun projet</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Notes supplémentaires..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/donations')}
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
