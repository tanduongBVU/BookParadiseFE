import { Link } from 'react-router-dom';

const AboutPage = () => {
    return (
        <div className="bg-white">
            {/* 1. Hero Section */}
            <div className="relative bg-blue-600 text-white">
                <div className="absolute inset-0 overflow-hidden">
                    {/* Ảnh nền có lớp phủ tối */}
                    <img
                        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
                        alt="Thư viện sách"
                        className="w-full h-full object-cover opacity-20"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Chào mừng đến với BookParadise
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg md:text-xl mx-auto text-blue-100">
                        Nơi tôn vinh tri thức và khơi nguồn đam mê đọc sách. Chúng tôi mang đến cho bạn những tác phẩm tuyệt vời nhất từ khắp nơi trên thế giới.
                    </p>
                </div>
            </div>

            {/* 2. Our Story Section */}
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu chuyện của chúng tôi</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Bắt đầu từ một dự án đầy tâm huyết, BookParadise ra đời với sứ mệnh phá bỏ mọi giới hạn của một nhà sách truyền thống. Chúng tôi không chỉ bán sách, chúng tôi trao gửi những giá trị tinh thần, những bài học quý giá và những giây phút thư giãn tuyệt vời.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Với hệ thống quản lý hiện đại và giao diện thân thiện, BookParadise tự hào là cầu nối vững chắc giữa những tác giả lỗi lạc và những độc giả yêu sách tại Việt Nam.
                        </p>
                    </div>
                    <div className="mt-10 lg:mt-0 rounded-2xl overflow-hidden shadow-xl">
                        <img 
                            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                            alt="Người đang đọc sách" 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>
            </div>

            {/* 3. Core Values Section */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Tại sao chọn BookParadise?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Value 1 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Sách Bản Quyền 100%</h3>
                            <p className="text-gray-600">Cam kết cung cấp sách chính hãng, chất lượng in ấn tốt nhất từ các nhà xuất bản hàng đầu.</p>
                        </div>

                        {/* Value 2 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Giao Hàng Siêu Tốc</h3>
                            <p className="text-gray-600">Hệ thống xử lý đơn hàng tự động, giao sách đến tận tay bạn trong thời gian ngắn nhất.</p>
                        </div>

                        {/* Value 3 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Hỗ Trợ Tận Tâm</h3>
                            <p className="text-gray-600">Đội ngũ chăm sóc khách hàng luôn sẵn sàng lắng nghe và giải quyết mọi vấn đề của bạn.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Call To Action (CTA) */}
            <div className="bg-white py-16 text-center px-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Sẵn sàng khám phá thế giới tri thức?</h2>
                <Link 
                    to="/shop" 
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                    Đến Cửa Hàng Ngay
                </Link>
            </div>
        </div>
    );
};

export default AboutPage;