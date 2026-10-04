import api from './api';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  homeId: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
    color?: string;
  };
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  homeId: string;
}

export interface UpdateExpenseDto {
  description?: string;
  amount?: number;
  date?: string;
  categoryId?: number;
}

export interface FilterParams {
  categoryId: string;
  startDate: string;
  endDate: string;
}

export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

export const expensesService = {
  findAll: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  create: async (data: CreateExpenseDto) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  update: async (id: string, data: UpdateExpenseDto) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  findAllByHome: async (homeId: string) => {
    const response = await api.get(`/expenses/home/${homeId}`);
    return response.data;
  },

  findFiltered: async (params: FilterParams) => {
    const response = await api.get('/expenses/filter', { params });
    return response.data;
  },

  getTotal: async () => {
    const response = await api.get('/expenses/totals/general');
    return response.data;
  },

  getTotalByCategory: async () => {
    const response = await api.get('/expenses/totals/category');
    return response.data;
  },

  getTotalByDateRange: async (params: DateRangeParams) => {
    const response = await api.get('/expenses/totals/date-range', { params });
    return response.data;
  },

  getTotalByHome: async (homeId: string) => {
    const response = await api.get(`/expenses/totals/home/${homeId}`);
    return response.data;
  },

  getTotalByHomeAndCategory: async (homeId: string) => {
    const response = await api.get(`/expenses/totals/home/${homeId}/category`);
    return response.data;
  },

  getTotalByHomeDateRange: async (homeId: string, params: DateRangeParams) => {
    const response = await api.get(`/expenses/totals/home/${homeId}/date-range`, { params });
    return response.data;
  },
};
