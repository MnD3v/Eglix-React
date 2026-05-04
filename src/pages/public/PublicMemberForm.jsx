import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { memberService } from '../../services/memberService';

// Reusable Input Component
const InputGroup = ({ label, name, type = "text", value, onChange, required = false, placeholder }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all placeholder:text-gray-400"
            placeholder={placeholder}
        />
    </div>
);

const SelectGroup = ({ label, name, value, onChange, required = false, options }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export default function PublicMemberForm() {
    const { churchId } = useParams();
    const [church, setChurch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        gender: 'male',
        marital_status: 'single',
        birth_date: '',
        email: '',
        phone: '',
        address: '',
        function: '',
        joined_at: '',
        baptized_at: '',
        baptism_responsible: '',
        notes: ''
    });

    useEffect(() => {
        loadChurchInfo();
    }, [churchId]);

    const loadChurchInfo = async () => {
        try {
            // Decode the church ID from Base64
            const decodedId = atob(churchId);
            const data = await memberService.getPublicChurchInfo(decodedId);
            setChurch(data);
        } catch (err) {
            console.error(err);
            setError("Impossible de charger les informations de l'église. Le lien est peut-être invalide.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Decode the church ID from Base64
            const decodedId = atob(churchId);
            await memberService.registerViaLink(decodedId, formData);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription Réussie !</h2>
                    <p className="text-gray-600 mb-2">
                        Merci {formData.first_name}, votre demande d'inscription à <strong>{church?.name}</strong> a bien été envoyée.
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        Votre inscription est en attente de validation par un administrateur.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-primary hover:text-primary-dark font-medium"
                    >
                        Retourner au formulaire
                    </button>
                </div>
            </div>
        );
    }

    if (error && !church) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Lien Invalide</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <span className="text-white font-bold text-2xl">
                            {church?.name?.[0] || 'E'}
                        </span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Rejoindre {church?.name}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Remplissez ce formulaire pour vous inscrire en tant que membre.
                    </p>
                    <p className="mt-1 text-xs text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded-full">
                        Votre inscription sera en attente de validation
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white py-8 px-6 shadow-lg sm:rounded-3xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Section: Informations Personnelles */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Informations Personnelles</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup
                                    label="Prénom"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Jean"
                                />
                                <InputGroup
                                    label="Nom"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Dupont"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectGroup
                                    label="Genre"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                    options={[
                                        { value: 'male', label: 'Homme' },
                                        { value: 'female', label: 'Femme' }
                                    ]}
                                />
                                <SelectGroup
                                    label="Statut Matrimonial"
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
                            </div>

                            <InputGroup
                                label="Date de Naissance"
                                name="birth_date"
                                type="date"
                                value={formData.birth_date}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Section: Contact */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Contact</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup
                                    label="Téléphone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="01 23 45 67 89"
                                />
                                <InputGroup
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="jean.dupont@example.com"
                                />
                            </div>

                            <InputGroup
                                label="Adresse"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="123 Rue de l'Eglise, 75001 Paris"
                            />
                        </div>

                        {/* Section: Informations Spirituelles */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Informations Spirituelles</h3>

                            <InputGroup
                                label="Fonction dans l'Église"
                                name="function"
                                value={formData.function}
                                onChange={handleChange}
                                placeholder="Ex: Diacre, Ancien, Membre..."
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup
                                    label="Date d'Adhésion"
                                    name="joined_at"
                                    type="date"
                                    value={formData.joined_at}
                                    onChange={handleChange}
                                />
                                <InputGroup
                                    label="Date de Baptême"
                                    name="baptized_at"
                                    type="date"
                                    value={formData.baptized_at}
                                    onChange={handleChange}
                                />
                            </div>

                            <InputGroup
                                label="Baptisé par"
                                name="baptism_responsible"
                                value={formData.baptism_responsible}
                                onChange={handleChange}
                                placeholder="Nom du pasteur/responsable"
                            />
                        </div>

                        {/* Section: Notes */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Informations Complémentaires</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Notes / Commentaires
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all placeholder:text-gray-400"
                                    placeholder="Informations supplémentaires que vous souhaitez partager..."
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Inscription en cours...
                                </span>
                            ) : (
                                "Envoyer ma demande d'inscription"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Propulsé par Eglix
                </p>
            </div>
        </div>
    );
}
