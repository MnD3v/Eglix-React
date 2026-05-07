import { supabase } from '../supabaseClient'

export const journalService = {
    async getAll(churchId, filters = {}) {
        if (!churchId) throw new Error('Church ID is required');

        let query = supabase
            .from('journal_entries')
            .select('*', { count: 'exact' })
            .eq('church_id', churchId)
            .order('occurred_at', { ascending: false });

        if (filters.search) {
            query = query.or(
                `title.ilike.%${filters.search}%,category.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
            );
        }
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.startDate) {
            query = query.gte('occurred_at', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('occurred_at', filters.endDate);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, count };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    sanitizeData(data) {
        const sanitized = { ...data };
        if (sanitized.occurred_at === '') sanitized.occurred_at = null;
        if (sanitized.category === '') sanitized.category = null;
        return sanitized;
    },

    async create(entry) {
        const sanitized = this.sanitizeData(entry);
        const { data, error } = await supabase
            .from('journal_entries')
            .insert([sanitized])
            .select();
        if (error) throw error;
        return data[0];
    },

    async update(id, updates) {
        const sanitized = this.sanitizeData(updates);
        const { data, error } = await supabase
            .from('journal_entries')
            .update(sanitized)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async delete(id) {
        const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    async getCategories(churchId) {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('category')
            .eq('church_id', churchId)
            .not('category', 'is', null);
        if (error) return [];
        const cats = [...new Set(data.map(e => e.category).filter(Boolean))];
        return cats.sort();
    },

    async uploadAttachment(churchId, file) {
        const filePath = `journal/${churchId}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const { error: uploadError } = await supabase.storage
            .from('church-documents')
            .upload(filePath, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('church-documents')
            .getPublicUrl(filePath);

        return {
            url: urlData.publicUrl,
            name: file.name
        };
    }
};
