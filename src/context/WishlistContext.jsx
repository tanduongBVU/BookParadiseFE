import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { getWishlistApi, toggleWishlistApi } from '../services/wishlistService';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useContext(AuthContext); // Lấy thông tin user đang đăng nhập
    const [wishlist, setWishlist] = useState([]); // Chứa danh sách các maSach (ID sách)

    // Tự động tải Wishlist khi User thay đổi (đăng nhập/đăng xuất)
    useEffect(() => {
        if (user && user.id) {
            fetchWishlist(user.id);
        } else {
            setWishlist([]); // Dọn dẹp wishlist nếu người dùng đăng xuất
        }
    }, [user]);

    const fetchWishlist = async (userId) => {
        const data = await getWishlistApi(userId);
        setWishlist(data); 
    };

    // Hàm xử lý khi người dùng ấn vào nút Trái tim
    const toggleWishlist = async (maSach) => {
        if (!user) {
            alert("Vui lòng đăng nhập để thêm sách vào danh sách yêu thích!");
            return false;
        }

        try {
            const result = await toggleWishlistApi(user.id, maSach);
            
            // Cập nhật lại state lập tức dựa trên phản hồi của C#
            if (result.isLiked) {
                // Nếu là thả tim -> thêm ID sách vào mảng
                setWishlist(prev => [...prev, maSach]);
            } else {
                // Nếu là hủy thả tim -> lọc bỏ ID sách khỏi mảng
                setWishlist(prev => prev.filter(id => id !== maSach));
            }
            return true;
        } catch (error) {
            console.error("Lỗi khi toggle wishlist:", error);
            alert("Có lỗi xảy ra. Vui lòng thử lại!");
            return false;
        }
    };

    // Hàm kiểm tra nhanh 1 cuốn sách đã được thích hay chưa (để tô màu tim đỏ)
    const isInWishlist = (maSach) => {
        return wishlist.includes(maSach);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};