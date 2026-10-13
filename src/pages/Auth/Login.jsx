import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { loginApi } from '../../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Gọi API C#
            const data = await loginApi(email, password);
            
            // Giả định backend trả về object: { token: "...", user: { id: 1, ten: "...", role: "Admin" } }
            // Lưu vào Context
            login(data.user, data.token); 
            
            alert("Đăng nhập thành công!");
            
            // Nếu là Admin thì chuyển hướng tới trang Admin, ngược lại về Trang chủ
            if (data.user?.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            // Bắt lỗi từ backend (sai pass, không tồn tại user...)
            setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Đăng nhập</h2>
                    <p className="text-gray-500 mt-2">Chào mừng trở lại BookParadise</p>
                </div>
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input 
                            type="email" 
                            required 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition shadow-md flex justify-center items-center ${loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:transform active:scale-95'}`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link to="/dang-ky" className="text-red-600 hover:text-red-800 font-bold hover:underline">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;