import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { createDonHang, createChiTietDonHang } from '../../services/orderService';

const Checkout = () => {
    const { cart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Bắt buộc phải đăng nhập và có hàng trong giỏ mới được vào trang này
    useEffect(() => {
        if (!user) {
            alert("Bạn cần đăng nhập để thanh toán!");
            navigate('/dang-nhap');
        } else if (cart.length === 0) {
            navigate('/sach');
        }
    }, [user, cart, navigate]);

    const tongTien = cart.reduce((total, item) => total + (item.gia * item.soMua), 0);

    // Xử lý luồng đặt hàng
    const handleDatHang = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Tạo Đơn Hàng tổng
            const donHangResult = await createDonHang(user.id, tongTien);
            const newMaDonHang = donHangResult.maDonHang; // Lấy ID vừa được C# sinh ra

            // 2. Lặp qua giỏ hàng và tạo từng Chi Tiết Đơn Hàng
            for (const item of cart) {
                await createChiTietDonHang(
                    newMaDonHang, 
                    item.maSach, 
                    item.soMua, 
                    item.gia
                );
            }

            // 3. Xử lý thành công
            clearCart();
            alert(`Đặt hàng thành công! Mã đơn hàng của bạn là #${newMaDonHang}`);
            navigate('/'); // Trở về trang chủ
            
        } catch (err) {
            setError(err || "Có lỗi xảy ra trong quá trình đặt hàng.");
        } finally {
            setLoading(false);
        }
    };

    if (!user || cart.length === 0) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Thanh Toán</h1>
            
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Form thông tin người nhận (Hiện tại là Thanh toán khi nhận hàng) */}
                <div className="lg:w-2/3 w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Thông tin giao hàng</h2>
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleDatHang} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và Tên người nhận</label>
                            <input 
                                type="text" 
                                value={user.ten || user.email} // Lấy sẵn tên từ tài khoản
                                disabled
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
                            <div className="border border-red-500 bg-red-50 rounded-lg p-4 flex items-center gap-3">
                                <input type="radio" checked readOnly className="h-5 w-5 text-red-600" />
                                <span className="font-bold text-red-700">Thanh toán tiền mặt khi nhận hàng (COD)</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full py-4 rounded-xl text-white font-bold text-lg transition shadow-lg flex justify-center items-center ${loading ? 'bg-red-400 cursor-wait' : 'bg-red-600 hover:bg-red-700 active:scale-95'}`}
                            >
                                {loading ? 'Đang xử lý đặt hàng...' : 'Xác nhận Đặt Hàng'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tóm tắt đơn hàng bên phải */}
                <div className="lg:w-1/3 w-full bg-gray-50 rounded-xl shadow-inner border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
                    
                    <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                        {cart.map(item => (
                            <div key={item.maSach} className="flex gap-4">
                                <img 
                                    src={item.hinhAnh || "https://via.placeholder.com/60x80?text=Sách"} 
                                    alt={item.tenSach} 
                                    className="w-16 h-20 object-cover rounded border border-gray-200"
                                />
                                <div>
                                    <h4 className="font-medium text-gray-800 text-sm line-clamp-2">{item.tenSach}</h4>
                                    <p className="text-gray-500 text-xs mt-1">SL: {item.soMua}</p>
                                    <p className="text-red-600 font-bold text-sm mt-1">{(item.gia * item.soMua).toLocaleString('vi-VN')} đ</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Tạm tính</span>
                            <span>{tongTien.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Phí giao hàng</span>
                            <span className="text-green-600 font-medium">Miễn phí</span>
                        </div>
                        <div className="flex justify-between items-end pt-3 border-t">
                            <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                            <span className="text-2xl font-bold text-red-600">{tongTien.toLocaleString('vi-VN')} đ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;