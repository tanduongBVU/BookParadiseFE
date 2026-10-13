import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../../services/authService';

const Register = () => {
    const [hoTen, setHoTen] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        setLoading(true);
        try {
            await registerApi(hoTen, email, password);
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate('/dang-nhap'); // Chuyển về trang đăng nhập
        } catch (err) {
            setError(err.message || "Đăng ký thất bại. Email có thể đã tồn tại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Tạo tài khoản</h2>
                    <p className="text-gray-500 mt-2">Gia nhập cộng đồng BookParadise</p>
                </div>
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                        <input 
                            type="text" required 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="Nhập họ tên của bạn"
                            value={hoTen} onChange={(e) => setHoTen(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" required 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="email@example.com"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input 
                            type="password" required 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                        <input 
                            type="password" required 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="••••••••"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-3 px-4 mt-4 rounded-lg text-white font-bold text-lg transition shadow-md ${loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/dang-nhap" className="text-red-600 hover:text-red-800 font-bold hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;