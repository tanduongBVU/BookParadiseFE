import api from './api';

export const getAllUsers = async () => (await api.get('/NguoiDung/all')).data;
export const deleteUser = async (id) => (await api.delete(`/NguoiDung/${id}`)).data;
export const updateUserRole = async (id, vaiTro) => (await api.put(`/NguoiDung/${id}/role`, { vaiTro })).data;