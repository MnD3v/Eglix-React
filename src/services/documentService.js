import { supabase } from '../supabaseClient'

const BUCKET = 'church-documents'

export const documentService = {

    // ─── FOLDERS ───────────────────────────────────────────────

    async getFolders(churchId) {
        const { data, error } = await supabase
            .from('document_folders')
            .select('*')
            .eq('church_id', churchId)
            .order('name', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    async createFolder(folder) {
        const { data, error } = await supabase
            .from('document_folders')
            .insert([folder])
            .select();
        if (error) throw error;
        return data[0];
    },

    async updateFolder(id, updates) {
        const { data, error } = await supabase
            .from('document_folders')
            .update(updates)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async deleteFolder(id) {
        const { error } = await supabase
            .from('document_folders')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    // ─── DOCUMENTS ─────────────────────────────────────────────

    async getAll(churchId, filters = {}) {
        if (!churchId) throw new Error('Church ID is required');
        let query = supabase
            .from('documents')
            .select('*, document_folders(name)', { count: 'exact' })
            .eq('church_id', churchId)
            .order('created_at', { ascending: false });

        if (filters.folder_id) {
            query = query.eq('folder_id', filters.folder_id);
        }
        if (filters.file_type) {
            query = query.eq('file_type', filters.file_type);
        }
        if (filters.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { data: data || [], count: count || 0 };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('documents')
            .select('*, document_folders(name, id)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async getStats(churchId) {
        const { data, error } = await supabase
            .from('documents')
            .select('file_type')
            .eq('church_id', churchId);
        if (error) return { total: 0, images: 0, pdfs: 0 };
        return {
            total: data.length,
            images: data.filter(d => d.file_type === 'image').length,
            pdfs: data.filter(d => d.file_type === 'pdf').length,
        };
    },

    // Upload file to Supabase Storage, then insert record into DB
    async upload(churchId, folderId, name, description, isPublic, file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
        const filePath = `${churchId}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;

        // 1. Upload to storage
        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;

        // 2. Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(filePath);

        // 3. Insert DB record
        const record = {
            church_id: churchId,
            folder_id: folderId || null,
            name: name || file.name,
            description: description || null,
            file_path: filePath,
            file_url: urlData.publicUrl,
            file_type: fileType,
            file_size: file.size,
            file_ext: ext,
            is_public: !!isPublic,
        };
        const { data, error: dbError } = await supabase
            .from('documents')
            .insert([record])
            .select();
        if (dbError) {
            // Rollback storage upload on DB error
            await supabase.storage.from(BUCKET).remove([filePath]);
            throw dbError;
        }
        return data[0];
    },

    async update(id, updates) {
        const sanitized = { ...updates };
        delete sanitized.document_folders;
        delete sanitized.file_path;
        delete sanitized.file_url;
        delete sanitized.file_type;
        delete sanitized.file_size;
        delete sanitized.file_ext;
        const { data, error } = await supabase
            .from('documents')
            .update(sanitized)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async delete(id) {
        // Get file_path first for storage removal
        const { data: doc } = await supabase
            .from('documents')
            .select('file_path')
            .eq('id', id)
            .single();
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', id);
        if (error) throw error;
        // Remove file from storage (best effort)
        if (doc?.file_path) {
            await supabase.storage.from(BUCKET).remove([doc.file_path]);
        }
        return true;
    },
};
