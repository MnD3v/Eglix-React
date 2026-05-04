import { useState } from 'react';
import { memberService } from '../../../services/memberService';
import Loader from '../../../components/Loader';

const F = ({ label, name, type = 'text', value, onChange, placeholder = '', required = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
            type={type} name={name} value={value || ''} onChange={onChange}
            placeholder={placeholder} required={required}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
        />
    </div>
);

const S = ({ label, name, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            name={name} value={value} onChange={onChange}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all appearance-none"
        >
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

const Section = ({ title }) => (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2 border-t border-gray-100">{title}</p>
);

export default function AnnexeMemberForm({ churchId, annexeId, onSuccess, onCancel }) {
    const [form, setForm] = useState({
        first_name: '', last_name: '',
        gender: 'male', marital_status: 'single',
        birth_date: '', email: '', phone: '', address: '',
        status: 'active', function: '',
        joined_at: '', baptized_at: '', baptism_responsible: '',
        notes: '', photo_url: '',
    });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handlePhoto = async e => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            const url = await memberService.uploadPhoto(file);
            setForm(p => ({ ...p, photo_url: url }));
        } catch (err) {
            setError('Erreur lors du téléchargement de la photo.');
        } finally { setUploading(false); }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.first_name.trim() || !form.last_name.trim()) {
            setError('Prénom et nom sont obligatoires.');
            return;
        }
        try {
            setLoading(true); setError(null);
            await memberService.create({ ...form, church_id: churchId, annexe_id: annexeId });
            onSuccess();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'enregistrement.');
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
            )}

            {/* Photo */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
                    {form.photo_url
                        ? <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
                        : <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    }
                </div>
                <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        {uploading ? 'Téléchargement...' : 'Ajouter une photo'}
                        <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" disabled={uploading} />
                    </label>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG ou GIF. Max 5MB.</p>
                </div>
            </div>

            {/* Identité */}
            <Section title="Informations personnelles" />
            <div className="grid grid-cols-2 gap-3">
                <F label="Prénom" name="first_name" value={form.first_name} onChange={handleChange} required />
                <F label="Nom" name="last_name" value={form.last_name} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <S label="Genre" name="gender" value={form.gender} onChange={handleChange} options={[
                    { value: 'male', label: 'Homme' },
                    { value: 'female', label: 'Femme' },
                    { value: 'other', label: 'Autre' },
                ]} />
                <S label="État civil" name="marital_status" value={form.marital_status} onChange={handleChange} options={[
                    { value: 'single', label: 'Célibataire' },
                    { value: 'married', label: 'Marié(e)' },
                    { value: 'divorced', label: 'Divorcé(e)' },
                    { value: 'widowed', label: 'Veuf/Veuve' },
                ]} />
            </div>
            <F label="Date de naissance" name="birth_date" type="date" value={form.birth_date} onChange={handleChange} />

            {/* Coordonnées */}
            <Section title="Coordonnées" />
            <F label="Téléphone" name="phone" value={form.phone} onChange={handleChange} placeholder="+237 6XX XXX XXX" />
            <F label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            <F label="Adresse" name="address" value={form.address} onChange={handleChange} placeholder="Quartier, ville..." />

            {/* Vie ecclésiastique */}
            <Section title="Vie ecclésiastique" />
            <div className="grid grid-cols-2 gap-3">
                <S label="Statut" name="status" value={form.status} onChange={handleChange} options={[
                    { value: 'active', label: 'Actif' },
                    { value: 'inactive', label: 'Inactif' },
                    { value: 'pending', label: 'En attente' },
                ]} />
                <F label="Fonction / Rôle" name="function" value={form.function} onChange={handleChange} placeholder="ex: Diacre" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <F label="Date d'adhésion" name="joined_at" type="date" value={form.joined_at} onChange={handleChange} />
                <F label="Date de baptême" name="baptized_at" type="date" value={form.baptized_at} onChange={handleChange} />
            </div>
            <F label="Baptisé par" name="baptism_responsible" value={form.baptism_responsible} onChange={handleChange} placeholder="Nom du responsable" />

            {/* Notes */}
            <Section title="Notes" />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes générales</label>
                <textarea
                    name="notes" value={form.notes || ''} onChange={handleChange} rows={3}
                    placeholder="Informations complémentaires..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all resize-none"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={onCancel}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                </button>
                <button type="submit" disabled={loading || uploading}
                    className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader />} Enregistrer
                </button>
            </div>
        </form>
    );
}
