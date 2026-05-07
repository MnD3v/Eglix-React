import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

import Loader from '../components/Loader';

const ChurchContext = createContext();

export function ChurchProvider({ children }) {
    const [currentChurch, setCurrentChurch] = useState(null);
    const [userChurches, setUserChurches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const location = useLocation();

    const loadUserChurches = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Fetch all churches associated with the user
            const { data: churchUsers, error: cuError } = await supabase
                .from('church_users')
                .select('church_id, churches(*)')
                .eq('user_id', user.id);

            if (cuError) {
                console.error('Error fetching user churches:', cuError);
                throw cuError;
            }

            if (churchUsers && churchUsers.length > 0) {
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
        }
    }, [user, loadUserChurches]);

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
