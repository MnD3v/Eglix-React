import { supabase } from '../supabaseClient'

export const projectService = {
    async getAll(churchId, filters = {}) {
        if (!churchId) throw new Error('Church ID is required');

        let query = supabase
            .from('projects')
            .select('*', { count: 'exact' })
            .eq('church_id', churchId)
            .order('created_at', { ascending: false });

        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, count };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Helper to sanitize data
    sanitizeData(data) {
        const sanitized = { ...data };

        const dateFields = ['start_date', 'end_date'];

        dateFields.forEach(field => {
            if (sanitized[field] === '') {
                sanitized[field] = null;
            }
        });

        const numericFields = ['target_amount', 'collected_amount'];

        numericFields.forEach(field => {
            if (sanitized[field] !== undefined && sanitized[field] !== null && sanitized[field] !== '') {
                sanitized[field] = parseFloat(sanitized[field]);
            } else if (sanitized[field] === '') {
                sanitized[field] = null;
            }
        });

        return sanitized;
    },

    async create(project) {
        const sanitizedProject = this.sanitizeData(project);
        const { data, error } = await supabase
            .from('projects')
            .insert([{ ...sanitizedProject, updated_at: new Date().toISOString() }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async update(id, updates) {
        const sanitizedUpdates = this.sanitizeData(updates);
        const { data, error } = await supabase
            .from('projects')
            .update({ ...sanitizedUpdates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    async delete(id) {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async getStats(churchId) {
        if (!churchId) return {
            total: 0,
            active: 0,
            completed: 0,
            totalTarget: 0,
            totalCollected: 0
        };

        const { data: projects, error } = await supabase
            .from('projects')
            .select('status, target_amount, collected_amount')
            .eq('church_id', churchId);

        if (error) {
            console.error('Error fetching project stats:', error);
            return {
                total: 0, active: 0, completed: 0, totalTarget: 0, totalCollected: 0
            };
        }

        const stats = projects.reduce((acc, project) => {
            acc.total++;

            if (project.status === 'active') acc.active++;
            if (project.status === 'completed') acc.completed++;

            acc.totalTarget += parseFloat(project.target_amount || 0);
            acc.totalCollected += parseFloat(project.collected_amount || 0);

            return acc;
        }, {
            total: 0,
            active: 0,
            completed: 0,
            totalTarget: 0,
            totalCollected: 0
        });

        return stats;
    }
};
