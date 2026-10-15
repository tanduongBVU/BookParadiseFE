import { Link } from 'react-router-dom';

const SalePage = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <span className="text-6xl mb-4 block">🎁</span>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Chương trình khuyến mãi sắp ra mắt!
                </h1>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Hệ thống quản lý ưu đãi đang được hoàn thiện. Những deal sách siêu hời nhất từ BookParadise sẽ sớm xuất hiện tại đây. Bạn hãy quay lại sau nhé!
                </p>
                <Link 
                    to="/shop" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                    Tiếp tục mua sắm
                </Link>
            </div>
        </div>
    );
};

export default SalePage;