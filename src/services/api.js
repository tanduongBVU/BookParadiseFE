import axios from 'axios';

// Thay đổi URL dưới đây bằng URL Backend C# của bạn vừa xem ở bước trên
// Đừng quên thêm đuôi /api nếu các Controller của bạn có Route là [Route("api/[controller]")]
const BASE_URL = 'https://localhost:7010/api'; // <--- THAY ĐỔI CHỖ NÀY

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;