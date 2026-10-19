import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { createDonHang, createChiTietDonHang, applyVoucher } from '../../services/orderService';

const Checkout = () => {
    const { cart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [voucherCodeInput, setVoucherCodeInput] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherError, setVoucherError] = useState('');
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

    useEffect(() => {
        if (!user) {
            alert("Bạn cần đăng nhập để thanh toán!");
            navigate('/dang-nhap');
        } else if (cart.length === 0) {
            navigate('/sach');
        }
    }, [user, cart, navigate]);

    const tongTienGoc = cart.reduce((total, item) => total + (item.gia * item.soMua), 0);
    const soTienGiam = appliedVoucher ? appliedVoucher.soTienGiam : 0;
    const tongTienThanhToan = tongTienGoc - soTienGiam > 0 ? tongTienGoc - soTienGiam : 0;

    const handleApplyVoucher = async () => {
        if (!voucherCodeInput.trim()) return;
        setIsApplyingVoucher(true);
        setVoucherError('');
        try {
            const data = await applyVoucher(voucherCodeInput, tongTienGoc);
            setAppliedVoucher(data);
            setVoucherCodeInput('');
        } catch (err) {
            setVoucherError(err);
            setAppliedVoucher(null);
        } finally {
            setIsApplyingVoucher(false);
        }
    };

    const handleDatHang = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const donHangResult = await createDonHang(user.id || user.maNguoiDung, tongTienThanhToan, appliedVoucher?.code, soTienGiam);
            const newMaDonHang = donHangResult.maDonHang; 

            for (const item of cart) {
                // Đảm bảo gửi đúng item.gia (đã tính giá cộng thêm của biến thể)
                await createChiTietDonHang(newMaDonHang, item.maSach, item.soMua, item.gia);
            }

            clearCart();
            alert(`Đặt hàng thành công! Mã đơn hàng của bạn là #${newMaDonHang}`);
            navigate('/'); 
            
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
                <div className="lg:w-2/3 w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Thông tin giao hàng</h2>
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200">{error}</div>
                    )}

                    <form onSubmit={handleDatHang} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và Tên người nhận</label>
                            <input 
                                type="text" 
                                value={user.hoTen || user.email}
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

                <div className="lg:w-1/3 w-full bg-gray-50 rounded-xl shadow-inner border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
                    
                    <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                        {cart.map(item => (
                            <div key={item.cartId} className="flex gap-4 bg-white p-2 rounded-lg border border-gray-100">
                                {/* FIX LỖI ẢNH: Đã thêm https://localhost:7010 */}
                                <img 
                                    src={item.hinhAnh ? `https://localhost:7010${item.hinhAnh}` : "https://via.placeholder.com/60x80?text=Sách"} 
                                    alt={item.tenSach} 
                                    className="w-14 h-20 object-cover rounded border border-gray-200"
                                />
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800 text-sm line-clamp-2">{item.tenSach}</h4>
                                    
                                    {/* Hiển thị thêm biến thể nếu có */}
                                    {item.tenBienThe && (
                                        <p className="text-xs text-blue-600 font-medium mt-0.5">{item.tenBienThe}</p>
                                    )}
                                    
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-gray-500 text-xs">SL: {item.soMua}</p>
                                        <p className="text-red-600 font-bold text-sm">{(item.gia * item.soMua).toLocaleString('vi-VN')} đ</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mb-6 border-t border-b border-gray-200 py-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mã giảm giá</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Nhập mã (VD: SALE50)" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none uppercase"
                                value={voucherCodeInput}
                                onChange={e => setVoucherCodeInput(e.target.value.toUpperCase())}
                            />
                            <button 
                                type="button"
                                onClick={handleApplyVoucher}
                                disabled={isApplyingVoucher || !voucherCodeInput}
                                className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 disabled:bg-gray-400"
                            >
                                Áp dụng
                            </button>
                        </div>
                        {voucherError && <p className="text-red-500 text-xs mt-2">{voucherError}</p>}
                        
                        {appliedVoucher && (
                            <div className="mt-3 flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded-lg">
                                <span className="text-green-700 font-bold text-sm">Đã áp dụng mã: {appliedVoucher.code}</span>
                                <button type="button" onClick={() => setAppliedVoucher(null)} className="text-red-500 text-xs hover:underline">Gỡ bỏ</button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Tạm tính</span>
                            <span className="font-medium">{tongTienGoc.toLocaleString('vi-VN')} đ</span>
                        </div>
                        {appliedVoucher && (
                            <div className="flex justify-between text-green-600 font-medium text-sm">
                                <span>Giảm giá Voucher</span>
                                <span>- {soTienGiam.toLocaleString('vi-VN')} đ</span>
                            </div>
                        )}
                        <div className="flex justify-between items-end pt-3 border-t">
                            <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                            <span className="text-2xl font-bold text-red-600">{tongTienThanhToan.toLocaleString('vi-VN')} đ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;