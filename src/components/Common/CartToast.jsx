import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './CartToast.css';

export default function CartToast({ notification, onClose }) {
    useEffect(() => {
        if (!notification) return;

        const timer = setTimeout(onClose, 3000);

        return () => clearTimeout(timer);
    }, [notification, onClose]);

    if (!notification) return null;

    return createPortal(
        <div
            className="bp-cart-toast"
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <div className="bp-cart-toast__icon" aria-hidden="true">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="m5 12 4 4L19 6" />
                </svg>
            </div>

            <div className="bp-cart-toast__content">
                <strong>Đã thêm vào giỏ hàng!</strong>
                <p>{notification.message}</p>
            </div>

            <button
                className="bp-cart-toast__close"
                type="button"
                onClick={onClose}
                aria-label="Đóng thông báo"
            >
                ×
            </button>
        </div>,
        document.body
    );
}