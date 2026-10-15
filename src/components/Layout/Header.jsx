import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { WishlistContext } from '../../context/WishlistContext';

const Header = () => {
    const { wishlist } = useContext(WishlistContext);
    const { cart } = useContext(CartContext);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const totalItems = cart.reduce((total, item) => total + item.soMua, 0);

    const handleLogout = () => {
        logout();
        navigate('/'); 
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-bold text-red-600 hover:text-red-700 whitespace-nowrap">
                            BookParadise
                        </Link>
                    </div>
                    
                    {/* Menu chính - Thêm whitespace-nowrap để không bị rớt dòng chữ */}
                    <nav className="hidden md:flex space-x-2 lg:space-x-6 items-center">
                        <Link to="/" className="text-gray-700 hover:text-red-600 px-2 lg:px-3 py-2 font-medium transition whitespace-nowrap">Trang Chủ</Link>
                        <Link to="/sach" className="text-gray-700 hover:text-red-600 px-2 lg:px-3 py-2 font-medium transition whitespace-nowrap">Cửa Hàng</Link>
                        <Link to="/sale" className="text-gray-700 hover:text-blue-600 px-2 lg:px-3 py-2 font-medium transition whitespace-nowrap">Khuyến mãi</Link>
                        <Link to="/about" className="text-gray-700 hover:text-green-600 px-2 lg:px-3 py-2 font-medium transition whitespace-nowrap">Về Chúng Tôi</Link>
                        <Link to="/lien-he" className="text-gray-700 hover:text-orange-600 px-2 lg:px-3 py-2 font-medium transition whitespace-nowrap">Liên Hệ</Link>
                    </nav>
                    
                    <div className="flex items-center space-x-4 lg:space-x-6">
                        
                        {/* Icon Yêu Thích */}
                        <Link to="/yeu-thich" className="flex items-center text-gray-700 hover:text-red-600 transition relative mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full text-sm">
                                {wishlist.length}
                            </span>
                        </Link>
                        
                        {/* Icon Giỏ hàng */}
                        <Link to="/gio-hang" className="flex items-center text-gray-700 hover:text-red-600 transition relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-sm">
                                {totalItems}
                            </span>
                        </Link>

                        {/* Phân hệ User - Thêm whitespace-nowrap */}
                        <div className="border-l border-gray-300 pl-4 lg:pl-6 hidden sm:flex items-center">
                            {user ? (
                                <div className="flex items-center space-x-3 lg:space-x-4">
                                    <span className="text-sm text-gray-600 whitespace-nowrap">
                                        Xin chào, <b className="text-gray-900">{user.ten || user.email || 'Bạn'}</b>
                                    </span>
                                    {user.role === 'Admin' && (
                                        <Link to="/admin" className="text-sm font-medium text-blue-600 hover:underline whitespace-nowrap">
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button 
                                        onClick={handleLogout}
                                        className="text-sm font-medium text-red-500 hover:text-red-700 transition whitespace-nowrap"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            ) : (
                                <Link 
                                    to="/dang-nhap" 
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap"
                                >
                                    Đăng nhập
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;