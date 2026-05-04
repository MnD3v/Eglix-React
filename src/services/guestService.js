import { supabase } from '../supabaseClient';

export const guestService = {
    async getAll(churchId) {
        const { data, error } = await supabase
            .from('guests')
            .select('*')
            .eq('church_id', churchId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('guests')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(guestData) {
        const { data, error } = await supabase
            .from('guests')
            .insert([guestData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id, guestData) {
        const { data, error } = await supabase
            .from('guests')
            .update({ ...guestData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase
            .from('guests')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async getStats(churchId) {
        const { data, error } = await supabase
            .from('guests')
            .select('follow_up_status, gender, visit_type')
            .eq('church_id', churchId);

        if (error) throw error;

        const stats = {
            total: data.length,
            pending: data.filter(g => g.follow_up_status === 'pending').length,
            contacted: data.filter(g => g.follow_up_status === 'contacted').length,
            converted: data.filter(g => g.follow_up_status === 'converted').length,
            not_interested: data.filter(g => g.follow_up_status === 'not_interested').length,

            first_visit: data.filter(g => g.visit_type === 'first').length,
            second_visit: data.filter(g => g.visit_type === 'second').length,
            third_visit: data.filter(g => g.visit_type === 'third').length,
            regular: data.filter(g => g.visit_type === 'regular').length,

            male: data.filter(g => g.gender === 'male').length,
            female: data.filter(g => g.gender === 'female').length
        };

        return stats;
    },

    async uploadPhoto(file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `guests/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('photos')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
};
