import { useState, useEffect } from 'react';

export default function MemberSelectorModal({ isOpen, onClose, onSelect, members }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMembers, setFilteredMembers] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setFilteredMembers(members);
        }
    }, [isOpen, members]);

    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = members.filter(member =>
            member.first_name.toLowerCase().includes(lowerSearch) ||
            member.last_name.toLowerCase().includes(lowerSearch)
        );
        setFilteredMembers(filtered);
    }, [searchTerm, members]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Background overlay */}
            <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"
                aria-hidden="true"
                onClick={onClose}
            ></div>

            {/* Modal positioning container */}
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                {/* Modal panel */}
                <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="w-full">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4" id="modal-title">
                                Sélectionner un membre
                            </h3>

                            {/* Search Input */}
                            <div className="relative mb-4">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Rechercher un membre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {/* Members List */}
                            <div className="mt-2 max-h-60 overflow-y-auto">
                                {filteredMembers.length > 0 ? (
                                    <ul className="divide-y divide-gray-100">
                                        {filteredMembers.map((member) => (
                                            <li
                                                key={member.id}
                                                onClick={() => {
                                                    onSelect(member);
                                                    onClose();
                                                }}
                                                className="py-3 px-2 hover:bg-gray-50 cursor-pointer rounded-xl flex items-center gap-3 transition-colors"
                                            >
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {member.first_name[0]}{member.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{member.first_name} {member.last_name}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">Aucun membre trouvé.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
