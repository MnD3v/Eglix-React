import { supabase } from '../supabaseClient'

export const expenseService = {
    async getAll(churchId, filters = {}) {
        if (!churchId) throw new Error('Church ID is required');

        let query = supabase
            .from('expenses')
            .select('*, projects(name)', { count: 'exact' })
            .eq('church_id', churchId)
            .order('paid_at', { ascending: false });

        if (filters.search) {
            query = query.ilike('description', `%${filters.search}%`);
        }
        if (filters.startDate) {
            query = query.gte('paid_at', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('paid_at', filters.endDate);
        }
        if (filters.project_id) {
            query = query.eq('project_id', filters.project_id);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, count };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('expenses')
            .select('*, projects(name, id)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    sanitizeData(data) {
        const sanitized = { ...data };
        delete sanitized.projects;
        if (sanitized.paid_at === '') sanitized.paid_at = null;
        if (sanitized.project_id === '') sanitized.project_id = null;
        return sanitized;
    },

    async create(expense) {
        const sanitized = this.sanitizeData(expense);
        const { data, error } = await supabase
            .from('expenses')
            .insert([sanitized])
            .select();
        if (error) throw error;
        return data[0];
    },

    async update(id, updates) {
        const sanitized = this.sanitizeData(updates);
        const { data, error } = await supabase
            .from('expenses')
            .update(sanitized)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async delete(id) {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    async getTotalAmount(churchId, filters = {}) {
        if (!churchId) return 0;
        let query = supabase
            .from('expenses')
            .select('amount')
            .eq('church_id', churchId);
        if (filters.startDate) query = query.gte('paid_at', filters.startDate);
        if (filters.endDate) query = query.lte('paid_at', filters.endDate);
        const { data, error } = await query;
        if (error) return 0;
        return data.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    },

    async getMonthlyChart(churchId) {
        if (!churchId) return { labels: [], data: [] };
        const year = new Date().getFullYear();
        const from = `${year}-01-01`;
        const to = `${year}-12-31`;
        const { data, error } = await supabase
            .from('expenses')
            .select('amount, paid_at')
            .eq('church_id', churchId)
            .gte('paid_at', from)
            .lte('paid_at', to);
        if (error) return { labels: [], data: [] };

        const monthly = Array(12).fill(0);
        data.forEach(e => {
            const month = new Date(e.paid_at).getMonth();
            monthly[month] += parseFloat(e.amount) || 0;
        });
        return {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
            data: monthly
        };
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
