import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('bookparadise_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        const handleAuthChange = () => setCart([]);
        window.addEventListener('onAuthChange', handleAuthChange);
        return () => window.removeEventListener('onAuthChange', handleAuthChange);
    }, []);

    useEffect(() => {
        localStorage.setItem('bookparadise_cart', JSON.stringify(cart));
    }, [cart]);

    // Cập nhật hàm Add nhận thêm selectedVariant
    const addToCart = (product, quantity = 1, selectedVariant = null) => {
        setCart((prevCart) => {
            const variantName = selectedVariant ? selectedVariant.tenBienThe : "";
            const variantPrice = selectedVariant ? selectedVariant.giaCongThem : 0;
            const stockLimit = selectedVariant ? selectedVariant.soLuong : product.soLuong;
            
            // Tạo ID duy nhất cho giỏ hàng (VD: "9_Bìa cứng")
            const cartId = `${product.maSach}_${variantName}`; 

            const existingItem = prevCart.find(item => item.cartId === cartId);
            
            if (existingItem) {
                return prevCart.map(item => 
                    item.cartId === cartId 
                    ? { ...item, soMua: Math.min(item.soMua + quantity, stockLimit) }
                    : item
                );
            } else {
                return [...prevCart, { 
                    ...product, 
                    cartId: cartId, // Lưu ID riêng biệt
                    gia: product.gia + variantPrice, // Đã tính cộng giá biến thể
                    tenBienThe: variantName, 
                    soMua: quantity,
                    soLuong: stockLimit // Ghi đè tồn kho theo biến thể
                }];
            }
        });
        alert(`Đã thêm "${product.tenSach}${selectedVariant ? ` - ${selectedVariant.tenBienThe}` : ''}" vào giỏ hàng!`);
    };

    // Đổi tham số từ maSach sang cartId
    const removeFromCart = (cartId) => {
        setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, quantity) => {
        setCart(prevCart => prevCart.map(item => 
            item.cartId === cartId ? { ...item, soMua: quantity } : item
        ));
    };

    const clearCart = () => setCart([]);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};