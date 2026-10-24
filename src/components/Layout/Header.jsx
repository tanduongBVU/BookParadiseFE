import {
    Link,
    NavLink,
    useLocation,
    useNavigate,
} from 'react-router-dom';

import {
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
} from 'react';

import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { WishlistContext } from '../../context/WishlistContext';

import './Header.css';

const MENU = [
    ['/', 'Trang chủ'],
    ['/sach', 'Cửa hàng'],
    ['/sale', 'Khuyến mãi'],
    ['/about', 'Về chúng tôi'],
    ['/lien-he', 'Liên hệ'],
];

// Icon SVG: không cần cài thư viện
function Icon({ name }) {
    const paths = {
        book: 'M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1ZM12 6v14',
        heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
        cart: 'M3 3h2l3 12h10l3-9H6M9 19h.01M18 19h.01',
        user: 'M20 21v-2a7 7 0 0 0-14 0v2M17 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
        down: 'm6 9 6 6 6-6',
        menu: 'M4 6h16M4 12h16M4 18h16',
        close: 'm6 6 12 12M18 6 6 18',
        admin: 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
        logout: 'M9 4H4v16h5M14 8l4 4-4 4M8 12h13',
        search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35', // Icon kính lúp
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={paths[name]} />
        </svg>
    );
}

