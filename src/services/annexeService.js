import { supabase } from '../supabaseClient'

export const annexeService = {
    // ─── ANNEXES CRUD ────────────────────────────────────────────

    async getAll(churchId) {
        if (!churchId) throw new Error('Church ID is required');

        const { data, error, count } = await supabase
            .from('annexes')
            .select('*', { count: 'exact' })
            .eq('church_id', churchId)
            .order('name', { ascending: true });

        if (error) throw error;
        return { data, count };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('annexes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(annexe) {
        const { data, error } = await supabase
            .from('annexes')
            .insert([annexe])
            .select();

        if (error) throw error;
        return data[0];
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('annexes')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    async delete(id) {
        const { error } = await supabase
            .from('annexes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // ─── STATS GLOBALES D'UNE ANNEXE ─────────────────────────────

    async getStats(annexeId) {
        if (!annexeId) return {
            membersCount: 0,
            tithesTotal: 0,
            offeringsTotal: 0,
            donationsTotal: 0,
        };

        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [
            { count: membersCount },
            { data: tithes },
            { data: offerings },
            { data: donations },
        ] = await Promise.all([
            supabase.from('members').select('*', { count: 'exact', head: true }).eq('annexe_id', annexeId),
            supabase.from('tithes').select('amount').eq('annexe_id', annexeId),
            supabase.from('offerings').select('amount').eq('annexe_id', annexeId),
            supabase.from('donations').select('amount').eq('annexe_id', annexeId),
        ]);

        const sumAmounts = (rows) =>
            (rows || []).reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

        return {
            membersCount: membersCount || 0,
            tithesTotal: sumAmounts(tithes),
            offeringsTotal: sumAmounts(offerings),
            donationsTotal: sumAmounts(donations),
        };
    },

    // ─── MEMBRES D'UNE ANNEXE ────────────────────────────────────

    async getMembers(annexeId, filters = {}) {
        if (!annexeId) throw new Error('Annexe ID is required');

        let query = supabase
            .from('members')
            .select('*', { count: 'exact' })
            .eq('annexe_id', annexeId)
            .order('first_name', { ascending: true });

        if (filters.search) {
            query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, count };
    },

    // ─── DÎMES D'UNE ANNEXE ──────────────────────────────────────

    async getTithes(annexeId, filters = {}) {
        if (!annexeId) throw new Error('Annexe ID is required');

        let query = supabase
            .from('tithes')
            .select('*, members(first_name, last_name)', { count: 'exact' })
            .eq('annexe_id', annexeId)
            .order('date', { ascending: false });

        if (filters.search) {
            query = query.or(`description.ilike.%${filters.search}%`);
        }
        if (filters.payment_method) {
            query = query.eq('payment_method', filters.payment_method);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, count };
    },

    // ─── OFFRANDES D'UNE ANNEXE ──────────────────────────────────

    async getOfferings(annexeId, filters = {}) {
        if (!annexeId) throw new Error('Annexe ID is required');

        let query = supabase
            .from('offerings')
            .select('*, members(first_name, last_name), offering_types(name)', { count: 'exact' })
            .eq('annexe_id', annexeId)
            .order('date', { ascending: false });

        if (filters.search) {
            query = query.or(`description.ilike.%${filters.search}%`);
        }
        if (filters.payment_method) {
            query = query.eq('payment_method', filters.payment_method);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, count };
    },

    // ─── DONS D'UNE ANNEXE ───────────────────────────────────────

    async getDonations(annexeId, filters = {}) {
        if (!annexeId) throw new Error('Annexe ID is required');

        let query = supabase
            .from('donations')
            .select('*, members(first_name, last_name)', { count: 'exact' })
            .eq('annexe_id', annexeId)
            .order('date', { ascending: false });

        if (filters.search) {
            query = query.or(`description.ilike.%${filters.search}%`);
        }
        if (filters.payment_method) {
            query = query.eq('payment_method', filters.payment_method);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, count };
    },
}
