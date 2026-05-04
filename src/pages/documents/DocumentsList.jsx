import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { documentService } from '../../services/documentService';

function FileIcon({ type, ext }) {
    if (type === 'image') return (
        <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
    );
    if (type === 'pdf') return (
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        </div>
    );
    return (
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>
    );
}

function formatSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function DocumentsList() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [folders, setFolders] = useState([]);
    const [stats, setStats] = useState({ total: 0, images: 0, pdfs: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ folder_id: '', file_type: '', search: '' });
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [folderSaving, setFolderSaving] = useState(false);

    const fetchAll = async () => {
        if (!currentChurch) return;
        setLoading(true);
        try {
            const [{ data }, foldersData, statsData] = await Promise.all([
                documentService.getAll(currentChurch.id, filters),
                documentService.getFolders(currentChurch.id),
                documentService.getStats(currentChurch.id),
            ]);
            setDocuments(data);
            setFolders(foldersData);
            setStats(statsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, [currentChurch, filters]);

    const handleDelete = async (doc) => {
        if (!window.confirm(`Supprimer "${doc.name}" ?`)) return;
        try {
            await documentService.delete(doc.id);
            fetchAll();
        } catch (err) {
            alert('Erreur : ' + err.message);
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!folderName.trim()) return;
        setFolderSaving(true);
        try {
            await documentService.createFolder({ name: folderName.trim(), church_id: currentChurch.id });
            setFolderName('');
            setShowFolderModal(false);
            fetchAll();
        } catch (err) {
            alert('Erreur : ' + err.message);
        } finally {
            setFolderSaving(false);
        }
    };

    const handleDeleteFolder = async (folder) => {
        if (!window.confirm(`Supprimer le dossier "${folder.name}" ? Les documents à l'intérieur ne seront pas supprimés.`)) return;
        try {
            await documentService.deleteFolder(folder.id);
            fetchAll();
        } catch (err) {
            alert('Erreur : ' + err.message);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                    <p className="text-gray-500 mt-1">Gérez et organisez vos fichiers</p>
                </div>
                <Link
                    to="/documents/new"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-dark shadow-sm transition-all self-start sm:self-auto"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau document
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Dossiers', value: folders.length, color: 'bg-blue-50 text-blue-600', icon: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        ), filterKey: null
                    },
                    {
                        label: 'Total Documents', value: stats.total, color: 'bg-amber-50 text-amber-600', icon: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        ), filterKey: null
                    },
                    {
                        label: 'Images', value: stats.images, color: 'bg-pink-50 text-pink-600', icon: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        ), filterKey: 'image'
                    },
                    {
                        label: 'PDFs', value: stats.pdfs, color: 'bg-red-50 text-red-600', icon: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        ), filterKey: 'pdf'
                    },
                ].map((stat) => (
                    <button
                        key={stat.label}
                        onClick={() => stat.filterKey !== null && setFilters(f => ({ ...f, file_type: f.file_type === stat.filterKey ? '' : stat.filterKey }))}
                        className={`${stat.color} rounded-2xl p-4 text-left transition-all hover:shadow-md ${stat.filterKey && filters.file_type === stat.filterKey ? 'ring-2 ring-offset-1' : ''
                            }`}
                    >
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className="text-2xl font-bold leading-tight">{loading ? '…' : stat.value}</div>
                        <div className="text-xs font-medium opacity-70 mt-0.5">{stat.label}</div>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Recherche</label>
                        <input
                            type="text"
                            placeholder="Nom du document..."
                            value={filters.search}
                            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div className="min-w-[160px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Dossier</label>
                        <select
                            value={filters.folder_id}
                            onChange={e => setFilters(f => ({ ...f, folder_id: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                        >
                            <option value="">Tous les dossiers</option>
                            {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div className="min-w-[130px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                        <select
                            value={filters.file_type}
                            onChange={e => setFilters(f => ({ ...f, file_type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                        >
                            <option value="">Tous les types</option>
                            <option value="image">Images</option>
                            <option value="pdf">PDFs</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setShowFolderModal(true)}
                        className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        Gérer dossiers
                    </button>
                    {(filters.search || filters.folder_id || filters.file_type) && (
                        <button
                            onClick={() => setFilters({ folder_id: '', file_type: '', search: '' })}
                            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* Documents list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun document</h3>
                        <p className="text-gray-500 text-sm mb-4">Commencez par téléverser votre premier document.</p>
                        <Link to="/documents/new" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-all shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nouveau document
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors">
                                {/* Thumbnail or icon */}
                                {doc.file_type === 'image' && doc.file_url ? (
                                    <img
                                        src={doc.file_url}
                                        alt={doc.name}
                                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100"
                                    />
                                ) : (
                                    <FileIcon type={doc.file_type} ext={doc.file_ext} />
                                )}
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{doc.name}</p>
                                    <div className="flex items-center flex-wrap gap-3 mt-0.5">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                            {doc.document_folders?.name || 'Sans dossier'}
                                        </span>
                                        <span className="text-xs text-gray-400">{formatSize(doc.file_size)}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(doc.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </span>
                                        {doc.is_public && (
                                            <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-md font-medium">Public</span>
                                        )}
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {doc.file_url && (
                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Ouvrir"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    )}
                                    <button
                                        onClick={() => navigate(`/documents/${doc.id}/edit`)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                        title="Modifier"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Supprimer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Folder management modal */}
            {showFolderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={e => e.target === e.currentTarget && setShowFolderModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Gestion des dossiers</h2>
                            <button onClick={() => setShowFolderModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Create folder form */}
                        <form onSubmit={handleCreateFolder} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nom du nouveau dossier..."
                                value={folderName}
                                onChange={e => setFolderName(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            <button
                                type="submit"
                                disabled={folderSaving || !folderName.trim()}
                                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-all"
                            >
                                {folderSaving ? '…' : 'Créer'}
                            </button>
                        </form>

                        {/* Existing folders */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {folders.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">Aucun dossier créé</p>
                            ) : folders.map(folder => (
                                <div key={folder.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <svg className="w-5 h-5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 4H4c-1.11 0-2 .89-2 2v12a2 2 0 002 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
                                    </svg>
                                    <span className="flex-1 text-sm font-medium text-gray-700">{folder.name}</span>
                                    <button
                                        onClick={() => handleDeleteFolder(folder)}
                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
