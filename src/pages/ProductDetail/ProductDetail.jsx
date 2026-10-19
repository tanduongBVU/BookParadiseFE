import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSachById } from '../../services/sachService';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';

const ProductDetail = () => {
    const { id } = useParams(); 
    
    const [sach, setSach] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1); 
    
    // State lưu biến thể đang chọn
    const [selectedVariant, setSelectedVariant] = useState(null);

    const { user } = useContext(AuthContext); 
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const fetchChiTiet = async () => {
        try {
            setLoading(true); 
            const data = await getSachById(id);
            setSach(data);
            
            // Nếu sách có biến thể, tự động chọn biến thể đầu tiên làm mặc định
            if (data.cacBienThe && data.cacBienThe.length > 0) {
                setSelectedVariant(data.cacBienThe[0]);
            }
            
            setLoading(false);
        } catch (err) {
            setError("Không tìm thấy thông tin sách hoặc có lỗi từ server.");
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`https://localhost:7010/api/sach/${id}/binhluan`);
            if (res.ok) setComments(await res.json());
        } catch (err) { console.error("Lỗi tải bình luận", err); }
    };

    useEffect(() => {
        fetchChiTiet();
        fetchComments();
    }, [id]);

    // Lấy tồn kho của biến thể (nếu có), ngược lại lấy của sách gốc
    const currentStock = selectedVariant ? selectedVariant.soLuong : (sach?.soLuong || 0);
    const isAvailable = currentStock > 0;

    const handleIncrease = () => {
        if (sach && quantity < currentStock) setQuantity(prev => prev + 1);
    };
    const handleDecrease = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!user) return alert("Bạn cần đăng nhập để bình luận!");
        if (!newComment.trim()) return;

        try {
            const res = await fetch('https://localhost:7010/api/binhluan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maNguoiDung: user.id || user.maNguoiDung, maSach: parseInt(id), noiDung: newComment })
            });
            if (res.ok) {
                alert("Bình luận của bạn đã được gửi và đang chờ Admin duyệt!");
                setNewComment("");
            }
        } catch (error) { alert("Lỗi gửi bình luận"); }
    };

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]">Đang tải thông tin...</div>;
    if (error || !sach) return <div className="text-center text-red-500 mt-10">{error}</div>;

    const { addToCart } = useContext(CartContext);
    
    // Tính giá hiển thị = giá gốc + giá biến thể
    const displayPrice = sach.gia + (selectedVariant ? selectedVariant.giaCongThem : 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="mb-6 text-sm flex items-center">
                <Link to="/" className="text-gray-500 hover:text-red-600 transition">Trang chủ</Link>
                <span className="mx-2 text-gray-400">/</span>
                <Link to="/sach" className="text-gray-500 hover:text-red-600 transition">Cửa hàng</Link>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-800 font-medium truncate">{sach.tenSach}</span>
            </nav>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row gap-10">
                <div className="md:w-2/5 flex-shrink-0">
                    <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 aspect-[3/4]">
                        <img src={sach.hinhAnh ? `https://localhost:7010${sach.hinhAnh}` : "https://via.placeholder.com/600x800"} alt={sach.tenSach} className="w-full h-full object-cover" />
                    </div>
                </div>

                <div className="md:w-3/5 flex flex-col">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{sach.tenSach}</h1>
                    <p className="text-3xl font-bold text-red-600 mb-6">{displayPrice.toLocaleString('vi-VN')} đ</p>

                    {/* KHU VỰC CHỌN BIẾN THỂ */}
                    {sach.cacBienThe && sach.cacBienThe.length > 0 && (
                        <div className="mb-6 border-t border-b py-4 border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3">Tùy chọn phiên bản:</h3>
                            <div className="flex flex-wrap gap-3">
                                {sach.cacBienThe.map(bt => (
                                    <button 
                                        key={bt.maBienThe}
                                        onClick={() => { setSelectedVariant(bt); setQuantity(1); }}
                                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
                                            selectedVariant?.maBienThe === bt.maBienThe 
                                            ? 'border-red-600 text-red-600 bg-red-50' 
                                            : 'border-gray-300 text-gray-700 hover:border-red-400'
                                        }`}
                                    >
                                        {bt.tenBienThe} {bt.giaCongThem > 0 && `(+${bt.giaCongThem.toLocaleString('vi-VN')}đ)`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Mô tả sản phẩm:</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-100">{sach.moTa}</p>
                    </div>

                    <div className="mb-6 flex items-center gap-4">
                        <span className="text-gray-700 font-medium">Tình trạng:</span>
                        {isAvailable ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">Còn hàng ({currentStock} cuốn)</span>
                        ) : (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">Hết hàng</span>
                        )}
                    </div>

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
                                {/* Truyền selectedVariant vào hàm addToCart */}
                                <button onClick={() => addToCart(sach, quantity, selectedVariant)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-md h-[50px]">
                                    Thêm vào giỏ
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-100 text-gray-500 rounded-lg text-center font-medium border border-gray-200">Sản phẩm tạm hết hàng!</div>
                        )}
                    </div>
                </div>
            </div>

            {/* KHU VỰC BÌNH LUẬN (Giữ nguyên) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 mt-8">
                {/* ... (Code bình luận của bạn giữ nguyên, tôi thu gọn để dễ nhìn) ... */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Đánh giá sản phẩm</h2>
                <div className="mb-8">
                    {user ? (
                        <form onSubmit={handleSubmitComment}>
                            <textarea className="w-full border border-gray-300 rounded-lg p-4" rows="3" placeholder="Chia sẻ cảm nhận..." value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
                            <div className="flex justify-end mt-2"><button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">Gửi đánh giá</button></div>
                        </form>
                    ) : ( <p className="text-gray-600">Vui lòng <Link to="/login" className="text-blue-600">Đăng nhập</Link></p> )}
                </div>
                <div className="space-y-4">
                    {comments.map((cmt, index) => (
                        <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                            <div>
                                <span className="font-bold text-gray-800">{cmt.tenNguoiDung}</span>
                                <p className="text-gray-700">{cmt.noiDung}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default ProductDetail;