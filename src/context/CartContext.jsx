import { createContext, useState, useEffect } from 'react';

// Khởi tạo Context
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Khởi tạo state giỏ hàng. Ưu tiên lấy từ localStorage nếu đã có.
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('bookparadise_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // --- ĐOẠN CODE THÊM VÀO ĐỂ FIX LỖI GIỎ HÀNG ---
    // Lắng nghe sự kiện đăng xuất từ AuthContext để dọn sạch giỏ hàng trên UI
    useEffect(() => {
        const handleAuthChange = () => {
            setCart([]); // Trả giỏ hàng về trạng thái trống
        };
        
        window.addEventListener('onAuthChange', handleAuthChange);
        
        // Dọn dẹp sự kiện khi component unmount
        return () => window.removeEventListener('onAuthChange', handleAuthChange);
    }, []);
    // ---------------------------------------------

    // Mỗi khi giỏ hàng thay đổi, lưu lại vào localStorage ngay
    useEffect(() => {
        localStorage.setItem('bookparadise_cart', JSON.stringify(cart));
    }, [cart]);

    // Hàm thêm vào giỏ
    const addToCart = (product, quantity = 1) => {
        setCart((prevCart) => {
            // Kiểm tra sách đã có trong giỏ chưa
            const existingItem = prevCart.find(item => item.maSach === product.maSach);
            
            if (existingItem) {
                // Nếu có rồi thì tăng số lượng (không vượt quá số lượng tồn kho)
                return prevCart.map(item => 
                    item.maSach === product.maSach 
                    ? { ...item, soMua: Math.min(item.soMua + quantity, product.soLuong) }
                    : item
                );
            } else {
                // Nếu chưa có thì thêm mới, đặt trường số lượng mua là 'soMua'
                return [...prevCart, { ...product, soMua: quantity }];
            }
        });
        alert(`Đã thêm "${product.tenSach}" vào giỏ hàng!`);
    };

    // Hàm xóa khỏi giỏ
    const removeFromCart = (maSach) => {
        setCart(prevCart => prevCart.filter(item => item.maSach !== maSach));
    };

    // Hàm thay đổi số lượng trực tiếp trong giỏ
    const updateQuantity = (maSach, quantity) => {
        setCart(prevCart => prevCart.map(item => 
            item.maSach === maSach ? { ...item, soMua: quantity } : item
        ));
    };

    // Xóa sạch giỏ hàng (dùng khi thanh toán xong)
    const clearCart = () => setCart([]);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};