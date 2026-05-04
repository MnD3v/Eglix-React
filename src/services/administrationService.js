import { supabase } from '../supabaseClient'

export const administrationService = {
    async getAll(churchId, filters = {}) {
        if (!churchId) throw new Error('Church ID is required');

        let query = supabase
            .from('administrations')
            .select('*, members(first_name, last_name, photo_url, phone, email)', { count: 'exact' })
            .eq('church_id', churchId)
            .order('function_title', { ascending: true });

        if (filters.search) {
            query = query.ilike('function_title', `%${filters.search}%`);
        }
        if (filters.is_active !== undefined) {
            query = query.eq('is_active', filters.is_active);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, count };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('administrations')
            .select('*, members(first_name, last_name, photo_url, phone, email, id)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    sanitizeData(data) {
        const sanitized = { ...data };
        delete sanitized.members;
        if (sanitized.start_date === '') sanitized.start_date = null;
        if (sanitized.end_date === '') sanitized.end_date = null;
        if (sanitized.member_id === '') sanitized.member_id = null;
        return sanitized;
    },

    async create(admin) {
        const sanitized = this.sanitizeData(admin);
        const { data, error } = await supabase
            .from('administrations')
            .insert([sanitized])
            .select();
        if (error) throw error;
        return data[0];
    },

    async update(id, updates) {
        const sanitized = this.sanitizeData(updates);
        const { data, error } = await supabase
            .from('administrations')
            .update(sanitized)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async delete(id) {
        const { error } = await supabase
            .from('administrations')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    // Get members for dropdown
    async getMembers(churchId) {
        const { data, error } = await supabase
            .from('members')
            .select('id, first_name, last_name')
            .eq('church_id', churchId)
            .eq('status', 'active')
            .order('first_name', { ascending: true });
        if (error) throw error;
        return data;
    }
};
