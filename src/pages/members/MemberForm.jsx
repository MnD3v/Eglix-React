import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { memberService } from '../../services/memberService';
import { useChurch } from '../../context/ChurchContext';

// Reusable Input Component
const InputGroup = ({ label, name, type = "text", required = false, placeholder = "", value, onChange, className = "" }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <input
            type={type}
            name={name}
            required={required}
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            className="block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 sm:text-sm placeholder-gray-400"
        />
    </div>
);

const SelectGroup = ({ label, name, value, onChange, options, className = "" }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
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

export default function MemberForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentChurch } = useChurch();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        gender: 'male',
        marital_status: 'single',
        birth_date: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
        function: '',
        joined_at: '',
        baptized_at: '',
        baptism_responsible: '',
        notes: '',
        photo_url: ''
    });

    const loadMember = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            const data = await memberService.getById(id);
            if (data) {
                setFormData(data);
            }
        } catch (error) {
            console.error('Error loading member:', error);
            alert('Erreur lors du chargement du membre');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (isEditMode) {
            loadMember();
        }
    }, [isEditMode, loadMember]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            const publicUrl = await memberService.uploadPhoto(file);
            setFormData(prev => ({ ...prev, photo_url: publicUrl }));
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Erreur lors du téléchargement de la photo');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentChurch) {
            alert("Aucune église sélectionnée");
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                await memberService.update(id, formData);
            } else {
                await memberService.create({
                    ...formData,
                    church_id: currentChurch.id
                });
            }
            navigate('/members');
        } catch (error) {
            console.error('Error saving member:', error);
            alert('Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.first_name) return <div className="p-8 text-center text-gray-500">Chargement...</div>;



    return (
        <div className="max-w-5xl mx-auto pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/members')}
                        className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Retour aux membres
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {isEditMode ? 'Modifier le profil' : 'Nouveau membre'}
                    </h1>
                    <p className="text-gray-500 mt-1">Remplissez les informations ci-dessous pour {isEditMode ? 'mettre à jour' : 'créer'} un membre.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Photo & Status */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">Photo de profil</h2>
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="h-40 w-40 rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center shadow-inner transition-all duration-300 group-hover:border-gray-300">
                                    {formData.photo_url ? (
                                        <img src={formData.photo_url} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="mt-1 text-xs text-gray-400">Ajouter une photo</p>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-transform hover:scale-110 border border-gray-100">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 text-center">
                                {uploading ? 'Téléchargement...' : 'JPG, PNG ou GIF. Max 5MB.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Statut & Rôle</h2>
                        <div className="space-y-4">
                            <SelectGroup
                                label="Statut"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={[
                                    { value: 'active', label: 'Actif' },
                                    { value: 'inactive', label: 'Inactif' }
                                ]}
                            />
                            <InputGroup
                                label="Fonction / Rôle"
                                name="function"
                                placeholder="ex: Diacre, Chantre"
                                value={formData.function}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column - Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </span>
                            Informations Personnelles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Prénom" name="first_name" required value={formData.first_name} onChange={handleChange} />
                            <InputGroup label="Nom" name="last_name" required value={formData.last_name} onChange={handleChange} />

                            <SelectGroup
                                label="Genre"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                options={[
                                    { value: 'male', label: 'Homme' },
                                    { value: 'female', label: 'Femme' },
                                    { value: 'other', label: 'Autre' }
                                ]}
                            />

                            <SelectGroup
                                label="État Civil"
                                name="marital_status"
                                value={formData.marital_status}
                                onChange={handleChange}
                                options={[
                                    { value: 'single', label: 'Célibataire' },
                                    { value: 'married', label: 'Marié(e)' },
                                    { value: 'divorced', label: 'Divorcé(e)' },
                                    { value: 'widowed', label: 'Veuf/Veuve' }
                                ]}
                            />

                            <InputGroup label="Date de naissance" name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </span>
                            Coordonnées
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                            <InputGroup label="Téléphone" name="phone" value={formData.phone} onChange={handleChange} />
                            <div className="md:col-span-2">
                                <InputGroup label="Adresse" name="address" value={formData.address} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Church Info */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </span>
                            Vie Ecclésiastique
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Date d'adhésion" name="joined_at" type="date" value={formData.joined_at} onChange={handleChange} />
                            <InputGroup label="Date de baptême" name="baptized_at" type="date" value={formData.baptized_at} onChange={handleChange} />
                            <div className="md:col-span-2">
                                <InputGroup label="Baptisé par" name="baptism_responsible" value={formData.baptism_responsible} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </span>
                            Notes
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes générales</label>
                            <textarea
                                name="notes"
                                rows={4}
                                value={formData.notes || ''}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 sm:text-sm placeholder-gray-400"
                                placeholder="Ajoutez des notes supplémentaires ici..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => navigate('/members')}
                    className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm"
                >
                    Annuler
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading || uploading}
                    className="px-8 py-2.5 rounded-full text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>
        </div>
    );
}
