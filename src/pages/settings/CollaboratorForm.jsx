import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { collaboratorService } from '../../services/collaboratorService';
import { annexeService } from '../../services/annexeService';
import Spinner from '../../components/Spinner';

export default function CollaboratorForm() {
    const { id } = useParams(); // If presence of id, we're editing
    const isEdit = !!id;
    const navigate = useNavigate();
    const { currentChurch, userRole } = useChurch();

    // Application sections mapping
    const APPLICATION_SECTIONS = [
        { key: 'members', label: 'Membres', category: 'Communauté' },
        { key: 'groups', label: 'Groupes', category: 'Communauté' },
        { key: 'guests', label: 'Invités', category: 'Communauté' },
        { key: 'tithes', label: 'Dîmes', category: 'Finances' },
        { key: 'offerings', label: 'Offrandes', category: 'Finances' },
        { key: 'donations', label: 'Dons', category: 'Finances' },
        { key: 'expenses', label: 'Dépenses', category: 'Finances' },
        { key: 'projects', label: 'Projets', category: 'Activités' },
        { key: 'journal', label: 'Journal', category: 'Activités' },
        { key: 'administration', label: 'Administration', category: 'Gestion' },
        { key: 'documents', label: 'Documents', category: 'Gestion' },
        { key: 'edit_church', label: 'Modifier l\'Église', category: 'Gestion' },
    ];

    // Form state
    const [email, setEmail] = useState('');
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    
    const [role, setRole] = useState('user'); // 'user' or 'admin'
    const [sections, setSections] = useState({
        members: false, groups: false, guests: false,
        tithes: false, offerings: false, donations: false, expenses: false,
        projects: false, journal: false,
        administration: false, documents: false, edit_church: false
    });
    
    // Annexes states
    const [isGeneralManager, setIsGeneralManager] = useState(false);
    const [managedAnnexIds, setManagedAnnexIds] = useState([]);
    const [allAnnexes, setAllAnnexes] = useState([]);
    
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Fetch all annexes and load existing collaborator if in edit mode
    useEffect(() => {
        // Pre-flight check: Only owners and admins
        if (userRole && userRole !== 'owner' && userRole !== 'admin') {
            navigate('/settings');
            return;
        }

        async function loadInitialData() {
            if (!currentChurch) return;
            try {
                setLoading(true);
                
                // Load all annexes
                const annexesRes = await annexeService.getAll(currentChurch.id);
                setAllAnnexes(annexesRes.data || []);

                if (isEdit) {
                    // We're editing, load existing collaborator permissions
                    const collaborators = await collaboratorService.getCollaborators(currentChurch.id);
                    const currentCollab = collaborators.find(c => c.id.toString() === id);
                    
                    if (!currentCollab) {
                        setError('Collaborateur non trouvé');
                        return;
                    }

                    setSelectedProfile(currentCollab.profile);
                    setEmail(currentCollab.profile?.email || '');
                    setRole(currentCollab.role || 'user');

                    const perms = currentCollab.permissions || {};
                    if (perms.sections) {
                        setSections(prev => ({ ...prev, ...perms.sections }));
                    }
                    
                    if (perms.annexes) {
                        setIsGeneralManager(!!perms.annexes.is_general_manager);
                        setManagedAnnexIds(perms.annexes.managed_annex_ids || []);
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Erreur lors du chargement des données.');
            } finally {
                setLoading(false);
            }
        }

        loadInitialData();
    }, [id, isEdit, currentChurch, userRole, navigate]);

    // Search user profile by email
    const handleSearchProfile = async () => {
        if (!email || !email.includes('@')) {
            setSearchError('Veuillez entrer un email valide.');
            return;
        }
        
        try {
            setSearchLoading(true);
            setSearchError('');
            setSelectedProfile(null);
            
            const profile = await collaboratorService.findProfileByEmail(email);
            
            if (profile) {
                setSelectedProfile(profile);
            } else {
                setSearchError("Aucun compte Eglix n'existe avec cette adresse email. Veuillez demander à la personne de s'inscrire d'abord.");
            }
        } catch (err) {
            console.error(err);
            setSearchError("Erreur lors de la recherche. Veuillez réessayer.");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleToggleSection = (key) => {
        setSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleToggleSelectAllSections = (select) => {
        const newSections = {};
        APPLICATION_SECTIONS.forEach(sec => {
            newSections[sec.key] = select;
        });
        setSections(newSections);
    };

    const handleToggleAnnex = (annexeId) => {
        setManagedAnnexIds(prev => {
            if (prev.includes(annexeId)) {
                return prev.filter(id => id !== annexeId);
            } else {
                return [...prev, annexeId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedProfile) {
            setError('Veuillez d\'abord valider l\'utilisateur par email.');
            return;
        }

        try {
            setSaving(true);
            setError('');

            // Prepare permissions JSON
            const permissionsJson = {
                sections: role === 'admin' ? null : sections, // admins bypass sections perms
                annexes: {
                    is_general_manager: isGeneralManager,
                    managed_annex_ids: isGeneralManager ? [] : managedAnnexIds
                }
            };

            if (isEdit) {
                await collaboratorService.updateCollaborator(id, {
                    role,
                    permissions: permissionsJson
                });
            } else {
                // Add new collaborator
                // First check if they are already added
                const collaborators = await collaboratorService.getCollaborators(currentChurch.id);
                const alreadyExists = collaborators.some(c => c.user_id === selectedProfile.id);
                
                if (alreadyExists) {
                    setError('Cet utilisateur est déjà un collaborateur de cette église.');
                    setSaving(false);
                    return;
                }

                await collaboratorService.addCollaborator(
                    currentChurch.id,
                    selectedProfile.id,
                    role,
                    permissionsJson
                );
            }

            navigate('/settings/collaborators');
        } catch (err) {
            console.error(err);
            setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="flex space-x-2">
                <div className="w-2 h-2 bg-[#ff2600] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-[#ff2600] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-[#ff2600] rounded-full animate-bounce"></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-16 font-sans">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    to="/settings/collaborators"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">
                        {isEdit ? 'Modifier le collaborateur' : 'Ajouter un collaborateur'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {isEdit 
                            ? `Paramètres d'accès pour ${selectedProfile?.full_name || selectedProfile?.email}`
                            : 'Associez une personne et définissez ses droits d\'accès.'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl text-sm text-red-700 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* SECTION 1: Identité & Rôle */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-primary">●</span> Informations de Base
                        </h2>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email du collaborateur</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="email"
                                        disabled={isEdit || searchLoading}
                                        placeholder="collaborateur@email.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setSelectedProfile(null); // Invalidate check on type
                                            setSearchError('');
                                        }}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                        required
                                    />
                                    {selectedProfile && !isEdit && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-500">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                {!isEdit && (
                                    <button
                                        type="button"
                                        onClick={handleSearchProfile}
                                        disabled={searchLoading || !email}
                                        className="px-5 bg-black hover:bg-gray-900 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 min-w-[110px]"
                                    >
                                        {searchLoading ? (
                                            <Spinner size="xs" className="text-white" />
                                        ) : 'Vérifier'}
                                    </button>
                                )}
                            </div>

                            {searchError && (
                                <p className="text-xs text-red-500 mt-1.5 font-medium">{searchError}</p>
                            )}

                            {selectedProfile && !isEdit && (
                                <div className="mt-3 bg-emerald-50 text-emerald-800 text-xs px-4 py-2 rounded-xl border border-emerald-100 flex items-center justify-between">
                                    <span>Utilisateur trouvé : <strong>{selectedProfile.full_name || 'Sans Nom'}</strong></span>
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-50" />

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rôle Général</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className={`border rounded-xl p-4 cursor-pointer flex gap-3 relative overflow-hidden transition-all ${role === 'user' ? 'border-primary bg-primary/[0.02] ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="user"
                                        checked={role === 'user'}
                                        onChange={() => setRole('user')}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${role === 'user' ? 'border-primary' : 'border-gray-300'}`}>
                                        {role === 'user' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Collaborateur Standard</p>
                                        <p className="text-xs text-gray-500 mt-1">Accès personnalisable. Vous choisirez manuellement les sections et les annexes visibles ci-dessous.</p>
                                    </div>
                                </label>

                                <label className={`border rounded-xl p-4 cursor-pointer flex gap-3 relative overflow-hidden transition-all ${role === 'admin' ? 'border-primary bg-primary/[0.02] ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="admin"
                                        checked={role === 'admin'}
                                        onChange={() => setRole('admin')}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${role === 'admin' ? 'border-primary' : 'border-gray-300'}`}>
                                        {role === 'admin' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Administrateur</p>
                                        <p className="text-xs text-gray-500 mt-1">Accès complet. Peut gérer tout le contenu, les finances et paramétrer l'église (y compris inviter d'autres collaborateurs).</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Autorisations par Section */}
                {role === 'user' && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden animate-fadeIn">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">●</span> Accès aux Sections
                            </h2>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleToggleSelectAllSections(true)}
                                    className="text-xs text-primary hover:underline font-semibold"
                                >
                                    Tout Sélectionner
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    type="button"
                                    onClick={() => handleToggleSelectAllSections(false)}
                                    className="text-xs text-gray-500 hover:underline font-semibold"
                                >
                                    Tout Désélectionner
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-xs text-gray-500 mb-6">
                                Cochez chaque section à laquelle vous souhaitez que ce collaborateur ait accès. Les sections non cochées disparaîtront de son menu de navigation.
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {APPLICATION_SECTIONS.map((sec) => (
                                    <label 
                                        key={sec.key}
                                        onClick={() => handleToggleSection(sec.key)}
                                        className={`flex flex-col justify-between p-3.5 rounded-xl border cursor-pointer transition-all select-none min-h-[80px] ${sections[sec.key] 
                                            ? 'border-primary bg-primary/[0.02] ring-1 ring-primary/50 shadow-sm' 
                                            : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <span className={`text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${sections[sec.key] ? 'bg-primary/10 text-gray-900' : 'bg-gray-50 text-gray-400'}`}>
                                                {sec.category}
                                            </span>
                                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${sections[sec.key] ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                                                {sections[sec.key] && (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-gray-800 mt-3">{sec.label}</p>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* SECTION 3: Gestionnaire d'Annexes (DÉDIÉE) */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-primary">●</span> Section Dédiée : Gestionnaire d'Annexes
                        </h2>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* General annex manager Toggle */}
                        <div className="bg-indigo-50/40 border border-indigo-50 p-5 rounded-xl">
                            <label className="flex items-start gap-4 cursor-pointer">
                                <div className="relative mt-1 flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        checked={isGeneralManager}
                                        onChange={(e) => setIsGeneralManager(e.target.checked)}
                                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded-md focus:ring-indigo-500 cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-indigo-900">Responsable Général des Annexes</p>
                                    <p className="text-xs text-indigo-700 mt-1 font-medium">
                                        Cochez cette option si ce collaborateur doit gérer la TOTALITÉ de ce qui se passe dans TOUTES les annexes (existantes et futures) sans restriction.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Specific annexes list (Only visible if not general manager) */}
                        {!isGeneralManager && (
                            <div className="space-y-3 pt-2 animate-fadeIn">
                                <label className="block text-sm font-bold text-gray-800">Déléguer l'accès à des Annexes spécifiques</label>
                                <p className="text-xs text-gray-400 -mt-2 mb-4">Cochez les annexes précises que cet utilisateur doit superviser.</p>
                                
                                {allAnnexes.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {allAnnexes.map((annexe) => {
                                            const isChecked = managedAnnexIds.includes(annexe.id);
                                            return (
                                                <label
                                                    key={annexe.id}
                                                    onClick={() => handleToggleAnnex(annexe.id)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${isChecked
                                                        ? 'border-indigo-500 bg-indigo-50/10 text-indigo-900 font-bold shadow-[0_1px_4px_rgba(99,102,241,0.15)]'
                                                        : 'border-gray-100 bg-white hover:border-gray-200 text-gray-700'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
                                                        {isChecked && (
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs truncate">{annexe.name}</p>
                                                        <p className="text-[10px] text-gray-400 truncate">{annexe.pastor_name || 'Pas de pasteur renseigné'}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                        <p className="text-xs text-gray-500 italic">Aucune annexe n'a été créée dans cette église.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <Link
                        to="/settings/collaborators"
                        className="px-6 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={saving || !selectedProfile}
                        className="px-8 py-3 bg-primary text-black hover:bg-primary-dark rounded-xl text-sm font-bold shadow-md shadow-primary/10 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 min-h-[46px] min-w-[190px]"
                    >
                        {saving ? (
                            <Spinner size="sm" className="text-black" />
                        ) : isEdit ? 'Sauvegarder les changements' : 'Inviter le collaborateur'}
                    </button>
                </div>
            </form>
        </div>
    );
}
