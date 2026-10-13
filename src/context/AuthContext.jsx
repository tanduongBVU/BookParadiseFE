import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Khi web vừa load, kiểm tra xem trước đó đã đăng nhập chưa
    useEffect(() => {
        const storedUser = localStorage.getItem('bookparadise_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Hàm xử lý đăng nhập thành công
    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('bookparadise_user', JSON.stringify(userData));
        localStorage.setItem('bookparadise_token', token);
    };

    // Hàm đăng xuất
    const logout = () => {
        setUser(null);
        localStorage.removeItem('bookparadise_user');
        localStorage.removeItem('bookparadise_token');
        // Có thể thêm dòng xóa giỏ hàng ở đây nếu muốn
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};