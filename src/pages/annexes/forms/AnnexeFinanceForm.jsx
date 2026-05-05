import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import Loader from '../../../components/Loader';

// type: 'tithe' | 'offering' | 'donation'
export default function AnnexeFinanceForm({ type, churchId, annexeId, onSuccess, onCancel }) {
    const isDonation = type === 'donation';
    const today = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        amount: '',
        date: today,
        received_at: today,
        payment_method: 'cash',
        donation_type: 'money',
        donor_name: '',
        member_id: '',
        description: '',
    });
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!churchId) return;
        supabase.from('members').select('id, first_name, last_name')
            .eq('church_id', churchId).eq('status', 'active').order('first_name')
            .then(({ data }) => setMembers(data || []));
    }, [churchId]);

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.amount || parseFloat(form.amount) <= 0) { setError('Le montant est obligatoire.'); return; }
        try {
            setLoading(true); setError(null);
            const table = type === 'tithe' ? 'tithes' : type === 'offering' ? 'offerings' : 'donations';
            const payload = {
                church_id: churchId,
                annexe_id: annexeId,
                amount: parseFloat(form.amount),
                payment_method: form.payment_method || null,
                description: form.description || null,
                member_id: form.member_id || null,
            };
            if (isDonation) {
                payload.received_at = form.received_at;
                payload.donation_type = form.donation_type;
                payload.donor_name = form.donor_name || null;
            } else {
                payload.date = form.date;
            }
            const { error: err } = await supabase.from(table).insert([payload]);
            if (err) throw err;
            onSuccess();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'enregistrement.');
        } finally { setLoading(false); }
    };

    const titles = { tithe: 'Dîme', offering: 'Offrande', donation: 'Don' };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">{error}</div>}

            {/* Amount */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (XAF) <span className="text-red-500">*</span></label>
                <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="ex: 5000" min="0" step="100" required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all" />
            </div>

            {/* Date */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" name={isDonation ? 'received_at' : 'date'} value={isDonation ? form.received_at : form.date} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all" />
            </div>

            {/* Payment method */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
                <select name="payment_method" value={form.payment_method} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all">
                    <option value="cash">Espèces</option>
                    <option value="mobile">Mobile Money</option>
                    <option value="bank">Virement bancaire</option>
                    <option value="check">Chèque</option>
                </select>
            </div>

            {/* Member */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membre (optionnel)</label>
                <select name="member_id" value={form.member_id} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all">
                    <option value="">— Anonyme —</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                </select>
            </div>

            {/* Donor name (donations only) */}
            {isDonation && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du donateur</label>
                    <input type="text" name="donor_name" value={form.donor_name} onChange={handleChange} placeholder="Nom externe si non-membre"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all" />
                </div>
            )}

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Note optionnelle..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all resize-none" />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader />} Enregistrer
                </button>
            </div>
        </form>
    );
}
