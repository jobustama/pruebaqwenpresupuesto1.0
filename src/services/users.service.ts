import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
}

export const usersService = {
  findAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  findOne: async (email: string) => {
    const response = await api.get(`/users/${email}`);
    return response.data;
  },
};

export interface InviteUserDto {
  homeId: number;
  email: string;
  role?: string;
}

export interface UpdateInviteStatusDto {
  inviteId: number;
  status: 'accepted' | 'rejected';
}

export interface UpdateMemberRoleDto {
  role: string;
}

export const userHomeService = {
  inviteUser: async (data: InviteUserDto) => {
    const response = await api.post('/user-home/invite', data);
    return response.data;
  },

  updateInviteStatus: async (data: UpdateInviteStatusDto) => {
    const response = await api.patch('/user-home/invite/status', data);
    return response.data;
  },

  updateRole: async (homeId: number, memberId: number, data: UpdateMemberRoleDto) => {
    const response = await api.patch(`/user-home/${homeId}/role/${memberId}`, data);
    return response.data;
  },

  getHomeMembers: async (homeId: number) => {
    const response = await api.get(`/user-home/${homeId}/members`);
    return response.data;
  },
};
