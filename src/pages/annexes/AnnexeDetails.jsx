import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { annexeService } from '../../services/annexeService';
import Loader from '../../components/Loader';
import SlideOver from './SlideOver';
import AnnexeMemberForm from './forms/AnnexeMemberForm';
import AnnexeFinanceForm from './forms/AnnexeFinanceForm';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = a => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(a || 0);
const formatDate = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const PAYMENT_LABELS = { cash: 'Espèces', mobile: 'Mobile Money', bank: 'Virement', check: 'Chèque' };

// ─── Icons ────────────────────────────────────────────────────────────────────

const Ico = {
    Building: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Tithe: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Gift: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
    Heart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    Pencil: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    MapPin: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    User: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Search: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
};

const TABS = [
    { key: 'members',   label: 'Membres',   icon: Ico.Users,  addLabel: 'Ajouter un membre',   color: 'blue' },
    { key: 'tithes',    label: 'Dîmes',     icon: Ico.Tithe,  addLabel: 'Enregistrer une dîme', color: 'emerald' },
    { key: 'offerings', label: 'Offrandes', icon: Ico.Gift,   addLabel: 'Enregistrer une offrande', color: 'purple' },
    { key: 'donations', label: 'Dons',      icon: Ico.Heart,  addLabel: 'Enregistrer un don',   color: 'rose' },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function AnnexeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentChurch } = useChurch();

    const [annexe, setAnnexe] = useState(null);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('members');
    const [slideOpen, setSlideOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [a, s] = await Promise.all([annexeService.getById(id), annexeService.getStats(id)]);
            setAnnexe(a); setStats(s);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const handleSuccess = () => { setSlideOpen(false); setRefreshKey(k => k + 1); load(); };

    const currentTab = TABS.find(t => t.key === activeTab);

    if (loading) return <div className="flex justify-center py-20"><Loader /></div>;
    if (!annexe) return null;

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <button onClick={() => navigate('/annexes')} className="hover:text-black transition-colors">Annexes</button>
                <span>/</span>
                <span className="text-gray-900 font-medium">{annexe.name}</span>
            </div>

            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                        <Ico.Building />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{annexe.name}</h1>
                                <div className="flex flex-wrap gap-3 mt-1">
                                    {annexe.pastor_name && <span className="inline-flex items-center gap-1 text-sm text-gray-500"><Ico.User />{annexe.pastor_name}</span>}
                                    {annexe.address && <span className="inline-flex items-center gap-1 text-sm text-gray-500"><Ico.MapPin />{annexe.address}</span>}
                                </div>
                                {annexe.description && <p className="text-sm text-gray-500 mt-2 max-w-xl">{annexe.description}</p>}
                            </div>
                            <Link to={`/annexes/${id}/edit`} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-lg transition-all flex-shrink-0">
                                <Ico.Pencil /> Modifier
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                        {[
                            { label: 'Membres', value: stats.membersCount, color: 'bg-blue-50 text-blue-700' },
                            { label: 'Dîmes', value: formatCurrency(stats.tithesTotal), color: 'bg-emerald-50 text-emerald-700' },
                            { label: 'Offrandes', value: formatCurrency(stats.offeringsTotal), color: 'bg-purple-50 text-purple-700' },
                            { label: 'Dons', value: formatCurrency(stats.donationsTotal), color: 'bg-rose-50 text-rose-700' },
                        ].map(s => (
                            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                                <p className="text-xs font-medium uppercase tracking-wider opacity-70">{s.label}</p>
                                <p className="text-lg font-bold mt-1">{s.value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {/* Tab Bar */}
                <div className="flex items-center justify-between border-b border-gray-200 px-2 overflow-x-auto">
                    <div className="flex">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.key;
                            return (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${active ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                                    <Icon />{tab.label}
                                </button>
                            );
                        })}
                    </div>
                    {/* Add button in tab bar */}
                    <button onClick={() => setSlideOpen(true)}
                        className="flex items-center gap-1.5 text-sm font-semibold bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0 mr-2">
                        <Ico.Plus />{currentTab?.addLabel}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'members'   && <MembersTab   annexeId={id} key={`members-${refreshKey}`} />}
                    {activeTab === 'tithes'    && <FinanceTab   annexeId={id} type="tithes"    key={`tithes-${refreshKey}`} />}
                    {activeTab === 'offerings' && <FinanceTab   annexeId={id} type="offerings" key={`offerings-${refreshKey}`} />}
                    {activeTab === 'donations' && <FinanceTab   annexeId={id} type="donations" key={`donations-${refreshKey}`} />}
                </div>
            </div>

            {/* SlideOver */}
            <SlideOver isOpen={slideOpen} onClose={() => setSlideOpen(false)} title={currentTab?.addLabel}>
                {activeTab === 'members' && (
                    <AnnexeMemberForm churchId={currentChurch?.id} annexeId={parseInt(id)} onSuccess={handleSuccess} onCancel={() => setSlideOpen(false)} />
                )}
                {activeTab !== 'members' && (
                    <AnnexeFinanceForm
                        type={activeTab === 'tithes' ? 'tithe' : activeTab === 'offerings' ? 'offering' : 'donation'}
                        churchId={currentChurch?.id}
                        annexeId={parseInt(id)}
                        onSuccess={handleSuccess}
                        onCancel={() => setSlideOpen(false)}
                    />
                )}
            </SlideOver>
        </div>
    );
}

