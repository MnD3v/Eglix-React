import { supabase } from '../supabaseClient'

export const titheService = {
    async getAll(churchId, filters = {}) {
        if (!churchId) throw new Error('Church ID is required');

        let query = supabase
            .from('tithes')
            .select('*, members(first_name, last_name)', { count: 'exact' })
            .eq('church_id', churchId)
            .order('date', { ascending: false })

        if (filters.search) {
            query = query.or(`description.ilike.%${filters.search}%,payment_method.ilike.%${filters.search}%`)
        }
        if (filters.payment_method) {
            query = query.eq('payment_method', filters.payment_method)
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
            .from('tithes')
            .select('*, members(first_name, last_name, email, phone)')
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
        // donor_name is kept (null for member/anonymous, text for external)

        const dateFields = ['date'];
        dateFields.forEach(field => {
            if (sanitized[field] === '') sanitized[field] = null;
        });
        return sanitized;
    },

    async create(tithe) {
        const sanitizedTithe = this.sanitizeData(tithe);
        const { data, error } = await supabase
            .from('tithes')
            .insert([sanitizedTithe])
            .select()

        if (error) throw error
        return data[0]
    },

    async update(id, updates) {
        const sanitizedUpdates = this.sanitizeData(updates);
        const { data, error } = await supabase
            .from('tithes')
            .update(sanitizedUpdates)
            .eq('id', id)
            .select()

        if (error) throw error
        return data[0]
    },

    async delete(id) {
        const { error } = await supabase
            .from('tithes')
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

        // Fetch all tithes for the church in one go
        // We only need amount, date, and payment_method for stats
        const { data: tithes, error } = await supabase
            .from('tithes')
            .select('amount, date, payment_method')
            .eq('church_id', churchId);

        if (error) {
            console.error('Error fetching tithe stats:', error);
            return {
                total: 0, totalAmount: 0, thisMonth: 0, lastMonth: 0, cash: 0, mobile: 0, bank: 0
            };
        }

        const stats = tithes.reduce((acc, tithe) => {
            const amount = parseFloat(tithe.amount) || 0;
            const date = new Date(tithe.date);

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
            if (tithe.payment_method === 'cash') acc.cash += amount;
            else if (tithe.payment_method === 'mobile') acc.mobile += amount;
            else if (tithe.payment_method === 'bank') acc.bank += amount;

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
    }
}
