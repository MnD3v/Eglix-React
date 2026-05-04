import { supabase } from '../supabaseClient'

export const memberService = {
    async getAll(churchId, filters = {}) {
        if (!churchId) throw new Error('Church ID is required');

        let query = supabase
            .from('members')
            .select('*', { count: 'exact' })
            .eq('church_id', churchId)
            .order('created_at', { ascending: false })

        if (filters.search) {
            query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
        }
        if (filters.status) {
            query = query.eq('status', filters.status)
        }
        if (filters.gender) {
            query = query.eq('gender', filters.gender)
        }

        const { data, error, count } = await query
        if (error) throw error
        return { data, count }
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    // Helper to sanitize data (convert empty strings to null for date fields)
    sanitizeData(data) {
        const sanitized = { ...data };
        const dateFields = ['birth_date', 'joined_at', 'baptized_at'];

        dateFields.forEach(field => {
            if (sanitized[field] === '') {
                sanitized[field] = null;
            }
        });

        return sanitized;
    },

    async create(member) {
        const sanitizedMember = this.sanitizeData(member);
        const { data, error } = await supabase
            .from('members')
            .insert([sanitizedMember])
            .select()

        if (error) throw error
        return data[0]
    },

    async update(id, updates) {
        const sanitizedUpdates = this.sanitizeData(updates);
        const { data, error } = await supabase
            .from('members')
            .update(sanitizedUpdates)
            .eq('id', id)
            .select()

        if (error) throw error
        return data[0]
    },

    async delete(id) {
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    async getStats(churchId) {
        if (!churchId) return { total: 0, active: 0, inactive: 0, male: 0, female: 0, children: 0 };

        // Helper to get a fresh base query
        const getBaseQuery = () => supabase.from('members').select('*', { count: 'exact', head: true }).eq('church_id', churchId);

        const [
            { count: total },
            { count: active },
            { count: inactive },
            { count: male },
            { count: female }
        ] = await Promise.all([
            getBaseQuery(),
            getBaseQuery().eq('status', 'active'),
            getBaseQuery().eq('status', 'inactive'),
            getBaseQuery().eq('gender', 'male'),
            getBaseQuery().eq('gender', 'female')
        ]);

        return {
            total: total || 0,
            active: active || 0,
            inactive: inactive || 0,
            male: male || 0,
            female: female || 0,
            children: 0
        };
    },

    async uploadPhoto(file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('members')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('members').getPublicUrl(filePath);
        return data.publicUrl;
    },

    // Remarks Management
    async addRemark(memberId, remark) {
        // First get current remarks
        const member = await this.getById(memberId);
        const currentRemarks = member.remarks || [];

        const newRemark = {
            ...remark,
            added_at: new Date().toISOString(),
            // added_by: user.id // In a real app
        };

        const updatedRemarks = [...currentRemarks, newRemark];

        return this.update(memberId, { remarks: updatedRemarks });
    },

    // Public Registration Methods
    async getPublicChurchInfo(churchId) {
        const { data, error } = await supabase
            .from('churches')
            .select('id, name, address, phone, email, logo_url')
            .eq('id', churchId)
            .single();

        if (error) throw error;
        return data;
    },

    async registerViaLink(churchId, memberData) {
        const { data, error } = await supabase.rpc('register_member_via_link', {
            p_church_id: churchId,
            p_first_name: memberData.first_name,
            p_last_name: memberData.last_name,
            p_gender: memberData.gender,
            p_marital_status: memberData.marital_status || null,
            p_birth_date: memberData.birth_date || null,
            p_email: memberData.email || null,
            p_phone: memberData.phone || null,
            p_address: memberData.address || null,
            p_function: memberData.function || null,
            p_joined_at: memberData.joined_at || null,
            p_baptized_at: memberData.baptized_at || null,
            p_baptism_responsible: memberData.baptism_responsible || null,
            p_notes: memberData.notes || null,
            p_photo_url: memberData.photo_url || null
        });

        if (error) throw error;
        return data;
    },

    async updateChurch(churchId, updates) {
        const { data, error } = await supabase
            .from('churches')
            .update(updates)
            .eq('id', churchId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
