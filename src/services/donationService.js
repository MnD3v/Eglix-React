import { supabase } from '../supabaseClient'

export const donationService = {
    async getAll(churchId, filters = {}) {
        if (!churchId) throw new Error('Church ID is required');

        let query = supabase
            .from('donations')
            .select('*, members(first_name, last_name), projects(name)', { count: 'exact' })
            .eq('church_id', churchId)
            .order('received_at', { ascending: false });

        if (filters.search) {
            query = query.or(
                `donor_name.ilike.%${filters.search}%,reference.ilike.%${filters.search}%,physical_item.ilike.%${filters.search}%`
            );
        }
        if (filters.donation_type) {
            query = query.eq('donation_type', filters.donation_type);
        }
        if (filters.startDate) {
            query = query.gte('received_at', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('received_at', filters.endDate);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, count };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('donations')
            .select('*, members(first_name, last_name, email, phone), projects(name, id)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    sanitizeData(data) {
        const sanitized = { ...data };
        delete sanitized.members;
        delete sanitized.projects;
        if (sanitized.received_at === '') sanitized.received_at = null;
        if (sanitized.member_id === '') sanitized.member_id = null;
        if (sanitized.project_id === '') sanitized.project_id = null;
        if (sanitized.amount === '' || sanitized.amount === null) sanitized.amount = null;
        // If physical donation, remove money fields
        if (sanitized.donation_type === 'physical') {
            sanitized.amount = null;
            sanitized.payment_method = null;
        }
        return sanitized;
    },

    async create(donation) {
        const sanitized = this.sanitizeData(donation);
        const { data, error } = await supabase
            .from('donations')
            .insert([sanitized])
            .select();
        if (error) throw error;
        return data[0];
    },

    async update(id, updates) {
        const sanitized = this.sanitizeData(updates);
        const { data, error } = await supabase
            .from('donations')
            .update(sanitized)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async delete(id) {
        const { error } = await supabase
            .from('donations')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    async getTotalAmount(churchId, filters = {}) {
        if (!churchId) return 0;
        let query = supabase
            .from('donations')
            .select('amount')
            .eq('church_id', churchId)
            .eq('donation_type', 'money');
        if (filters.startDate) query = query.gte('received_at', filters.startDate);
        if (filters.endDate) query = query.lte('received_at', filters.endDate);
        const { data, error } = await query;
        if (error) return 0;
        return data.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    },

    // Get members for dropdown
    async getMembers(churchId) {
        const { data, error } = await supabase
            .from('members')
            .select('id, first_name, last_name')
            .eq('church_id', churchId)
            .order('first_name', { ascending: true });
        if (error) throw error;
        return data;
    },

    // Get projects for dropdown
    async getProjects(churchId) {
        const { data, error } = await supabase
            .from('projects')
            .select('id, name')
            .eq('church_id', churchId)
            .order('name', { ascending: true });
        if (error) throw error;
        return data;
    }
};
