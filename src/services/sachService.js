import api from './api';

export const getDanhSachSach = async () => {
    try {
        // Tương ứng với HttpGet trong SachController
        const response = await api.get('/Sach'); 
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API danh sách sách:", error);
        throw error;
    }
};