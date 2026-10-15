const ContactPage = () => {
    // Hàm xử lý tạm thời khi bấm gửi form
    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Cảm ơn bạn đã liên hệ! BookParadise sẽ phản hồi bạn sớm nhất.");
    };

    return (
        <div className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Phần tiêu đề */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900">Liên hệ với BookParadise</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Bạn có câu hỏi, góp ý hoặc cần hỗ trợ? Hãy để lại lời nhắn, chúng tôi luôn sẵn sàng lắng nghe!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Cột 1: Thông tin cửa hàng */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-fit">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-8">Thông tin cửa hàng</h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4 text-gray-600">
                                    <p className="font-bold text-gray-900 text-lg">Địa chỉ</p>
                                    <p className="mt-1">Khu đại học, Bà Rịa - Vũng Tàu, Việt Nam</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div className="ml-4 text-gray-600">
                                    <p className="font-bold text-gray-900 text-lg">Điện thoại</p>
                                    <p className="mt-1">0123 456 789</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-red-100 p-3 rounded-full">
                                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4 text-gray-600">
                                    <p className="font-bold text-gray-900 text-lg">Email</p>
                                    <p className="mt-1">hotro@bookparadise.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Cột 2: Form liên hệ */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên</label>
                                <input type="text" id="name" className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 outline-none transition" placeholder="Nhập tên của bạn" required />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" id="email" className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 outline-none transition" placeholder="Địa chỉ email" required />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Nội dung tin nhắn</label>
                                <textarea id="message" rows="4" className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 outline-none transition" placeholder="Bạn cần hỗ trợ gì?" required></textarea>
                            </div>
                            <button type="submit" className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                Gửi tin nhắn
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;