// ─── MEMBERS TAB ─────────────────────────────────────────────────────────────

function MembersTab({ annexeId }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        annexeService.getMembers(annexeId, { search }).then(r => setData(r.data || [])).finally(() => setLoading(false));
    }, [annexeId, search]);

    if (loading) return <div className="flex justify-center py-8"><Loader /></div>;

    return (
        <TabShell search={search} onSearch={setSearch} placeholder="Rechercher un membre..." count={data.length} empty="Aucun membre dans cette annexe. Cliquez sur « Ajouter un membre » pour commencer.">
            <div className="space-y-1">
                {data.map(m => (
                    <div key={m.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {m.first_name?.[0]}{m.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{m.first_name} {m.last_name}</p>
                            <p className="text-xs text-gray-400">{m.phone || m.email || '—'}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {m.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                    </div>
                ))}
            </div>
        </TabShell>
    );
}

// ─── FINANCE TAB ─────────────────────────────────────────────────────────────

function FinanceTab({ annexeId, type }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const colorMap = { tithes: 'bg-emerald-50 text-emerald-700', offerings: 'bg-purple-50 text-purple-700', donations: 'bg-rose-50 text-rose-700' };
    const emptyMap = { tithes: 'Aucune dîme enregistrée.', offerings: 'Aucune offrande enregistrée.', donations: 'Aucun don enregistré.' };
    const fetcher = { tithes: annexeService.getTithes, offerings: annexeService.getOfferings, donations: annexeService.getDonations };

    useEffect(() => {
        fetcher[type].call(annexeService, annexeId, { search }).then(r => setData(r.data || [])).finally(() => setLoading(false));
    }, [annexeId, type, search]);

    const getName = row => {
        if (row.members) return `${row.members.first_name} ${row.members.last_name}`;
        if (row.donor_name) return row.donor_name;
        if (row.offering_types?.name) return row.offering_types.name;
        return 'Anonyme';
    };

    const getDate = row => formatDate(row.date || row.received_at);

    if (loading) return <div className="flex justify-center py-8"><Loader /></div>;

    return (
        <TabShell search={search} onSearch={setSearch} placeholder="Rechercher..." count={data.length} empty={emptyMap[type]}>
            <div className="space-y-1">
                {data.map(row => (
                    <div key={row.id} className="flex items-center justify-between gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{getName(row)}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-400">{getDate(row)}</span>
                                {row.payment_method && <span className="text-xs text-gray-400">· {PAYMENT_LABELS[row.payment_method] || row.payment_method}</span>}
                                {row.description && <span className="text-xs text-gray-400 truncate">· {row.description}</span>}
                            </div>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1 rounded-lg flex-shrink-0 ${colorMap[type]}`}>
                            {formatCurrency(row.amount)}
                        </span>
                    </div>
                ))}
            </div>
        </TabShell>
    );
}

// ─── TabShell ─────────────────────────────────────────────────────────────────

function TabShell({ search, onSearch, placeholder, count, empty, children }) {
    return (
        <div className="space-y-4">
            <div className="relative max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Ico.Search /></span>
                <input type="text" value={search} onChange={e => onSearch(e.target.value)} placeholder={placeholder}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all" />
            </div>
            <p className="text-xs text-gray-400 font-medium">{count} résultat{count !== 1 ? 's' : ''}</p>
            {count === 0
                ? <div className="text-center py-12 text-gray-400 text-sm">{empty}</div>
                : children}
        </div>
    );
}
