import api from './api';

// Lấy danh sách ID sách yêu thích của 1 user
export const getWishlistApi = async (maNguoiDung) => {
    try {
        const response = await api.get(`/SachYeuThich/${maNguoiDung}`);
        return response.data; // Trả về mảng các ID sách: [1, 3, 5...]
    } catch (error) {
        console.error("Lỗi lấy danh sách yêu thích", error);
        return [];
    }
};

// Gọi API Thêm/Xóa yêu thích (Toggle)
export const toggleWishlistApi = async (maNguoiDung, maSach) => {
    try {
        const response = await api.post('/SachYeuThich', { 
            maNguoiDung: maNguoiDung, 
            maSach: maSach 
        });
        return response.data; // Trả về { message, isLiked }
    } catch (error) {
        throw error.response?.data || "Lỗi cập nhật yêu thích";
    }
};