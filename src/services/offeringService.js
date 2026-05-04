import { supabase } from '../supabaseClient'

export const offeringService = {
    async getAll(churchId, filters = {}) {
        if (!churchId) throw new Error('Church ID is required');

        let query = supabase
            .from('offerings')
            .select('*, members(first_name, last_name), offering_types(name)', { count: 'exact' })
            .eq('church_id', churchId)
            .order('date', { ascending: false })

        if (filters.search) {
            query = query.or(`description.ilike.%${filters.search}%,payment_method.ilike.%${filters.search}%`)
        }
        if (filters.payment_method) {
            query = query.eq('payment_method', filters.payment_method)
        }
        if (filters.offering_type_id) {
            query = query.eq('offering_type_id', filters.offering_type_id)
        }
        if (filters.member_id) {
            query = query.eq('member_id', filters.member_id)
        }
        if (filters.startDate) {
            query = query.gte('date', filters.startDate)
        }
        if (filters.endDate) {
            query = query.lte('date', filters.endDate)
        }

        const { data, error, count } = await query
        if (error) throw error
        return { data, count }
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('offerings')
            .select('*, members(first_name, last_name, email, phone), offering_types(name)')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    // Helper to sanitize data
    sanitizeData(data) {
        const sanitized = { ...data };
        // Remove joined tables data
        delete sanitized.members;
        delete sanitized.offering_types;

        const dateFields = ['date'];

        dateFields.forEach(field => {
            if (sanitized[field] === '') {
                sanitized[field] = null;
            }
        });

        return sanitized;
    },

    async create(offering) {
        const sanitizedOffering = this.sanitizeData(offering);
        const { data, error } = await supabase
            .from('offerings')
            .insert([sanitizedOffering])
            .select()

        if (error) throw error
        return data[0]
    },

    async update(id, updates) {
        const sanitizedUpdates = this.sanitizeData(updates);
        const { data, error } = await supabase
            .from('offerings')
            .update(sanitizedUpdates)
            .eq('id', id)
            .select()

        if (error) throw error
        return data[0]
    },

    async delete(id) {
        const { error } = await supabase
            .from('offerings')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    async getStats(churchId) {
        if (!churchId) return {
            total: 0,
            totalAmount: 0,
            thisMonth: 0,
            lastMonth: 0,
            cash: 0,
            mobile: 0,
            bank: 0
        };

        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Fetch all offerings for the church in one go
        const { data: offerings, error } = await supabase
            .from('offerings')
            .select('amount, date, payment_method')
            .eq('church_id', churchId);

        if (error) {
            console.error('Error fetching offering stats:', error);
            return {
                total: 0, totalAmount: 0, thisMonth: 0, lastMonth: 0, cash: 0, mobile: 0, bank: 0
            };
        }

        const stats = offerings.reduce((acc, offering) => {
            const amount = parseFloat(offering.amount) || 0;
            const date = new Date(offering.date);

            // Global totals
            acc.total++;
            acc.totalAmount += amount;

            // Monthly stats
            if (date >= firstDayThisMonth && date < firstDayNextMonth) {
                acc.thisMonth += amount;
            } else if (date >= firstDayLastMonth && date < firstDayThisMonth) {
                acc.lastMonth += amount;
            }

            // Payment method stats
            if (offering.payment_method === 'cash') acc.cash += amount;
            else if (offering.payment_method === 'mobile') acc.mobile += amount;
            else if (offering.payment_method === 'bank') acc.bank += amount;

            return acc;
        }, {
            total: 0,
            totalAmount: 0,
            thisMonth: 0,
            lastMonth: 0,
            cash: 0,
            mobile: 0,
            bank: 0
        });

        return stats;
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
    },

    // Offering Types management
    async getTypes(churchId) {
        const { data, error } = await supabase
            .from('offering_types')
            .select('id, name')
            .eq('church_id', churchId)
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    async createType(typeData) {
        const { data, error } = await supabase
            .from('offering_types')
            .insert([typeData])
            .select();

        if (error) throw error;
        return data[0];
    },

    async updateType(id, name) {
        const { data, error } = await supabase
            .from('offering_types')
            .update({ name })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    async deleteType(id) {
        const { error } = await supabase
            .from('offering_types')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}
