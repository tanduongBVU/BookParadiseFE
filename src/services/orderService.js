import api from './api';

// Gọi POST: /DonHang
export const createDonHang = async (maNguoiDung, tongTien) => {
    try {
        const payload = {
            maNguoiDung: maNguoiDung,
            tongTien: tongTien,
            trangThaiAI: "Cho_Kiem_Duyet",
            hienThi: true
        };
        const response = await api.post('/DonHang', payload);
        return response.data; // C# trả về: { message, maDonHang, ... }
    } catch (error) {
        throw error.response?.data?.message || "Lỗi tạo đơn hàng";
    }
};

// Gọi POST: /ChiTietDonHang
export const createChiTietDonHang = async (maDonHang, maSach, soLuong, donGia) => {
    try {
        const payload = {
            maDonHang: maDonHang,
            maSach: maSach,
            soLuong: soLuong,
            donGia: donGia,
            trangThaiAI: "Cho_Kiem_Duyet",
            hienThi: true
        };
        const response = await api.post('/ChiTietDonHang', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Lỗi tạo chi tiết đơn hàng";
    }
};