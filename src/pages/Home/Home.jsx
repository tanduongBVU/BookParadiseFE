import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BannerSlider from '../../components/Common/BannerSlider';
import ProductCard from '../../components/Product/ProductCard';

const Home = () => {
    // State lưu toàn bộ dữ liệu trang chủ
    const [homeData, setHomeData] = useState({
        danhMuc: [],
        sachMoi: [],
        sachKhuyenMai: [],
        sachBanChay: []
    });
    const [loading, setLoading] = useState(true);

    // Gọi 1 API duy nhất để lấy tất cả dữ liệu
    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const res = await fetch('https://localhost:7010/api/Sach/home-data');
                if (res.ok) {
                    const data = await res.json();
                    setHomeData(data);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang chủ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    // Component tái sử dụng để render từng khu vực Sách (Bán chạy, Mới, Khuyến mãi)
    const BookSection = ({ title, books, linkAll }) => {
        if (!books || books.length === 0) return null; // Ẩn mục nếu chưa có dữ liệu

        return (
            <div className="mt-12">
                <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-2">
                    <h2 className="text-2xl font-bold text-red-600 border-b-2 border-red-600 -mb-[10px] pb-2 inline-block">
                        {title}
                    </h2>
                    <Link to={linkAll} className="text-blue-500 hover:text-blue-700 font-medium text-sm transition-colors">
                        Xem tất cả &rarr;
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {books.map((book) => (
                        <ProductCard key={book.maSach} data={book} />
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-500">Đang tải thiên đường sách...</div>;
    }

    return (
        <div className="w-full bg-gray-50 min-h-screen pb-16">
            {/* 1. Phần Banner Slider (Giữ nguyên của bạn) */}
            <BannerSlider />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                
                {/* Lời giới thiệu */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Chào mừng đến với BookParadise
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Khám phá thế giới tri thức với hàng ngàn đầu sách hấp dẫn. Từ văn học kinh điển, kỹ năng sống đến sách chuyên ngành công nghệ thông tin.
                    </p>
                </div>

                {/* 2. KHU VỰC DANH MỤC SÁCH */}
                {homeData.danhMuc && homeData.danhMuc.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Khám Phá Theo Danh Mục</h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {homeData.danhMuc.map(dm => (
                                <Link 
                                    key={dm.maLoai} 
                                    to={`/sach?danh-muc=${dm.maLoai}`}
                                    className="px-6 py-2 bg-white border border-gray-200 shadow-sm rounded-full text-gray-700 font-medium hover:border-red-500 hover:text-red-600 hover:shadow-md transition-all"
                                >
                                    {dm.tenLoai}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. KHU VỰC SÁCH BÁN CHẠY */}
                <BookSection 
                    title="Sách Bán Chạy Nhất" 
                    books={homeData.sachBanChay} 
                    linkAll="/sach" 
                />

                {/* 4. KHU VỰC SÁCH MỚI PHÁT HÀNH */}
                <BookSection 
                    title="Sách Mới Phát Hành" 
                    books={homeData.sachMoi} 
                    linkAll="/sach" 
                />

                {/* 5. KHU VỰC SÁCH KHUYẾN MÃI */}
                <BookSection 
                    title="Ưu Đãi Đặc Biệt (Khuyến Mãi)" 
                    books={homeData.sachKhuyenMai} 
                    linkAll="/sach" 
                />

            </div>
        </div>
    );
};

export default Home;