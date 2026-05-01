import { supabase } from '@/lib/supabase';

function createCrudService(table) {
  return {
    async getAll(orderBy = 'created_at') {
      let query = supabase.from(table).select('*');
      if (orderBy) {
        query = query.order(orderBy, { ascending: false });
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getById(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },

    async create(record) {
      const { data, error } = await supabase.from(table).insert([record]).select().single();
      if (error) throw error;
      return data;
    },

    async update(id, record) {
      const { data, error } = await supabase.from(table).update(record).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
  };
}

export const adminService = {
  products: {
    ...createCrudService('products'),
    async getByStatus(status) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async publish(id) {
      const { data, error } = await supabase
        .from('products')
        .update({ status: 'published' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async unpublish(id) {
      const { data, error } = await supabase
        .from('products')
        .update({ status: 'draft' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },
  shipping: createCrudService('shipping_options'),
  trackings: createCrudService('trackings'),
  faqs: createCrudService('faqs'),
  howItWorks: createCrudService('how_it_works'),
};
