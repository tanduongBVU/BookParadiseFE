import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SalePage = () => {
    const [saleBooks, setSaleBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSaleBooks = async () => {
            try {
                const response = await fetch('https://localhost:7010/api/sale');
                if (response.ok) {
                    const data = await response.json();
                    setSaleBooks(data);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang Sale:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSaleBooks();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
                <div className="text-xl font-medium text-gray-500 animate-pulse">Đang tải ưu đãi...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <span className="text-5xl mb-4 block animate-bounce">🔥</span>
                    <h1 className="text-4xl font-extrabold text-red-600 mb-4 uppercase tracking-wider">
                        Siêu Khuyến Mãi
                    </h1>
                    <p className="text-gray-600">Những tựa sách hot nhất đang được giảm giá cực sốc tại BookParadise.</p>
                </div>

                {saleBooks.length === 0 ? (
                    <div className="text-center bg-white p-10 rounded-xl shadow-sm">
                        <span className="text-6xl mb-4 block">🎁</span>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có chương trình nào diễn ra</h2>
                        <p className="text-gray-500 mb-6">Bạn hãy quay lại sau nhé, các deal hời đang được hệ thống chuẩn bị!</p>
                        <Link to="/sach" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {saleBooks.map((book) => {
                            // Đã sửa lại công thức tính toán
                            const phanTramGiam = book.khuyenMai ? book.khuyenMai.phanTramGiam : 0;
                            const giaSauGiam = book.gia - (book.gia * phanTramGiam / 100);

                            return (
                                <div key={book.maSach} className="bg-white rounded-xl shadow hover:shadow-xl transition-shadow duration-300 overflow-hidden relative flex flex-col">
                                    
                                    {phanTramGiam > 0 && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                                            -{phanTramGiam}%
                                        </div>
                                    )}

                                    <Link to={`/sach/${book.maSach}`} className=" flex group h-48 items-center justify-center overflow-hidden bg-gray-100 relative">
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 z-10"></div>
                                        {book.hinhAnh ? (
                                            <img src={`https://localhost:7010${book.hinhAnh}`} alt={book.tenSach} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm border-2 border-gray-300 p-2 rounded text-gray-400">Chưa có ảnh</span>
                                        )}
                                    </Link>

                                    <div className="p-4 flex flex-col flex-grow">
                                        <Link to={`/sach/${book.maSach}`}>
                                            <h3 className="font-bold text-gray-800 mb-1 hover:text-blue-600 line-clamp-2" title={book.tenSach}>
                                                {book.tenSach}
                                            </h3>
                                        </Link>
                                        
                                        <div className="mt-auto pt-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-lg font-bold text-red-600 block">
                                                        {giaSauGiam.toLocaleString('vi-VN')} đ
                                                    </span>
                                                    {phanTramGiam > 0 && (
                                                        <span className="text-sm text-gray-400 line-through">
                                                            {book.gia.toLocaleString('vi-VN')} đ
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 pt-0">
                                        <Link 
                                            to={`/sach/${book.maSach}`} 
                                            className="block w-full text-center bg-gray-900 hover:bg-blue-600 text-white font-medium py-2 rounded transition-colors"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalePage;