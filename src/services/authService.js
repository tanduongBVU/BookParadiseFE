import api from './api';

export const loginApi = async (email, password) => {
    try {
        // Gửi email và matKhau
        const payload = { 
            email: email, 
            matKhau: password 
        };
        
        const response = await api.post('/NguoiDung/login', payload);
        return response.data;
    } catch (error) {
        // Bắt lỗi chi tiết từ C# trả về
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error("Lỗi kết nối đến máy chủ");
    }
};

export const registerApi = async (hoTen, email, password) => {
    try {
        const payload = {
            hoTen: hoTen,
            email: email,
            matKhau: password, // Bắt buộc phải là 'matKhau' để khớp với C#
            hienThi: true,
            trangThaiAI: "Cho_Kiem_Duyet"
        };

        // Gọi đúng route API: /NguoiDung
        const response = await api.post('/NguoiDung', payload); 
        return response.data;
    } catch (error) {
        // Trích xuất chính xác câu thông báo lỗi (message) từ C# Backend trả về
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error("Lỗi kết nối đến máy chủ");
    }
};