import { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // Thêm useSearchParams
import { getDanhSachSach } from '../../services/sachService';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';

const Shop = () => {

    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext); 
    const [searchParams, setSearchParams] = useSearchParams(); // Khởi tạo hook đọc URL

    const [danhSachGoc, setDanhSachGoc] = useState([]);
    const [danhSachHienThi, setDanhSachHienThi] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lấy keyword từ URL (nếu có) để làm giá trị mặc định cho ô tìm kiếm
    const initialKeyword = searchParams.get('keyword') || '';
    const [searchTerm, setSearchTerm] = useState(initialKeyword);
    
    const [priceRange, setPriceRange] = useState('all');

    // Cập nhật lại searchTerm nếu URL thay đổi (Ví dụ: người dùng gõ tìm kiếm mới từ Header)
    useEffect(() => {
        const keywordFromUrl = searchParams.get('keyword') || '';
        setSearchTerm(keywordFromUrl);
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getDanhSachSach();
                setDanhSachGoc(data);
                setDanhSachHienThi(data);
                setLoading(false);
            } catch (err) {
                setError("Không thể tải dữ liệu, hãy kiểm tra lại Backend.");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let ketQuaLoc = [...danhSachGoc];

        if (searchTerm) {
            ketQuaLoc = ketQuaLoc.filter(sach => 
                sach.tenSach.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (priceRange === 'duoi100') {
            ketQuaLoc = ketQuaLoc.filter(sach => sach.gia < 100000);
        } else if (priceRange === '100den300') {
            ketQuaLoc = ketQuaLoc.filter(sach => sach.gia >= 100000 && sach.gia <= 300000);
        } else if (priceRange === 'tren300') {
            ketQuaLoc = ketQuaLoc.filter(sach => sach.gia > 300000);
        }

        setDanhSachHienThi(ketQuaLoc);
    }, [searchTerm, priceRange, danhSachGoc]);

    // Hàm xử lý gõ tìm kiếm trực tiếp trong ô input của trang Shop
    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Cập nhật URL (để copy link gửi người khác vẫn giữ được kết quả tìm kiếm)
        if (value) {
            setSearchParams({ keyword: value });
        } else {
            setSearchParams({});
        }
    };

    const handleResetFilter = () => {
        setSearchTerm('');
        setPriceRange('all');
        setSearchParams({}); // Xóa keyword trên URL
    };

    if (loading) return <div className="flex justify-center items-center min-h-[50vh] text-lg font-medium text-gray-600">Đang tải dữ liệu sách...</div>;
    if (error) return <div className="text-center text-red-500 mt-10 font-medium">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Cửa Hàng Sách</h1>
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* ============ CỘT TRÁI: SIDEBAR BỘ LỌC ============ */}
                <div className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0 space-y-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Bộ Lọc</h2>
                            <button 
                                onClick={handleResetFilter}
                                className="text-sm text-red-600 hover:text-red-800 underline"
                            >
                                Xóa lọc
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm tên sách</label>
                            <input 
                                type="text"
                                placeholder="Nhập tên sách..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                value={searchTerm}
                                onChange={handleSearchInput}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá</label>
                            <div className="space-y-3">
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="price" 
                                        value="all"
                                        checked={priceRange === 'all'}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-700">Tất cả các mức giá</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="price" 
                                        value="duoi100"
                                        checked={priceRange === 'duoi100'}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-700">Dưới 100.000 đ</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="price" 
                                        value="100den300"
                                        checked={priceRange === '100den300'}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-700">100.000 đ - 300.000 đ</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="price" 
                                        value="tren300"
                                        checked={priceRange === 'tren300'}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-700">Trên 300.000 đ</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============ CỘT PHẢI: LƯỚI SẢN PHẨM ============ */}
                <div className="w-full md:w-3/4 lg:w-4/5">
                    <div className="mb-4 text-gray-600 font-medium">
                        Hiển thị {danhSachHienThi.length} kết quả {searchTerm && <span className="text-red-500 italic">cho "{searchTerm}"</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {danhSachHienThi.length === 0 ? (
                            <div className="col-span-full py-10 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-2">Không tìm thấy sách nào phù hợp với điều kiện lọc.</p>
                                <button onClick={handleResetFilter} className="text-red-600 font-medium hover:underline">Xóa điều kiện lọc</button>
                            </div>
                        ) : (
                            danhSachHienThi.map((sach) => (
                                <div key={sach.maSach} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group flex flex-col h-full hover:shadow-md transition">
                                    
                                    {/* =========== NÚT THẢ TIM =========== */}
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault(); 
                                            toggleWishlist(sach.maSach);
                                        }}
                                        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition duration-300"
                                        title="Thêm vào yêu thích"
                                    >
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className={`h-6 w-6 transition-colors duration-300 ${isInWishlist(sach.maSach) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`} 
                                            fill={isInWishlist(sach.maSach) ? "currentColor" : "none"} 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>

                                    {/* =========== NỘI DUNG SÁCH =========== */}
                                    <Link to={`/sach/${sach.maSach}`} className="flex flex-col h-full">
                                        <div className="relative pt-[130%] bg-gray-50 overflow-hidden">
                                            <img 
                                                src={sach.hinhAnh ? `https://localhost:7010${sach.hinhAnh}` : "https://via.placeholder.com/300x400?text=Sách"} 
                                                alt={sach.tenSach} 
                                                className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-4 flex flex-col flex-grow">
                                            <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-red-600 transition flex-grow">
                                                {sach.tenSach}
                                            </h3>
                                            <p className="text-red-600 font-bold text-lg mb-2">
                                                {(sach.gia || 0).toLocaleString('vi-VN')} đ
                                            </p>
                                            <p className="text-xs text-gray-500 mb-2">
                                                Kho: <span className={sach.soLuong > 0 ? "text-green-600" : "text-red-500"}>{sach.soLuong}</span>
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Nút Thêm vào giỏ hàng */}
                                    <div className="px-4 pb-4 mt-auto">
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (sach.soLuong > 0) {
                                                    addToCart(sach, 1);
                                                    alert(`Đã thêm "${sach.tenSach}" vào giỏ hàng!`);
                                                }
                                            }}
                                            disabled={sach.soLuong <= 0}
                                            className={`w-full py-2 rounded-lg font-medium transition ${
                                                sach.soLuong > 0 
                                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            Thêm vào giỏ
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;