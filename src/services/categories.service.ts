import api from './api';

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
}

export const categoriesService = {
  findAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (data: CreateCategoryDto) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCategoryDto) => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  remove: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};
