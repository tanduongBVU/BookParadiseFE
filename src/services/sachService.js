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

// Hàm lấy chi tiết 1 cuốn sách theo ID
export const getSachById = async (id) => {
    try {
        const response = await api.get(`/Sach/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết sách mã ${id}:`, error);
        throw error; // Quăng lỗi để Component bắt và hiển thị
    }
};