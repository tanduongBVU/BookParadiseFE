// Cập nhật các import
import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSachById } from '../../services/sachService';
import { CartContext } from '../../context/CartContext';
const ProductDetail = () => {
    // Lấy tham số 'id' từ URL (vì trong App.jsx ta cấu hình Route là /sach/:id)
    const { id } = useParams(); 
    
    const [sach, setSach] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1); // Quản lý số lượng muốn mua
    

    // Gọi API khi vừa vào trang hoặc khi 'id' thay đổi
    useEffect(() => {
        const fetchChiTiet = async () => {
            try {
                // Đặt lại state trước khi gọi
                setLoading(true); 
                const data = await getSachById(id);
                setSach(data);
                setLoading(false);
            } catch (err) {
                setError("Không tìm thấy thông tin sách hoặc có lỗi từ server.");
                setLoading(false);
            }
        };
        fetchChiTiet();
    }, [id]);

    // Xử lý tăng/giảm số lượng mua
    const handleIncrease = () => {
        if (sach && quantity < sach.soLuong) setQuantity(prev => prev + 1);
    };
    const handleDecrease = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    // Hiển thị lúc chờ dữ liệu
    if (loading) return <div className="flex justify-center items-center min-h-[50vh] text-lg font-medium text-gray-600">Đang tải thông tin...</div>;
    // Hiển thị lúc lỗi
    if (error || !sach) return <div className="text-center text-red-500 mt-10 text-lg">{error}</div>;

    const isAvailable = sach.soLuong > 0;
    // Thêm dòng này để gọi hàm
    const { addToCart } = useContext(CartContext);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Thanh điều hướng (Breadcrumb) */}
            <nav className="mb-6 text-sm flex items-center">
                <Link to="/" className="text-gray-500 hover:text-red-600 transition">Trang chủ</Link>
                <span className="mx-2 text-gray-400">/</span>
                <Link to="/sach" className="text-gray-500 hover:text-red-600 transition">Cửa hàng</Link>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-800 font-medium truncate">{sach.tenSach}</span>
            </nav>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row gap-10">
                
                {/* Cột trái: Hình ảnh */}
                <div className="md:w-2/5 flex-shrink-0">
                    <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 aspect-[3/4]">
                        <img 
                            src={sach.hinhAnh || "https://via.placeholder.com/600x800?text=Chưa+có+ảnh"} 
                            alt={sach.tenSach} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Cột phải: Thông tin */}
                <div className="md:w-3/5 flex flex-col">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{sach.tenSach}</h1>
                    
                    <p className="text-3xl font-bold text-red-600 mb-6">
                        {sach.gia ? sach.gia.toLocaleString('vi-VN') : '0'} đ
                    </p>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Mô tả sản phẩm:</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-100">
                            {sach.moTa || "Chưa có mô tả cho sản phẩm này."}
                        </p>
                    </div>

                    <div className="mb-6 flex items-center gap-4">
                        <span className="text-gray-700 font-medium">Tình trạng:</span>
                        {isAvailable ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                Còn hàng ({sach.soLuong} cuốn)
                            </span>
                        ) : (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                                Hết hàng
                            </span>
                        )}
                    </div>

                    {/* Vùng chọn số lượng và nút mua */}
                    <div className="mt-auto">
                        {isAvailable ? (
                            <div className="flex flex-wrap gap-4 items-end">
                                <div>
                                    <p className="text-gray-700 font-medium mb-2">Số lượng:</p>
                                    <div className="flex items-center border border-gray-300 rounded-md bg-white">
                                        <button onClick={handleDecrease} className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-l-md transition text-lg leading-none">-</button>
                                        <span className="px-4 py-2 font-medium border-x border-gray-300 min-w-[3.5rem] text-center">{quantity}</span>
                                        <button onClick={handleIncrease} className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-r-md transition text-lg leading-none">+</button>
                                    </div>
                                </div>

                                <button 
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-md flex justify-center items-center gap-2 h-[50px]"
                                    onClick={() => addToCart(sach, quantity)} // Thêm đúng số lượng user đang chọn
                                >
                                    Thêm vào giỏ
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-100 text-gray-500 rounded-lg text-center font-medium border border-gray-200">
                                Sản phẩm hiện đang tạm hết hàng, vui lòng quay lại sau!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;