export default function Header() {
    const { wishlist = [] } = useContext(WishlistContext);
    const { cart = [] } = useContext(CartContext);
    const { user, logout } = useContext(AuthContext);

    const navigate = useNavigate();
    const { pathname } = useLocation();

    const headerRef = useRef(null);
    const accountId = useId();
    const mobileId = useId();

    const [accountOpen, setAccountOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState(''); // State lưu từ khóa tìm kiếm

    // Kiểm tra quyền truy cập Admin (Admin hoặc Nhan_Vien)
    const userRole = user?.role || user?.vaiTro || user?.vai_tro;
    const hasAdminAccess = userRole === 'Admin' || userRole === 'Nhan_Vien';

    const totalItems = cart.reduce(
        (sum, item) => sum + Number(item.soMua || 0),
        0
    );

    const displayName = String(
        user?.ten || user?.email || 'Bạn'
    );

    const initials =
        displayName
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map((word) => word[0])
            .join('')
            .toUpperCase() || 'B';

    const closeMenus = () => {
        setAccountOpen(false);
        setMobileOpen(false);
    };

    // Hàm xử lý khi submit tìm kiếm
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchKeyword.trim()) {
            // Chuyển hướng sang trang cửa hàng (/sach) kèm theo URL parameter keyword
            navigate(`/sach?keyword=${encodeURIComponent(searchKeyword.trim())}`);
            closeMenus();
        }
    };

    // Đóng menu khi chuyển trang
    useEffect(() => {
        setAccountOpen(false);
        setMobileOpen(false);
    }, [pathname]);

    // Đóng menu khi bấm bên ngoài hoặc nhấn Escape
    useEffect(() => {
        const handleOutside = (e) => {
            if (!headerRef.current?.contains(e.target)) {
                setAccountOpen(false);
                setMobileOpen(false);
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                headerRef.current
                    ?.querySelector('button[aria-expanded="true"]')
                    ?.focus();

                setAccountOpen(false);
                setMobileOpen(false);
            }
        };

        document.addEventListener('pointerdown', handleOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener(
                'pointerdown',
                handleOutside
            );
            document.removeEventListener(
                'keydown',
                handleEscape
            );
        };
    }, []);

    const handleLogout = () => {
        closeMenus();
        logout();
        navigate('/');
    };

    const menuLinks = MENU.map(([to, label]) => (
        <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={closeMenus}
            className={({ isActive }) =>
                `bph-nav-link${isActive ? ' is-active' : ''}`
            }
        >
            {label}
        </NavLink>
    ));

    return (
        <header className="bph-header" ref={headerRef}>
            <div className="bph-container">
                {/* Logo */}
                <Link
                    to="/"
                    className="bph-brand"
                    onClick={closeMenus}
                >
                    <span className="bph-brand-icon">
                        <Icon name="book" />
                    </span>

                    <span className="bph-brand-copy">
                        <strong>
                            Book<span>Paradise</span>
                        </strong>
                        <small>Mở sách, mở thế giới</small>
                    </span>
                </Link>

                {/* Menu máy tính */}
                <nav
                    className="bph-desktop-nav"
                    aria-label="Menu chính"
                >
                    {menuLinks}
                </nav>

                {/* Thanh tìm kiếm trên máy tính */}
                <form className="bph-search-form is-desktop" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="bph-search-input"
                        placeholder="Tìm kiếm sách..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                    <button type="submit" className="bph-search-btn" aria-label="Tìm kiếm">
                        <Icon name="search" />
                    </button>
                </form>

                <div className="bph-tools">
                    {/* Yêu thích */}
                    <Link
                        to="/yeu-thich"
                        className="bph-icon-button"
                        onClick={closeMenus}
                        aria-label={`Yêu thích, ${wishlist.length} sản phẩm`}
                        title="Yêu thích"
                    >
                        <Icon name="heart" />

                        <span className="bph-badge">
                            {wishlist.length > 99
                                ? '99+'
                                : wishlist.length}
                        </span>
                    </Link>

                    {/* Giỏ hàng */}
                    <Link
                        to="/gio-hang"
                        className="bph-icon-button"
                        onClick={closeMenus}
                        aria-label={`Giỏ hàng, ${totalItems} sản phẩm`}
                        title="Giỏ hàng"
                    >
                        <Icon name="cart" />

                        <span className="bph-badge">
                            {totalItems > 99 ? '99+' : totalItems}
                        </span>
                    </Link>

                    {/* Tài khoản */}
                    <div className="bph-account">
                        {user ? (
                            <>
                                <button
                                    type="button"
                                    className="bph-account-button"
                                    aria-label="Tài khoản"
                                    aria-expanded={accountOpen}
                                    aria-controls={accountId}
                                    onClick={() => {
                                        setAccountOpen(!accountOpen);
                                        setMobileOpen(false);
                                    }}
                                >
                                    <span className="bph-avatar">
                                        {initials}
                                    </span>

                                    <span className="bph-account-label">
                                        Tài khoản
                                    </span>

                                    <span className="bph-account-chevron">
                                        <Icon name="down" />
                                    </span>
                                </button>

                                {accountOpen && (
                                    <div
                                        id={accountId}
                                        className="bph-account-panel"
                                    >
                                        <div className="bph-user-info">
                                            <small>Xin chào,</small>
                                            <strong>{displayName}</strong>

                                            {user.email &&
                                                user.email !== displayName && (
                                                    <span>{user.email}</span>
                                                )}
                                        </div>

                                        {/* NÚT TRANG QUẢN TRỊ - ĐÃ PHÂN QUYỀN */}
                                        {hasAdminAccess && (
                                            <Link
                                                to="/admin"
                                                className="bph-panel-item"
                                                onClick={closeMenus}
                                            >
                                                <Icon name="admin" />
                                                Trang quản trị
                                            </Link>
                                        )}

                                        <button
                                            type="button"
                                            className="bph-panel-item bph-logout"
                                            onClick={handleLogout}
                                        >
                                            <Icon name="logout" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link
                                to="/dang-nhap"
                                className="bph-login"
                                onClick={closeMenus}
                                aria-label="Đăng nhập"
                                title="Đăng nhập"
                            >
                                <Icon name="user" />
                                <span>Đăng nhập</span>
                            </Link>
                        )}
                    </div>

                    {/* Nút menu điện thoại */}
                    <button
                        type="button"
                        className="bph-menu-button"
                        aria-label={
                            mobileOpen ? 'Đóng menu' : 'Mở menu'
                        }
                        aria-expanded={mobileOpen}
                        aria-controls={mobileId}
                        onClick={() => {
                            setMobileOpen(!mobileOpen);
                            setAccountOpen(false);
                        }}
                    >
                        <Icon name={mobileOpen ? 'close' : 'menu'} />
                    </button>
                </div>
            </div>

            {/* Menu Dropdown Điện Thoại */}
            {mobileOpen && (
                <nav
                    id={mobileId}
                    className="bph-mobile-nav"
                    aria-label="Menu điện thoại"
                >
                    {/* Thanh tìm kiếm hiển thị trong menu trên điện thoại */}
                    <form className="bph-search-form is-mobile" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="bph-search-input"
                            placeholder="Tìm kiếm sách..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                        <button type="submit" className="bph-search-btn" aria-label="Tìm kiếm">
                            <Icon name="search" />
                        </button>
                    </form>

                    {menuLinks}
                </nav>
            )}
        </header>
    );
}