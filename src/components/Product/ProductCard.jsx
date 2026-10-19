import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

const ProductCard = ({ data }) => {
    if (!data || data.hienThi === false) return null;

    const isAvailable = data.soLuong > 0;
    const { addToCart } = useContext(CartContext);
    
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
            {/* Vùng Ảnh */}
            <div className="relative h-64 overflow-hidden bg-gray-100">
                {/* FIX LỖI ẢNH: Sử dụng đường dẫn từ database kết hợp với URL Backend */}
                <img 
                    src={data.hinhAnh ? `https://localhost:7010${data.hinhAnh}` : "https://via.placeholder.com/300x400?text=Chưa+có+ảnh"} 
                    alt={data.tenSach} 
                    className="w-full h-full object-cover object-center"
                />
                {!isAvailable && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Hết hàng
                    </div>
                )}
            </div>
            
            {/* Vùng Thông tin */}
            <div className="p-4 flex flex-col flex-grow">
                <Link to={`/sach/${data.maSach}`} className="block mt-1 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 hover:text-red-600" title={data.tenSach}>
                        {data.tenSach || "Đang cập nhật tên"}
                    </h3>
                </Link>
                
                <div className="mt-auto">
                    <p className="text-xl font-bold text-red-600 mb-1">
                        {data.gia ? data.gia.toLocaleString('vi-VN') : '0'} đ
                    </p>
                    <p className={`text-sm mb-4 ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                        {isAvailable ? `Kho: ${data.soLuong}` : 'Tạm hết hàng'}
                    </p>
                    
                    <button 
                        disabled={!isAvailable}
                        onClick={() => {
                            addToCart(data, 1);
                            alert("Đã thêm vào giỏ!");
                        }}
                        className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                            isAvailable 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isAvailable ? 'Thêm vào giỏ' : 'Hết hàng'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;