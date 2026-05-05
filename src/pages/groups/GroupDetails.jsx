import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import { memberService } from '../../services/memberService';
import { useChurch } from '../../context/ChurchContext';
import ConfirmModal from '../../components/ConfirmModal';
import Loader from '../../components/Loader';

const PERMISSIONS_LABELS = {
    can_view: 'Voir les membres',
    can_add: 'Ajouter des membres',
    can_remove: 'Retirer des membres',
    can_edit: 'Modifier les membres',
};

export default function GroupDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentChurch } = useChurch();

    const [group, setGroup] = useState(null);
    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [addMemberModal, setAddMemberModal] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [selectedRole, setSelectedRole] = useState('member');
    const [addingMember, setAddingMember] = useState(false);

    const [removeModal, setRemoveModal] = useState({ open: false, groupMember: null });
    const [permissionsModal, setPermissionsModal] = useState({ open: false, leader: null });
    const [tempPermissions, setTempPermissions] = useState({});
    const [savingPermissions, setSavingPermissions] = useState(false);

    const loadData = useCallback(async () => {
        if (!currentChurch) return;
        try {
            setLoading(true);
            const [groupData, membersData] = await Promise.all([
                groupService.getById(id),
                memberService.getAll(currentChurch.id)
            ]);
            setGroup(groupData);
            setAllMembers(membersData.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id, currentChurch]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const groupMemberIds = group?.group_members?.map(gm => gm.member_id) || [];
    const availableMembers = allMembers.filter(m => !groupMemberIds.includes(m.id));

    const leaders = group?.group_members?.filter(gm => gm.role === 'leader') || [];
    const regularMembers = group?.group_members?.filter(gm => gm.role === 'member') || [];

    const handleAddMember = async () => {
        if (!selectedMemberId) return;
        try {
            setAddingMember(true);
            await groupService.addMember(parseInt(id), parseInt(selectedMemberId), selectedRole);
            await loadData();
            setSelectedMemberId('');
            setSelectedRole('member');
            setAddMemberModal(false);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l\'ajout');
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveMember = async () => {
        if (!removeModal.groupMember) return;
        try {
            await groupService.removeMember(parseInt(id), removeModal.groupMember.member_id);
            await loadData();
        } catch (err) {
            console.error(err);
            alert('Erreur lors du retrait');
        } finally {
            setRemoveModal({ open: false, groupMember: null });
        }
    };

    const openPermissionsModal = async (leader) => {
        // Charger les permissions actuelles
        try {
            const perms = await groupService.getPermissions(parseInt(id));
            const leaderPerms = perms.find(p => p.member_id === leader.member_id);
            setTempPermissions(leaderPerms || {
                can_view: true,
                can_add: false,
                can_remove: false,
                can_edit: false
            });
        } catch {
            setTempPermissions({ can_view: true, can_add: false, can_remove: false, can_edit: false });
        }
        setPermissionsModal({ open: true, leader });
    };

    const handleSavePermissions = async () => {
        if (!permissionsModal.leader) return;
        try {
            setSavingPermissions(true);
            await groupService.setPermissions(
                parseInt(id),
                permissionsModal.leader.member_id,
                {
                    can_view: tempPermissions.can_view ?? true,
                    can_add: tempPermissions.can_add ?? false,
                    can_remove: tempPermissions.can_remove ?? false,
                    can_edit: tempPermissions.can_edit ?? false,
                }
            );
            setPermissionsModal({ open: false, leader: null });
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la sauvegarde des permissions');
        } finally {
            setSavingPermissions(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader /></div>;
    if (!group) return <div className="text-center py-20 text-gray-500">Groupe introuvable</div>;

    const MemberRow = ({ gm, isLeader }) => (
        <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
            <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                {gm.members?.photo_url ? (
                    <img src={gm.members.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-semibold">
                        {gm.members?.first_name?.[0]}{gm.members?.last_name?.[0]}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                    {gm.members?.first_name} {gm.members?.last_name}
                </p>
                {gm.members?.function && (
                    <p className="text-xs text-gray-400 truncate">{gm.members.function}</p>
                )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {isLeader && (
                    <button
                        onClick={() => openPermissionsModal(gm)}
                        className="text-xs px-2.5 py-1 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                        Permissions
                    </button>
                )}
                <button
                    onClick={() => setRemoveModal({ open: true, groupMember: gm })}
                    className="p-1.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <button
                        onClick={() => navigate('/groups')}
                        className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour aux groupes
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                        {group.group_types && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                                {group.group_types.name}
                            </span>
                        )}
                    </div>
                    {group.description && (
                        <p className="text-gray-500 mt-1">{group.description}</p>
                    )}
                </div>
                <button
                    onClick={() => navigate(`/groups/${id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Modifier
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Responsables */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900">
                            Responsables
                            <span className="ml-2 text-sm font-normal text-gray-400">({leaders.length})</span>
                        </h2>
                        <button
                            onClick={() => { setSelectedRole('leader'); setAddMemberModal(true); }}
                            className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium"
                        >
                            + Ajouter
                        </button>
                    </div>
                    {leaders.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">Aucun responsable</p>
                    ) : (
                        leaders.map(gm => <MemberRow key={gm.id} gm={gm} isLeader={true} />)
                    )}
                </div>

                {/* Membres */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900">
                            Membres
                            <span className="ml-2 text-sm font-normal text-gray-400">({regularMembers.length})</span>
                        </h2>
                        <button
                            onClick={() => { setSelectedRole('member'); setAddMemberModal(true); }}
                            className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium"
                        >
                            + Ajouter
                        </button>
                    </div>
                    {regularMembers.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">Aucun membre</p>
                    ) : (
                        regularMembers.map(gm => <MemberRow key={gm.id} gm={gm} isLeader={false} />)
                    )}
                </div>
            </div>

            {/* Modal — Ajouter un membre */}
            {addMemberModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setAddMemberModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Ajouter un {selectedRole === 'leader' ? 'responsable' : 'membre'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Membre</label>
                                <select
                                    value={selectedMemberId}
                                    onChange={e => setSelectedMemberId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="">Sélectionner un membre...</option>
                                    {availableMembers.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.first_name} {m.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle dans le groupe</label>
                                <select
                                    value={selectedRole}
                                    onChange={e => setSelectedRole(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="member">Membre</option>
                                    <option value="leader">Responsable</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setAddMemberModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddMember}
                                disabled={!selectedMemberId || addingMember}
                                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-all"
                            >
                                {addingMember ? 'Ajout...' : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal — Permissions */}
            {permissionsModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setPermissionsModal({ open: false, leader: null })} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Permissions du responsable</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            {permissionsModal.leader?.members?.first_name} {permissionsModal.leader?.members?.last_name}
                        </p>
                        <div className="space-y-3">
                            {Object.entries(PERMISSIONS_LABELS).map(([key, label]) => (
                                <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                                    <span className="text-sm text-gray-700">{label}</span>
                                    <input
                                        type="checkbox"
                                        checked={tempPermissions[key] ?? false}
                                        onChange={e => setTempPermissions(prev => ({ ...prev, [key]: e.target.checked }))}
                                        className="w-4 h-4 rounded accent-gray-900"
                                    />
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setPermissionsModal({ open: false, leader: null })}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSavePermissions}
                                disabled={savingPermissions}
                                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-all"
                            >
                                {savingPermissions ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal — Retirer un membre */}
            <ConfirmModal
                isOpen={removeModal.open}
                onClose={() => setRemoveModal({ open: false, groupMember: null })}
                onConfirm={handleRemoveMember}
                title="Retirer du groupe"
                message={`Êtes-vous sûr de vouloir retirer ${removeModal.groupMember?.members?.first_name} ${removeModal.groupMember?.members?.last_name} de ce groupe ?`}
                confirmText="Retirer"
            />
        </div>
    );
}
