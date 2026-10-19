import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { getDanhSachSach } from '../../services/sachService';

const API_URL = 'https://localhost:7010';

// Ảnh dự phòng dạng SVG nội bộ (không phụ thuộc via.placeholder.com)
const FALLBACK_IMG =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
            <rect width="300" height="400" fill="#f3f4f6"/>
            <g fill="none" stroke="#9ca3af" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M90 130h60a20 20 0 0 1 20 20v130a15 15 0 0 0-15-15H90z"/>
                <path d="M210 130h-60a20 20 0 0 0-20 20v130a15 15 0 0 1 15-15h65z"/>
            </g>
        </svg>`
    );

const HeartIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
        <div className="aspect-[3/4] rounded-xl bg-gray-200 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-5" />
        <div className="h-10 bg-gray-200 rounded-xl" />
    </div>
);

const Wishlist = () => {
    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [likedBooks, setLikedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addedId, setAddedId] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/dang-nhap');
            return;
        }

        const fetchLikedBooks = async () => {
            setLoading(true);
            try {
                const allBooks = await getDanhSachSach();
                setLikedBooks(allBooks.filter((sach) => wishlist.includes(sach.maSach)));
            } catch (error) {
                console.error('Lỗi tải danh sách sách:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedBooks();
    }, [user, wishlist, navigate]);

    const handleAddToCart = (sach) => {
        addToCart(sach, 1);
        setAddedId(sach.maSach);
        setTimeout(() => setAddedId((cur) => (cur === sach.maSach ? null : cur)), 1500);
    };

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Tiêu đề */}
            <div className="flex items-end justify-between gap-4 mb-8 pb-5 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <HeartIcon className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                            Sách yêu thích của bạn
                        </h1>
                        {!loading && likedBooks.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">{likedBooks.length} cuốn đã lưu</p>
                        )}
                    </div>
                </div>
                {!loading && likedBooks.length > 0 && (
                    <Link to="/sach" className="hidden sm:inline text-sm font-semibold text-red-600 hover:text-red-700">
                        Tiếp tục mua sắm
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : likedBooks.length === 0 ? (
                <div className="flex flex-col items-center text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-gray-300">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-300 mb-5">
                        <HeartIcon className="h-10 w-10" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có cuốn sách nào</h2>
                    <p className="text-gray-500 mb-7 max-w-sm">
                        Nhấn vào biểu tượng trái tim trên mỗi cuốn sách để lưu lại và xem sau.
                    </p>
                    <Link
                        to="/sach"
                        className="px-7 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition focus:outline-none focus:ring-4 focus:ring-red-200"
                    >
                        Khám phá sách
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {likedBooks.map((sach) => {
                        const added = addedId === sach.maSach;
                        return (
                            <div
                                key={sach.maSach}
                                className="group flex flex-col bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300"
                            >
                                {/* Ảnh bìa */}
                                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 mb-4">
                                    <img
                                        src={sach.hinhAnh ? `${API_URL}${sach.hinhAnh}` : FALLBACK_IMG}
                                        alt={sach.tenSach}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = FALLBACK_IMG;
                                        }}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                    <button
                                        onClick={() => toggleWishlist(sach.maSach)}
                                        title="Bỏ yêu thích"
                                        aria-label="Bỏ yêu thích"
                                        className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-md hover:bg-red-500 hover:text-white transition focus:outline-none focus:ring-4 focus:ring-red-200"
                                    >
                                        <HeartIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Thông tin */}
                                <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.75rem] mb-2">
                                    {sach.tenSach}
                                </h3>
                                <p className="text-lg font-extrabold text-red-600 mb-4">
                                    {(sach.gia || 0).toLocaleString('vi-VN')} đ
                                </p>

                                <button
                                    onClick={() => handleAddToCart(sach)}
                                    className={`mt-auto w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-4 ${
                                        added
                                            ? 'bg-green-600 focus:ring-green-200'
                                            : 'bg-gray-900 hover:bg-red-600 focus:ring-gray-300'
                                    }`}
                                >
                                    {added ? (
                                        'Đã thêm vào giỏ'
                                    ) : (
                                        <>
                                            <CartIcon />
                                            Thêm vào giỏ
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Wishlist;