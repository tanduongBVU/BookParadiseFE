import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { getDanhSachSach } from '../../services/sachService'; // API lấy toàn bộ sách của bạn

const Wishlist = () => {
    const { wishlist, toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [likedBooks, setLikedBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/dang-nhap');
            return;
        }

        const fetchLikedBooks = async () => {
            setLoading(true);
            try {
                // Lấy toàn bộ sách từ DB
                const allBooks = await getDanhSachSach();
                // Chỉ lọc ra những cuốn sách có mã nằm trong mảng wishlist
                const filteredBooks = allBooks.filter(sach => wishlist.includes(sach.maSach));
                setLikedBooks(filteredBooks);
            } catch (error) {
                console.error("Lỗi tải danh sách sách:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedBooks();
    }, [user, wishlist, navigate]); // Tự động load lại nếu wishlist thay đổi

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <h1 className="text-3xl font-bold text-gray-900">Sách Yêu Thích Của Bạn</h1>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Đang tải danh sách...</div>
            ) : likedBooks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 mb-6 text-lg">Bạn chưa có cuốn sách yêu thích nào.</p>
                    <Link to="/sach" className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Khám phá ngay</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {likedBooks.map((sach) => (
                        <div key={sach.maSach} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group p-4 flex flex-col">
                            {/* Nút Hủy Thả Tim */}
                            <button 
                                onClick={() => toggleWishlist(sach.maSach)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 shadow text-red-500 hover:text-gray-400 transition"
                                title="Bỏ yêu thích"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            </button>

                            <img src={sach.hinhAnh || "https://via.placeholder.com/150x200?text=Sách"} alt={sach.tenSach} className="w-full h-48 object-cover rounded-md mb-4" />
                            
                            <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 flex-1">{sach.tenSach}</h3>
                            <p className="text-red-600 font-bold mb-4">{(sach.gia || 0).toLocaleString('vi-VN')} đ</p>
                            
                            <button 
                                onClick={() => {
                                    addToCart(sach, 1);
                                    alert("Đã thêm vào giỏ!");
                                }}
                                className="w-full bg-gray-900 hover:bg-black text-white py-2 rounded font-medium transition"
                            >
                                Thêm vào giỏ
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;