import React, { useState, useEffect } from 'react';
import { offeringService } from '../../services/offeringService';

export default function OfferingTypesModal({ isOpen, onClose, churchId }) {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newType, setNewType] = useState('');
    const [editingType, setEditingType] = useState(null);

    const loadTypes = async () => {
        if (!churchId) return;
        try {
            setLoading(true);
            const data = await offeringService.getTypes(churchId);
            setTypes(data);
        } catch (error) {
            console.error("Erreur lors du chargement des types:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && churchId) {
            loadTypes();
            setNewType('');
            setEditingType(null);
        }
    }, [isOpen, churchId]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newType.trim()) return;

        try {
            await offeringService.createType({
                name: newType.trim(),
                church_id: churchId
            });
            setNewType('');
            loadTypes();
        } catch (error) {
            console.error("Erreur lors de l'ajout:", error);
            alert("Erreur lors de la création du type");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingType || !editingType.name.trim()) return;

        try {
            await offeringService.updateType(editingType.id, editingType.name.trim());
            setEditingType(null);
            loadTypes();
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            alert("Erreur lors de la mise à jour du type");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce type d'offrande ?")) return;

        try {
            await offeringService.deleteType(id);
            loadTypes();
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            alert("Ce type est probablement utilisé par des offrandes existantes et ne peut pas être supprimé.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Types d'offrande</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Formulaire d'ajout */}
                    <form onSubmit={handleAdd} className="mb-6 flex gap-2">
                        <input
                            type="text"
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            placeholder="Nouveau type..."
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!newType.trim()}
                            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            Ajouter
                        </button>
                    </form>

                    {/* Liste des types */}
                    {loading ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Chargement...</div>
                    ) : types.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm italic">Aucun type d'offrande créé.</div>
                    ) : (
                        <div className="space-y-2">
                            {types.map((type) => (
                                <div key={type.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl group">
                                    {editingType?.id === type.id ? (
                                        <form onSubmit={handleUpdate} className="flex-1 flex gap-2 mr-2">
                                            <input
                                                type="text"
                                                autoFocus
                                                value={editingType.name}
                                                onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                                                className="flex-1 px-3 py-1.5 rounded-xl border border-primary/30 ring-2 ring-primary/10 text-sm"
                                            />
                                            <button type="submit" className="p-1.5 text-primary hover:bg-primary/10 rounded-xl">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                            <button type="button" onClick={() => setEditingType(null)} className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-xl">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </form>
                                    ) : (
                                        <>
                                            <span className="text-sm font-medium text-gray-700">{type.name}</span>
                                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingType(type)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(type.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
