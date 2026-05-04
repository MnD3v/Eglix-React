import { supabase } from '../supabaseClient'

export const groupService = {

    // ─── TYPES DE GROUPES ───────────────────────────────────────

    async getTypes(churchId) {
        const { data, error } = await supabase
            .from('group_types')
            .select('*')
            .eq('church_id', churchId)
            .order('name')

        if (error) throw error
        return data
    },

    async createType(churchId, name) {
        const { data, error } = await supabase
            .from('group_types')
            .insert([{ church_id: churchId, name }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateType(id, name) {
        const { data, error } = await supabase
            .from('group_types')
            .update({ name })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteType(id) {
        const { error } = await supabase
            .from('group_types')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    // ─── GROUPES ────────────────────────────────────────────────

    async getAll(churchId) {
        const { data, error } = await supabase
            .from('groups')
            .select(`
                *,
                group_types(id, name),
                group_members(count)
            `)
            .eq('church_id', churchId)
            .order('name')

        if (error) throw error
        return data
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('groups')
            .select(`
                *,
                group_types(id, name),
                group_members(
                    id,
                    role,
                    joined_at,
                    members(id, first_name, last_name, photo_url, function, status)
                )
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    async create(churchId, groupData) {
        const { data, error } = await supabase
            .from('groups')
            .insert([{ church_id: churchId, ...groupData }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('groups')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async delete(id) {
        const { error } = await supabase
            .from('groups')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    // ─── MEMBRES DU GROUPE ──────────────────────────────────────

    async addMember(groupId, memberId, role = 'member') {
        const { data, error } = await supabase
            .from('group_members')
            .insert([{ group_id: groupId, member_id: memberId, role }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateMemberRole(groupId, memberId, role) {
        const { data, error } = await supabase
            .from('group_members')
            .update({ role })
            .eq('group_id', groupId)
            .eq('member_id', memberId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async removeMember(groupId, memberId) {
        const { error } = await supabase
            .from('group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('member_id', memberId)

        if (error) throw error
        return true
    },

    // ─── PERMISSIONS DES RESPONSABLES ───────────────────────────

    async getPermissions(groupId) {
        const { data, error } = await supabase
            .from('group_permissions')
            .select(`
                *,
                members(id, first_name, last_name, photo_url)
            `)
            .eq('group_id', groupId)

        if (error) throw error
        return data
    },

    async setPermissions(groupId, memberId, permissions) {
        const { data, error } = await supabase
            .from('group_permissions')
            .upsert({
                group_id: groupId,
                member_id: memberId,
                ...permissions
            }, { onConflict: 'group_id,member_id' })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async removePermissions(groupId, memberId) {
        const { error } = await supabase
            .from('group_permissions')
            .delete()
            .eq('group_id', groupId)
            .eq('member_id', memberId)

        if (error) throw error
        return true
    },

    // ─── STATS ──────────────────────────────────────────────────

    async getStats(churchId) {
        const { data, error } = await supabase
            .from('groups')
            .select('id, name, group_members(count)')
            .eq('church_id', churchId)

        if (error) throw error

        const totalGroups = data.length
        const totalMembers = data.reduce((acc, g) => acc + (g.group_members?.[0]?.count || 0), 0)

        return { totalGroups, totalMembers }
    }
}
