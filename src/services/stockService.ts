import api from './api';

export const stockService = {
  getTransactions: async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    type?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const { data } = await api.get('/stock', { params });
    return data;
  },

  createTransaction: async (transactionData: any) => {
    const { data } = await api.post('/stock', transactionData);
    return data;
  },
};
