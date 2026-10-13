import { useState, useEffect } from 'react';
import { getDanhSachSach } from '../../services/sachService';
import ProductCard from '../../components/Product/ProductCard';

const Shop = () => {
    // State lưu dữ liệu gốc từ API (không bao giờ sửa)
    const [danhSachGoc, setDanhSachGoc] = useState([]);
    // State lưu dữ liệu đang hiển thị (sau khi lọc)
    const [danhSachHienThi, setDanhSachHienThi] = useState([]);
    
    // State quản lý trạng thái loading và error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State lưu các giá trị của bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState('all'); // 'all', 'duoi100', '100den300', 'tren300'

    // 1. Gọi API lấy dữ liệu 1 lần lúc mới vào trang
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getDanhSachSach();
                setDanhSachGoc(data);
                setDanhSachHienThi(data); // Mặc định hiển thị tất cả
                setLoading(false);
            } catch (err) {
                setError("Không thể tải dữ liệu, hãy kiểm tra lại Backend.");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 2. Logic Lọc Dữ Liệu: Chạy mỗi khi user gõ phím hoặc chọn khoảng giá
    useEffect(() => {
        let ketQuaLoc = [...danhSachGoc];

        // Lọc theo từ khóa (Tìm kiếm)
        if (searchTerm) {
            ketQuaLoc = ketQuaLoc.filter(sach => 
                sach.tenSach.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Lọc theo khoảng giá
        if (priceRange === 'duoi100') {
            ketQuaLoc = ketQuaLoc.filter(sach => sach.gia < 100000);
        } else if (priceRange === '100den300') {
            ketQuaLoc = ketQuaLoc.filter(sach => sach.gia >= 100000 && sach.gia <= 300000);
        } else if (priceRange === 'tren300') {
            ketQuaLoc = ketQuaLoc.filter(sach => sach.gia > 300000);
        }

        setDanhSachHienThi(ketQuaLoc);
    }, [searchTerm, priceRange, danhSachGoc]);

    // Xử lý làm mới (Reset) bộ lọc
    const handleResetFilter = () => {
        setSearchTerm('');
        setPriceRange('all');
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

                        {/* Ô Tìm Kiếm */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm tên sách</label>
                            <input 
                                type="text"
                                placeholder="Nhập tên sách..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Chọn Khoảng Giá */}
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
                        Hiển thị {danhSachHienThi.length} kết quả
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {danhSachHienThi.length === 0 ? (
                            <div className="col-span-full py-10 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-2">Không tìm thấy sách nào phù hợp với điều kiện lọc.</p>
                                <button onClick={handleResetFilter} className="text-red-600 font-medium hover:underline">Xóa điều kiện lọc</button>
                            </div>
                        ) : (
                            danhSachHienThi.map((sach) => (
                                <ProductCard key={sach.maSach} data={sach} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;