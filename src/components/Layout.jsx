import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChurch } from '../context/ChurchContext';
import { useNotification } from '../context/NotificationContext';
import ChurchSwitcherModal from './ChurchSwitcherModal';
import SpotlightModal from './SpotlightModal';

// Icons components for cleaner usage
const Icons = {
    Home: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    Users: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    UserAdd: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    ),
    Money: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Tithe: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    Gift: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
    ),
    Project: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    Settings: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    SignOut: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    Menu: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
    Close: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Search: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    Bell: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    ),
    Grid: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ),
    Group: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    Expense: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ),
    Donation: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ),
    Journal: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    Reports: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    AdminBoard: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Documents: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    ),
    ChevronDown: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    DoubleChevron: () => (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
    ),
    Annexe: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    Plus: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    User: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    )
};

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { currentChurch, userRole, userPermissions } = useChurch();
    const { confirm } = useNotification();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isChurchModalOpen, setIsChurchModalOpen] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSpotlightOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isFinanceActive = location.pathname.startsWith('/tithes') || 
                            location.pathname.startsWith('/offerings') || 
                            location.pathname.startsWith('/donations') ||
                            location.pathname.startsWith('/expenses');
    const [isFinancesOpen, setIsFinancesOpen] = useState(isFinanceActive);

    const isCommunityActive = location.pathname.startsWith('/members') || 
                              location.pathname.startsWith('/groups') || 
                              location.pathname.startsWith('/guests');
    const [isCommunityOpen, setIsCommunityOpen] = useState(isCommunityActive);

    const userName = user?.email?.split('@')[0] || 'Utilisateur';
    const userEmail = user?.email || '';

    // Permissions checking logic
    const isAdmin = userRole === 'owner' || userRole === 'admin';

    const hasSectionAccess = (section) => {
        if (isAdmin) return true;
        // Always give access to main dashboard and settings
        if (section === 'home' || section === 'settings') return true;
        
        const sections = userPermissions?.sections || {};
        return !!sections[section];
    };

    const hasAnnexAccess = () => {
        if (isAdmin) return true;
        const annexesPerms = userPermissions?.annexes;
        return !!(annexesPerms?.is_general_manager || (annexesPerms?.managed_annex_ids && annexesPerms.managed_annex_ids.length > 0));
    };

    const rawNavigation = [
        { name: 'Accueil', href: '/', icon: Icons.Home, key: 'home' },
        { 
            name: 'Communauté', 
            icon: Icons.Users,
            key: 'community',
            submenu: [
                { name: 'Membres', href: '/members', icon: Icons.Users, key: 'members' },
                { name: 'Groupes', href: '/groups', icon: Icons.Group, key: 'groups' },
                { name: 'Invités', href: '/guests', icon: Icons.UserAdd, key: 'guests' },
            ].filter(sub => hasSectionAccess(sub.key))
        },
        { name: 'Annexes', href: '/annexes', icon: Icons.Annexe, key: 'annexes' },
        { 
            name: 'Finances', 
            icon: Icons.Money,
            key: 'finances',
            submenu: [
                { name: 'Dîmes', href: '/tithes', icon: Icons.Tithe, key: 'tithes' },
                { name: 'Offrandes', href: '/offerings', icon: Icons.Gift, key: 'offerings' },
                { name: 'Dons', href: '/donations', icon: Icons.Donation, key: 'donations' },
                { name: 'Dépenses', href: '/expenses', icon: Icons.Expense, key: 'expenses' },
            ].filter(sub => hasSectionAccess(sub.key))
        },
        { name: 'Projets', href: '/projects', icon: Icons.Project, key: 'projects' },
        { name: 'Journal', href: '/journal', icon: Icons.Journal, key: 'journal' },
        { name: 'Administration', href: '/administration', icon: Icons.AdminBoard, key: 'administration' },
        { name: 'Documents', href: '/documents', icon: Icons.Documents, key: 'documents' },
        { name: 'Paramètres', href: '/settings', icon: Icons.Settings, key: 'settings' },
    ];

    // Filter out top-level items user doesn't have access to
    const navigation = rawNavigation.filter(item => {
        if (item.key === 'annexes') return hasAnnexAccess();
        if (item.submenu) {
            // Only show groups like Communauté or Finances if they have at least one accessible child
            return item.submenu.length > 0;
        }
        return hasSectionAccess(item.key);
    });

    // Check if user can add anything to show/hide the Quick Add (+) button
    const hasAnyAddPermission = isAdmin || [
        'members', 'tithes', 'offerings', 'donations', 'expenses', 'projects', 'journal'
    ].some(key => hasSectionAccess(key));

    const handleSignOut = async () => {
        setIsUserMenuOpen(false);
        const ok = await confirm({
            title: 'Déconnexion',
            message: 'Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre espace.',
            confirmText: 'Se déconnecter',
            cancelText: 'Annuler',
            type: 'warning'
        });
        if (!ok) return;

        try {
            await signOut();
        } catch (err) {
            console.error("Erreur lors de la déconnexion:", err);
        } finally {
            // Toujours rediriger vers login pour assurer une bonne expérience utilisateur
            navigate('/login');
        }
    };

    const ChurchSwitcher = () => (
        <div className="mb-5">
            <button
                onClick={() => setIsChurchModalOpen(true)}
                className="w-full flex items-center justify-between gap-3 p-2.5 rounded-[14px] bg-[#f8f9fa] border border-gray-100 hover:bg-gray-100/50 hover:border-gray-200 transition-all group"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        {currentChurch?.logo_url ? (
                            <img src={currentChurch.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <span className="font-bold text-lg">{currentChurch?.name?.[0]?.toUpperCase() || 'E'}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-[14px] font-semibold text-gray-900 truncate">{currentChurch?.name || 'Sélectionner'}</p>
                    </div>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 flex-shrink-0 pr-1">
                    <Icons.DoubleChevron />
                </div>
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <img src="/images/eglix-black.png" alt="Eglix Logo" className="h-8 w-auto" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                    <ChurchSwitcher />

                    {navigation.map((item) => {
                        const Icon = item.icon;
                        if (item.submenu) {
                            const isSubActive = item.submenu.some(sub => location.pathname.startsWith(sub.href));
                            const isOpen = item.name === 'Finances' ? isFinancesOpen : isCommunityOpen;
                            const toggleOpen = () => item.name === 'Finances' ? setIsFinancesOpen(!isFinancesOpen) : setIsCommunityOpen(!isCommunityOpen);
                            return (
                                <div key={item.name} className="space-y-1">
                                    <button
                                        onClick={toggleOpen}
                                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${isSubActive
                                            ? 'bg-gray-100 text-gray-900 font-bold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon />
                                            <span>{item.name}</span>
                                        </div>
                                        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                            <Icons.ChevronDown />
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="pl-6 space-y-1 transition-all">
                                            {item.submenu.map((sub) => {
                                                const SubIcon = sub.icon;
                                                const isSubItemActive = location.pathname.startsWith(sub.href);
                                                return (
                                                    <Link
                                                        key={sub.name}
                                                        to={sub.href}
                                                        className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${isSubItemActive
                                                            ? 'bg-gray-100 text-gray-900 font-bold'
                                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        <SubIcon />
                                                        <span>{sub.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        const isActive = location.pathname === item.href ||
                            (item.href !== '/' && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${isActive
                                    ? 'bg-gray-100 text-gray-900 font-semibold'
                                    : 'text-[#344054] hover:bg-gray-50 hover:text-gray-950'
                                    }`}
                            >
                                <Icon />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <img src="/images/eglix-black.png" alt="Eglix Logo" className="h-8 w-auto" />
                    <button onClick={() => setIsSidebarOpen(false)}>
                        <Icons.Close />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                    <ChurchSwitcher />

                    <div className="my-4 border-t border-gray-100"></div>

                    {navigation.map((item) => {
                        const Icon = item.icon;
                        if (item.submenu) {
                            const isSubActive = item.submenu.some(sub => location.pathname.startsWith(sub.href));
                            const isOpen = item.name === 'Finances' ? isFinancesOpen : isCommunityOpen;
                            const toggleOpen = () => item.name === 'Finances' ? setIsFinancesOpen(!isFinancesOpen) : setIsCommunityOpen(!isCommunityOpen);
                            return (
                                <div key={item.name} className="space-y-1">
                                    <button
                                        onClick={toggleOpen}
                                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${isSubActive
                                            ? 'bg-gray-50 text-gray-900 font-bold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon />
                                            <span>{item.name}</span>
                                        </div>
                                        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                            <Icons.ChevronDown />
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="pl-6 space-y-1 transition-all">
                                            {item.submenu.map((sub) => {
                                                const SubIcon = sub.icon;
                                                const isSubItemActive = location.pathname.startsWith(sub.href);
                                                return (
                                                    <Link
                                                        key={sub.name}
                                                        to={sub.href}
                                                        onClick={() => setIsSidebarOpen(false)}
                                                        className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${isSubItemActive
                                                            ? 'bg-gray-100 text-gray-900 font-bold'
                                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        <SubIcon />
                                                        <span>{sub.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        const isActive = location.pathname === item.href ||
                            (item.href !== '/' && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${isActive
                                    ? 'bg-gray-100 text-gray-900 font-semibold'
                                    : 'text-[#344054] hover:bg-gray-50 hover:text-gray-950'
                                    }`}
                            >
                                <Icon />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 md:left-64 z-30">
                    <div className="h-full px-4 md:px-8 flex items-center justify-between">
                        {/* Mobile Menu & Search Buttons */}
                        <div className="flex items-center gap-2 md:hidden">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
                                title="Menu"
                            >
                                <Icons.Menu />
                            </button>
                            <button
                                onClick={() => setIsSpotlightOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
                                title="Rechercher"
                            >
                                <Icons.Search />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-xl mx-auto hidden md:block px-4">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Icons.Search />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Trouvez n'importe quoi : Appuyez sur ⌘K sur votre clavier"
                                    onClick={() => setIsSpotlightOpen(true)}
                                    readOnly
                                    className="w-full pl-12 pr-4 py-2 bg-gray-100/50 border border-transparent rounded-full text-sm cursor-pointer hover:bg-gray-100 transition-all placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Top Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Add Shortcut Menu */}
                            {hasAnyAddPermission && (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                                        className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                        <Icons.Plus />
                                    </button>

                                    {isAddMenuOpen && (
                                        <>
                                            {/* Overlay to close menu */}
                                            <div className="fixed inset-0 z-40" onClick={() => setIsAddMenuOpen(false)} />
                                            
                                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                                <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ajouter un élément</p>
                                                </div>
                                                <div className="p-2 space-y-0.5">
                                                    {hasSectionAccess('members') && (
                                                        <Link
                                                            to="/members/new"
                                                            onClick={() => setIsAddMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="text-blue-500"><Icons.Users /></span>
                                                            <span>Membre</span>
                                                        </Link>
                                                    )}
                                                    {hasSectionAccess('tithes') && (
                                                        <Link
                                                            to="/tithes/new"
                                                            onClick={() => setIsAddMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="text-emerald-500"><Icons.Tithe /></span>
                                                            <span>Dîme</span>
                                                        </Link>
                                                    )}
                                                    {hasSectionAccess('offerings') && (
                                                        <Link
                                                            to="/offerings/new"
                                                            onClick={() => setIsAddMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="text-purple-500"><Icons.Gift /></span>
                                                            <span>Offrande</span>
                                                        </Link>
                                                    )}
                                                    {hasSectionAccess('donations') && (
                                                        <Link
                                                            to="/donations/new"
                                                            onClick={() => setIsAddMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="text-pink-500"><Icons.Donation /></span>
                                                            <span>Don</span>
                                                        </Link>
                                                    )}
                                                    {hasSectionAccess('expenses') && (
                                                        <Link
                                                            to="/expenses/new"
                                                            onClick={() => setIsAddMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="text-rose-500"><Icons.Expense /></span>
                                                            <span>Dépense</span>
                                                        </Link>
                                                    )}
                                                    {hasSectionAccess('projects') && (
                                                        <Link
                                                            to="/projects/new"
                                                            onClick={() => setIsAddMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="text-amber-500"><Icons.Project /></span>
                                                            <span>Projet</span>
                                                        </Link>
                                                    )}
                                                    {hasSectionAccess('journal') && (
                                                        <Link
                                                            to="/journal/new"
                                                            onClick={() => setIsAddMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="text-indigo-500"><Icons.Journal /></span>
                                                            <span>Entrée Journal</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}


                            {/* User Menu */}
                            <div className="relative ml-1">
                                <button 
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-all"
                                >
                                    <Icons.User />
                                </button>

                                {isUserMenuOpen && (
                                    <>
                                        {/* Overlay to close menu */}
                                        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                                        
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                                            <div className="px-4 py-3 border-b border-gray-50">
                                                <p className="text-sm font-bold text-gray-900">{userName}</p>
                                                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                            </div>
                                            <div className="p-2">
                                                <Link 
                                                    to="/settings" 
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                >
                                                    <Icons.Settings />
                                                    Paramètres
                                                </Link>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Icons.SignOut />
                                                    Déconnexion
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </header>

                {/* Page Content */}
                <main className="pt-16 min-h-screen">
                    <div className="p-4 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Church Switcher Modal */}
            <ChurchSwitcherModal
                isOpen={isChurchModalOpen}
                onClose={() => setIsChurchModalOpen(false)}
            />

            {/* Spotlight Search Modal */}
            <SpotlightModal
                isOpen={isSpotlightOpen}
                onClose={() => setIsSpotlightOpen(false)}
                churchId={currentChurch?.id}
            />
        </div>
    );
}
