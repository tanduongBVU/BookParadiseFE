import {
    createContext,
    useState,
    useEffect,
    useCallback,
} from 'react';

import CartToast from '../components/Common/CartToast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('bookparadise_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [notification, setNotification] = useState(null);

    const closeNotification = useCallback(() => {
        setNotification(null);
    }, []);

    useEffect(() => {
        const handleAuthChange = () => {
            setCart([]);
            setNotification(null);
        };

        window.addEventListener('onAuthChange', handleAuthChange);

        return () => {
            window.removeEventListener('onAuthChange', handleAuthChange);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('bookparadise_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (
        product,
        quantity = 1,
        selectedVariant = null
    ) => {
        setCart((prevCart) => {
            const variantName = selectedVariant
                ? selectedVariant.tenBienThe
                : '';

            const variantPrice = selectedVariant
                ? selectedVariant.giaCongThem
                : 0;

            const stockLimit = selectedVariant
                ? selectedVariant.soLuong
                : product.soLuong;

            const cartId = `${product.maSach}_${variantName}`;

            const existingItem = prevCart.find(
                (item) => item.cartId === cartId
            );

            if (existingItem) {
                return prevCart.map((item) =>
                    item.cartId === cartId
                        ? {
                            ...item,
                            soMua: Math.min(
                                item.soMua + quantity,
                                stockLimit
                            ),
                        }
                        : item
                );
            }

            return [
                ...prevCart,
                {
                    ...product,
                    cartId,
                    gia: product.gia + variantPrice,
                    tenBienThe: variantName,
                    soMua: quantity,
                    soLuong: stockLimit,
                },
            ];
        });

        const variantText = selectedVariant
            ? ` - ${selectedVariant.tenBienThe}`
            : '';

        // Hiện thông báo mới thay cho alert()
        setNotification({
            message: `${product.tenSach}${variantText}`,
        });
    };

    const removeFromCart = (cartId) => {
        setCart((prevCart) =>
            prevCart.filter((item) => item.cartId !== cartId)
        );
    };

    const updateQuantity = (cartId, quantity) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.cartId === cartId
                    ? { ...item, soMua: quantity }
                    : item
            )
        );
    };

    const clearCart = () => setCart([]);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
            }}
        >
            {children}

            <CartToast
                notification={notification}
                onClose={closeNotification}
            />
        </CartContext.Provider>
    );
};