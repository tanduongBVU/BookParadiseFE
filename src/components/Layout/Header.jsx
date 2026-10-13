import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext'; // <--- Import thêm

const Header = () => {
    const { cart } = useContext(CartContext);
    const { user, logout } = useContext(AuthContext); // <--- Lấy user và hàm logout
    const navigate = useNavigate();
    
    const totalItems = cart.reduce((total, item) => total + item.soMua, 0);

    const handleLogout = () => {
        logout();
        navigate('/'); // Thoát xong về trang chủ
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-bold text-red-600 hover:text-red-700">
                            BookParadise
                        </Link>
                    </div>
                    
                    <nav className="hidden md:flex space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-red-600 px-3 py-2 font-medium transition">Trang Chủ</Link>
                        <Link to="/sach" className="text-gray-700 hover:text-red-600 px-3 py-2 font-medium transition">Cửa Hàng</Link>
                    </nav>
                    
                    <div className="flex items-center space-x-6">
                        {/* Giỏ hàng */}
                        <Link to="/gio-hang" className="flex items-center text-gray-700 hover:text-red-600 transition relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-sm">
                                {totalItems}
                            </span>
                        </Link>

                        {/* Xử lý hiển thị Đăng nhập / Đã đăng nhập */}
                        <div className="border-l border-gray-300 pl-6 hidden sm:flex items-center">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">
                                        Xin chào, <b className="text-gray-900">{user.ten || user.email || 'Bạn'}</b>
                                    </span>
                                    {/* Nếu là admin, hiện thêm nút Trang Quản trị */}
                                    {user.role === 'Admin' && (
                                        <Link to="/admin" className="text-sm font-medium text-blue-600 hover:underline">
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button 
                                        onClick={handleLogout}
                                        className="text-sm font-medium text-red-500 hover:text-red-700 transition"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            ) : (
                                <Link 
                                    to="/dang-nhap" 
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold transition"
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