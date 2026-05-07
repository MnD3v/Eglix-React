import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Icons = {
    Search: () => (
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    ChevronRight: () => (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
    User: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    Dollar: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Gift: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
    ),
    BookOpen: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    Group: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    Project: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    )
};

export default function SpotlightModal({ isOpen, onClose, churchId }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ members: [], groups: [], projects: [], journal: [] });
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);

    // Prevent background scroll and focus input
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = 'unset';
            setQuery('');
            setResults({ members: [], groups: [], projects: [], journal: [] });
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle global keydown for escape and arrow keys
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((prev) => (prev + 1) % Math.max(1, totalItemsCount));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((prev) => (prev - 1 + totalItemsCount) % Math.max(1, totalItemsCount));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleSelectItem(activeIndex);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, activeIndex, results, query]);

    // DB search logic (debounced)
    useEffect(() => {
        if (!isOpen || !churchId) return;
        if (!query.trim()) {
            setResults({ members: [], groups: [], projects: [], journal: [] });
            setActiveIndex(0);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setLoading(true);
            try {
                const searchStr = `%${query}%`;
                
                const [membersData, groupsData, projectsData, journalData] = await Promise.all([
                    supabase.from('members')
                        .select('id, first_name, last_name, email')
                        .eq('church_id', churchId)
                        .or(`first_name.ilike.${searchStr},last_name.ilike.${searchStr},email.ilike.${searchStr}`)
                        .limit(3)
                        .then(res => {
                            if (res.error) console.error("Members query error:", res.error);
                            return res.data || [];
                        })
                        .catch(err => { console.error("Members search catch:", err); return []; }),
                    supabase.from('groups')
                        .select('id, name, description')
                        .eq('church_id', churchId)
                        .or(`name.ilike.${searchStr},description.ilike.${searchStr}`)
                        .limit(3)
                        .then(res => {
                            if (res.error) console.error("Groups query error:", res.error);
                            return res.data || [];
                        })
                        .catch(err => { console.error("Groups search catch:", err); return []; }),
                    supabase.from('projects')
                        .select('id, name, status')
                        .eq('church_id', churchId)
                        .ilike('name', searchStr)
                        .limit(3)
                        .then(res => {
                            if (res.error) console.error("Projects query error:", res.error);
                            return res.data || [];
                        })
                        .catch(err => { console.error("Projects search catch:", err); return []; }),
                    supabase.from('journal_entries')
                        .select('id, title, category')
                        .eq('church_id', churchId)
                        .or(`title.ilike.${searchStr},category.ilike.${searchStr}`)
                        .limit(3)
                        .then(res => {
                            if (res.error) console.error("Journal query error:", res.error);
                            return res.data || [];
                        })
                        .catch(err => { console.error("Journal search catch:", err); return []; }),
                ]);

                setResults({
                    members: membersData,
                    groups: groupsData,
                    projects: projectsData,
                    journal: journalData
                });
                setActiveIndex(0);
            } catch (err) {
                console.error('Spotlight search error:', err);
            } finally {
                setLoading(false);
            }
        }, 200);

        return () => clearTimeout(delayDebounce);
    }, [query, isOpen, churchId]);

    if (!isOpen) return null;

    // Helper static shortcuts when query is empty
    const staticShortcuts = [
        { label: 'Ajouter un membre', sub: 'Communauté', url: '/members/new', type: 'shortcut', icon: <Icons.User /> },
        { label: 'Enregistrer une dîme', sub: 'Finances', url: '/tithes/new', type: 'shortcut', icon: <Icons.Dollar /> },
        { label: 'Ajouter une offrande', sub: 'Finances', url: '/offerings/new', type: 'shortcut', icon: <Icons.Gift /> },
        { label: 'Créer une entrée journal', sub: 'Journal', url: '/journal/new', type: 'shortcut', icon: <Icons.BookOpen /> }
    ];

    const hasQuery = query.trim().length > 0;

    const flatItems = hasQuery ? [
        ...results.members.map(m => ({ id: m.id, label: `${m.first_name} ${m.last_name}`, sub: m.email || 'Pas d\'email', url: '/members', type: 'membre', icon: <Icons.User /> })),
        ...results.groups.map(g => ({ id: g.id, label: g.name, sub: g.description || 'Pas de description', url: '/groups', type: 'groupe', icon: <Icons.Group /> })),
        ...results.projects.map(p => ({ id: p.id, label: p.name, sub: `Statut: ${p.status}`, url: '/projects', type: 'projet', icon: <Icons.Project /> })),
        ...results.journal.map(j => ({ id: j.id, label: j.title, sub: `Catégorie : ${j.category}`, url: `/journal/${j.id}`, type: 'journal', icon: <Icons.BookOpen /> }))
    ] : staticShortcuts;

    const totalItemsCount = flatItems.length;

    const handleSelectItem = (index) => {
        const item = flatItems[index];
        if (item) {
            navigate(item.url);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
            {/* Backdrop with elegant overlay blur */}
            <div 
                className="absolute inset-0 bg-[#0c111d]/40 backdrop-blur-[5px] transition-opacity duration-300 animate-fadeIn"
                onClick={onClose}
            />

            {/* Main spotlight container - Exact rounded corners and design from screenshot */}
            <div className="relative bg-white w-full max-w-[640px] rounded-[20px] shadow-2xl border-0 overflow-hidden transition-all duration-300 animate-scaleUp z-10 flex flex-col max-h-[65vh]">
                
                {/* Search Input Container - Padded and rounded grey input area */}
                <div className="p-5 pb-3">
                    <div className="relative flex items-center bg-[#f2f4f7] rounded-[14px] h-[52px] px-4">
                        <span className="text-gray-400 mr-3 flex-shrink-0">
                            <Icons.Search />
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Commencez à taper pour rechercher..."
                            className="w-full text-[15px] font-normal text-[#1d2939] placeholder-gray-400 focus:outline-none bg-transparent"
                        />
                        {loading && (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0 ml-3" />
                        )}
                    </div>
                </div>

                {/* Section Title (Actions rapides ⚡) */}
                <div className="px-5 pt-2">
                    <div className="text-xs font-semibold text-[#667085] flex items-center gap-1.5 px-1 mb-2">
                        {hasQuery ? 'Résultats de recherche' : 'Actions rapides'} ⚡
                    </div>
                </div>

                {/* Results / Shortcuts List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
                    {totalItemsCount === 0 && hasQuery && !loading ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] flex items-center justify-center text-xl mx-auto mb-3">🔍</div>
                            <h4 className="text-[14px] font-semibold text-[#1d2939]">Aucun résultat</h4>
                            <p className="text-xs text-[#667085] mt-1">Aucun élément ne correspond à "{query}".</p>
                        </div>
                    ) : (
                        flatItems.map((item, idx) => {
                            const isSelected = idx === activeIndex;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectItem(idx)}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    className={`w-full flex items-center justify-between py-3.5 px-4 rounded-[12px] text-left transition-all ${
                                        isSelected 
                                            ? 'bg-[#f8f9fa]' 
                                            : 'hover:bg-[#f8f9fa]/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        {/* Icon Container */}
                                        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors ${
                                            isSelected ? 'bg-black text-white' : 'bg-[#f2f4f7] text-[#344054]'
                                        }`}>
                                            {item.icon}
                                        </div>
                                        {/* Label Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[15px] font-medium text-[#1d2939] truncate">
                                                {item.label}
                                            </p>
                                            {item.sub && (
                                                <p className="text-xs text-[#667085] truncate mt-0.5">
                                                    {item.sub}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Chevron Right */}
                                    <div className="flex-shrink-0 ml-3">
                                        <Icons.ChevronRight />
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Soft Footer with 'Quitter esc' pill button */}
                <div className="border-t border-gray-100 p-4 bg-white flex justify-end items-center">
                    <button 
                        onClick={onClose}
                        className="border border-gray-200 rounded-[8px] py-1.5 px-3 text-xs text-[#344054] font-medium bg-white hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-1"
                    >
                        Quitter <span className="text-[10px] text-gray-400 font-bold bg-[#f2f4f7] px-1.5 py-0.5 rounded ml-0.5">esc</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
