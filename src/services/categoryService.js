import api from './api';

const endpoint = '/v1/products/categories/';

const categoryService = {
  getAll: async () => {
    const res = await api.get(endpoint);
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },
  create: async (data) => {
    const res = await api.post(endpoint, data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`${endpoint}${id}/`, data);
    return res.data;
  },
  delete: async (id) => {
    await api.delete(`${endpoint}${id}/`);
  }
};

export default categoryService;
