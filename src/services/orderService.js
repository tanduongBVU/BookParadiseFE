import api from './api';

// Gọi POST: /DonHang (Đã thêm tham số maCode và soTienGiam)
export const createDonHang = async (maNguoiDung, tongTien, maCode = null, soTienGiam = 0) => {
    try {
        const payload = {
            maNguoiDung,
            tongTien,
            maCode,
            soTienGiam,
            trangThaiAI: "Cho_Kiem_Duyet",
            hienThi: true
        };
        const response = await api.post('/DonHang', payload);
        return response.data; 
    } catch (error) {
        throw error.response?.data?.message || "Lỗi tạo đơn hàng";
    }
};

export const createChiTietDonHang = async (maDonHang, maSach, soLuong, donGia) => {
    try {
        const payload = { maDonHang, maSach, soLuong, donGia, trangThaiAI: "Cho_Kiem_Duyet", hienThi: true };
        const response = await api.post('/ChiTietDonHang', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Lỗi tạo chi tiết đơn hàng";
    }
};

// Hàm mới: Xác thực mã giảm giá
export const applyVoucher = async (code, tongTienDonHang) => {
    try {
        const response = await api.post('/MaGiamGia/apply', { code, tongTienDonHang });
        return response.data; // Trả về { code, soTienGiam }
    } catch (error) {
        throw error.response?.data?.message || "Lỗi áp dụng mã";
    }
};