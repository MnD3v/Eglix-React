import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { documentService } from '../../services/documentService';

export default function DocumentForm() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState(null);
    const [folders, setFolders] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [existingDoc, setExistingDoc] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        folder_id: '',
        is_public: false,
    });

    useEffect(() => {
        if (!currentChurch) return;
        documentService.getFolders(currentChurch.id).then(setFolders).catch(console.error);
        if (isEdit) {
            documentService.getById(id).then(doc => {
                setExistingDoc(doc);
                setFormData({
                    name: doc.name || '',
                    description: doc.description || '',
                    folder_id: doc.folder_id || '',
                    is_public: doc.is_public || false,
                });
                setFetchLoading(false);
            }).catch(err => {
                setError(err.message);
                setFetchLoading(false);
            });
        }
    }, [currentChurch, id, isEdit]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) { setSelectedFile(null); setPreviewUrl(null); return; }
        setSelectedFile(file);
        if (!formData.name) setFormData(f => ({ ...f, name: file.name.replace(/\.[^.]+$/, '') }));
        if (file.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEdit && !selectedFile) { setError('Veuillez sélectionner un fichier.'); return; }
        setLoading(true);
        setError(null);
        try {
            if (isEdit) {
                const updates = {
                    name: formData.name,
                    description: formData.description || null,
                    folder_id: formData.folder_id || null,
                    is_public: formData.is_public,
                };
                await documentService.update(id, updates);
            } else {
                await documentService.upload(
                    currentChurch.id,
                    formData.folder_id || null,
                    formData.name,
                    formData.description,
                    formData.is_public,
                    selectedFile
                );
            }
            navigate('/documents');
        } catch (err) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return (
        <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            {/* Back */}
            <div>
                <button
                    onClick={() => navigate('/documents')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mb-4 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour aux documents
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Modifier le document' : 'Nouveau document'}
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* File upload (create only) */}
                {!isEdit && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900">Fichier</h2>

                        {/* Drop zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                                }`}
                        >
                            {previewUrl ? (
                                <div className="space-y-2">
                                    <img src={previewUrl} alt="preview" className="max-h-40 rounded-lg mx-auto object-contain shadow" />
                                    <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : selectedFile ? (
                                <div className="space-y-2">
                                    <div className="flex justify-center">
                                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB · PDF</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex justify-center">
                                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700">Cliquez pour choisir un fichier</p>
                                    <p className="text-xs text-gray-400">Images (JPEG, PNG, WebP, GIF) ou PDF — 10 MB max</p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Existing file info (edit mode) */}
                {isEdit && existingDoc && (
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-gray-100">
                        <span className="flex items-center">
                            {existingDoc.file_type === 'image'
                                ? <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                : existingDoc.file_type === 'pdf'
                                    ? <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    : <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            }
                        </span>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Fichier actuel : {existingDoc.file_ext?.toUpperCase()}</p>
                            <p className="text-xs text-gray-400">Le fichier ne peut pas être modifié — recréez le document pour changer de fichier</p>
                        </div>
                        {existingDoc.file_url && (
                            <a href={existingDoc.file_url} target="_blank" rel="noopener noreferrer"
                                className="ml-auto text-xs text-primary underline">Voir</a>
                        )}
                    </div>
                )}

                {/* Info form */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <h2 className="font-semibold text-gray-900">Informations</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom du document <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Rapport annuel 2024"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dossier</label>
                        <select
                            name="folder_id"
                            value={formData.folder_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                        >
                            <option value="">Sans dossier</option>
                            {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        {folders.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Aucun dossier créé. Vous pouvez en créer depuis la liste des documents.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Description du contenu ou de l'objectif du document..."
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_public"
                            name="is_public"
                            checked={formData.is_public}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-primary"
                        />
                        <label htmlFor="is_public" className="text-sm text-gray-700">
                            Document public <span className="text-gray-400 text-xs">(accessible sans connexion)</span>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/documents')}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {isEdit ? 'Mise à jour...' : 'Téléversement...'}
                            </>
                        ) : (
                            isEdit ? 'Mettre à jour' : 'Téléverser'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
