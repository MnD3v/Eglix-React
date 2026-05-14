import { supabase } from '../supabaseClient';

export const collaboratorService = {
    /**
     * Recherche un profil d'utilisateur par son adresse email
     */
    async findProfileByEmail(email) {
        if (!email) throw new Error('L\'email est requis');
        
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .ilike('email', email.trim())
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    /**
     * Récupère tous les collaborateurs associés à une église
     */
    async getCollaborators(churchId) {
        if (!churchId) throw new Error('Church ID is required');

        const { data, error } = await supabase
            .from('church_users')
            .select(`
                id,
                church_id,
                user_id,
                role,
                permissions,
                created_at,
                profile:profiles (
                    id,
                    email,
                    full_name
                )
            `)
            .eq('church_id', churchId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching collaborators:', error);
            throw error;
        }
        return data;
    },

    /**
     * Ajoute un collaborateur à une église
     */
    async addCollaborator(churchId, userId, role = 'user', permissions = {}) {
        if (!churchId || !userId) throw new Error('Missing arguments');

        const { data, error } = await supabase
            .from('church_users')
            .insert([{
                church_id: churchId,
                user_id: userId,
                role: role,
                permissions: permissions
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Met à jour le rôle ou les permissions d'un collaborateur
     */
    async updateCollaborator(churchUserId, updates) {
        if (!churchUserId) throw new Error('Missing church user ID');

        const { data, error } = await supabase
            .from('church_users')
            .update({
                role: updates.role,
                permissions: updates.permissions
            })
            .eq('id', churchUserId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Retire un collaborateur de l'église
     */
    async removeCollaborator(churchUserId) {
        if (!churchUserId) throw new Error('Missing church user ID');

        const { error } = await supabase
            .from('church_users')
            .delete()
            .eq('id', churchUserId);

        if (error) throw error;
        return true;
    }
};
