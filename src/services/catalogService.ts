import api from './api';

export const catalogService = {
  getCatalogs: async () => {
    const { data } = await api.get('/catalogs');
    return data;
  },

  getCatalog: async (id: string) => {
    const { data } = await api.get(`/catalogs/${id}`);
    return data;
  },

  createCatalog: async (catalogData: any) => {
    const { data } = await api.post('/catalogs', catalogData);
    return data;
  },

  updateCatalog: async (id: string, catalogData: any) => {
    const { data } = await api.put(`/catalogs/${id}`, catalogData);
    return data;
  },

  deleteCatalog: async (id: string) => {
    const { data } = await api.delete(`/catalogs/${id}`);
    return data;
  },
};
