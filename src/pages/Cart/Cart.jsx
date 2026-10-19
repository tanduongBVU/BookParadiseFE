import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

const Cart = () => {
    // Lấy dữ liệu và các hàm xử lý từ Context
    const { cart, updateQuantity, removeFromCart } = useContext(CartContext);
    const navigate = useNavigate();

    // Tính tổng tiền toàn bộ giỏ hàng
    const totalPrice = cart.reduce((total, item) => total + (item.gia * item.soMua), 0);

    // Xử lý tăng số lượng (không vượt quá số lượng tồn kho)
    const handleIncrease = (item) => {
        if (item.soMua < item.soLuong) {
            updateQuantity(item.cartId, item.soMua + 1);
        } else {
            alert(`Sản phẩm này chỉ còn tối đa ${item.soLuong} cuốn trong kho!`);
        }
    };

    // Xử lý giảm số lượng (tối thiểu là 1)
    const handleDecrease = (item) => {
        if (item.soMua > 1) {
            updateQuantity(item.cartId, item.soMua - 1);
        }
    };

    // Giao diện khi giỏ hàng trống
    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="bg-white rounded-2xl shadow-sm p-10 max-w-lg mx-auto border border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng của bạn đang trống</h2>
                    <p className="text-gray-500 mb-8">Có vẻ như bạn chưa chọn mua cuốn sách nào. Hãy dạo quanh cửa hàng để tìm những cuốn sách thú vị nhé!</p>
                    <Link to="/sach" className="inline-block bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ Hàng Của Bạn</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* =========== CỘT TRÁI: DANH SÁCH SẢN PHẨM =========== */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Tiêu đề bảng */}
                        <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                            <div className="col-span-6">Sản phẩm</div>
                            <div className="col-span-2 text-center">Đơn giá</div>
                            <div className="col-span-2 text-center">Số lượng</div>
                            <div className="col-span-2 text-right">Tạm tính</div>
                        </div>

                        {/* Danh sách Item */}
                        <div className="divide-y divide-gray-200">
                            {cart.map((item) => (
                                <div key={item.cartId} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 items-center">
                                    {/* Cột Sản phẩm (Hình + Tên) */}
                                    <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                                        <button 
                                            onClick={() => removeFromCart(item.cartId)}
                                            className="text-gray-400 hover:text-red-500 transition hidden sm:block"
                                            title="Xóa khỏi giỏ"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        
                                        {/* Hình ảnh */}
                                        <img 
                                            src={item.hinhAnh ? `https://localhost:7010${item.hinhAnh}` : "https://via.placeholder.com/100x120?text=Sách"} 
                                            alt={item.tenSach} 
                                            className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded border border-gray-200"
                                        />
                                        <div className="flex-1">
                                            <Link to={`/sach/${item.maSach}`} className="font-semibold text-gray-800 hover:text-red-600 line-clamp-2">
                                                {item.tenSach}
                                            </Link>
                                            
                                            {/* Hiển thị thêm tên phân loại/biến thể nếu có */}
                                            {item.tenBienThe && (
                                                <span className="text-sm text-gray-500 block mt-1">Phân loại: {item.tenBienThe}</span>
                                            )}
                                            
                                            {/* Hiện nút xóa ở giao diện Mobile */}
                                            <button 
                                                onClick={() => removeFromCart(item.cartId)}
                                                className="text-sm text-red-500 hover:underline mt-1 sm:hidden block"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>

                                    {/* Cột Đơn giá */}
                                    <div className="col-span-1 sm:col-span-2 text-left sm:text-center font-medium text-gray-600">
                                        <span className="sm:hidden text-gray-500 font-normal mr-2">Đơn giá:</span>
                                        {item.gia ? item.gia.toLocaleString('vi-VN') : '0'} đ
                                    </div>

                                    {/* Cột Số lượng */}
                                    <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                                        <div className="flex items-center border border-gray-300 rounded bg-white w-max">
                                            <button onClick={() => handleDecrease(item)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition">-</button>
                                            <span className="px-3 py-1 font-medium border-x border-gray-300 min-w-[2.5rem] text-center text-sm">{item.soMua}</span>
                                            <button onClick={() => handleIncrease(item)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition">+</button>
                                        </div>
                                    </div>

                                    {/* Cột Thành tiền */}
                                    <div className="col-span-1 sm:col-span-2 text-left sm:text-right font-bold text-red-600">
                                        <span className="sm:hidden text-gray-500 font-normal mr-2 text-sm">Thành tiền:</span>
                                        {(item.gia * item.soMua).toLocaleString('vi-VN')} đ
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* =========== CỘT PHẢI: TÓM TẮT ĐƠN HÀNG =========== */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Cộng giỏ hàng</h2>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span className="font-medium">{totalPrice.toLocaleString('vi-VN')} đ</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí giao hàng</span>
                                <span>(Tính lúc thanh toán)</span>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <div className="flex justify-between items-end">
                                <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                <span className="text-2xl font-bold text-red-600">{totalPrice.toLocaleString('vi-VN')} đ</span>
                            </div>
                        </div>
                        
                        {/* Nút tiến hành thanh toán */}
                        <Link 
                            to="/thanh-toan"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow transition text-lg block text-center mt-6"
                        >
                            Tiến hành thanh toán
                        </Link>
                        
                        <div className="mt-4 text-center">
                            <Link to="/sach" className="text-red-600 font-medium hover:underline flex items-center justify-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                Tiếp tục mua sách
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;