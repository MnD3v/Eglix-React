import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

import Loader from '../components/Loader';

const ChurchContext = createContext();

export function ChurchProvider({ children }) {
    const [currentChurch, setCurrentChurch] = useState(null);
    const [userChurches, setUserChurches] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [userPermissions, setUserPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const location = useLocation();

    const loadUserChurches = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Fetch all churches associated with the user with their roles and permissions
            const { data: churchUsers, error: cuError } = await supabase
                .from('church_users')
                .select('church_id, role, permissions, churches(*)')
                .eq('user_id', user.id);

            if (cuError) {
                console.error('Error fetching user churches:', cuError);
                throw cuError;
            }

            if (churchUsers && churchUsers.length > 0) {
                setMemberships(churchUsers);
                const churches = churchUsers.map(cu => cu.churches).filter(Boolean);
                setUserChurches(churches);

                // Update currentChurch with fresh data if it exists
                setCurrentChurch(prevChurch => {
                    if (prevChurch) {
                        const updatedCurrentChurch = churches.find(c => c.id === prevChurch.id);
                        return updatedCurrentChurch || churches[0];
                    }
                    return churches[0];
                });
            } else {
                setMemberships([]);
                setUserChurches([]);
                setCurrentChurch(null);
            }
        } catch (error) {
            console.error('Error loading churches:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadUserChurches();
        } else {
            setLoading(false);
            setMemberships([]);
            setUserChurches([]);
            setCurrentChurch(null);
        }
    }, [user, loadUserChurches]);

    // Synchronize role and permissions whenever currentChurch or memberships changes
    useEffect(() => {
        if (currentChurch && memberships.length > 0) {
            const activeMembership = memberships.find(m => m.church_id === currentChurch.id);
            if (activeMembership) {
                setUserRole(activeMembership.role || 'user');
                setUserPermissions(activeMembership.permissions || {});
            } else {
                setUserRole(null);
                setUserPermissions({});
            }
        } else {
            setUserRole(null);
            setUserPermissions({});
        }
    }, [currentChurch, memberships]);

    const switchChurch = (churchId) => {
        const church = userChurches.find(c => c.id === churchId);
        if (church) {
            setCurrentChurch(church);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

    // Don't redirect to create-church if on public routes or already on the create-church page
    const publicRoutes = ['/join/', '/login', '/register', '/create-church'];
    const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

    // If user has no church and not on a public route, redirect to create church page
    if (!currentChurch && !loading && !isPublicRoute && user) {
        return <Navigate to="/create-church" replace />;
    }

    const value = {
        currentChurch,
        userChurches,
        userRole,
        userPermissions,
        setCurrentChurch,
        switchChurch,
        loading,
        refreshChurch: loadUserChurches
    };

    return (
        <ChurchContext.Provider value={value}>
            {children}
        </ChurchContext.Provider>
    );
}

export function useChurch() {
    return useContext(ChurchContext);
}
