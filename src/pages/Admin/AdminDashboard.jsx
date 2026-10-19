import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getAllUsers, deleteUser, updateUserRole } from '../../services/userService';
import { getDanhSachSach } from '../../services/sachService'; 

// Import các component quản lý
import CategoryManager from './components/CategoryManager';
import PromotionManager from './components/PromotionManager';
import ProductManager from './components/ProductManager';
import ContactManager from './components/ContactManager'; 
import CommentManager from './components/CommentManager'; 
import VoucherManager from './components/VoucherManager'; // Đã import VoucherManager
import OrderManager from './components/OrderManager';
import DashboardOverview from './components/DashboardOverview';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('dashboard');
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        doanhThu: 0,
        donHangMoi: 0,
        sachTrongKho: 0,
        nguoiDung: 0
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            const sortedData = data.sort((a, b) => a.maNguoiDung - b.maNguoiDung);
            setUsersList(sortedData);
        } catch (error) {
            console.error("Lỗi lấy danh sách user:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const users = await getAllUsers();
            const sach = await getDanhSachSach();
            
            setStats({
                doanhThu: 0, 
                donHangMoi: 0,
                sachTrongKho: sach.length,
                nguoiDung: users.length
            });
        } catch (error) {
            console.error("Lỗi lấy dữ liệu tổng quan:", error);
        }
    };

    useEffect(() => {
        if (user && user.role === 'Admin') {
            if (activeTab === 'users') {
                fetchUsers();
            } else if (activeTab === 'dashboard') {
                fetchDashboardStats();
            }
        }
    }, [user, activeTab]);

    const handleDelete = async (id, ten) => {
        if (window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${ten}" không?`)) {
            try {
                await deleteUser(id);
                alert("Đã xóa thành công!");
                fetchUsers();
            } catch (error) {
                alert("Lỗi khi xóa tài khoản.");
            }
        }
    };

    const handleRoleChange = async (id, currentRole, newRole) => {
        if (currentRole === newRole) return;
        if (window.confirm(`Xác nhận đổi quyền thành ${newRole}?`)) {
            try {
                await updateUserRole(id, newRole);
                alert("Đã cập nhật phân quyền!");
                fetchUsers();
            } catch (error) {
                alert("Lỗi khi cập nhật quyền.");
            }
        }
    };

    if (!user || user.role !== 'Admin') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h1>
                <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Về trang chủ</Link>
            </div>
        );
    }

    const renderDashboard = () => <DashboardOverview />;

    const renderUsers = () => (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Người Dùng</h1>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-gray-500 font-medium">Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                                <th className="p-4 font-semibold">ID</th>
                                <th className="p-4 font-semibold">Họ Tên</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold text-center">Phân Quyền</th>
                                <th className="p-4 font-semibold text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usersList.map((item) => (
                                <tr key={item.maNguoiDung} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-800 font-medium">{item.maNguoiDung}</td>
                                    <td className="p-4 text-gray-800">{item.hoTen || "Chưa cập nhật"}</td>
                                    <td className="p-4 text-gray-500">{item.email}</td>
                                    <td className="p-4 text-center">
                                        <select 
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border outline-none cursor-pointer ${
                                                item.vaiTro === 'Admin' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                item.vaiTro === 'Nhan_Vien' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}
                                            value={item.vaiTro || 'Khach_Hang'}
                                            onChange={(e) => handleRoleChange(item.maNguoiDung, item.vaiTro, e.target.value)}
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Nhan_Vien">Nhân viên</option>
                                            <option value="Khach_Hang">Khách hàng</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-center">
                                        {user.id !== item.maNguoiDung && (
                                            <button 
                                                onClick={() => handleDelete(item.maNguoiDung, item.hoTen || item.email)}
                                                className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded text-sm font-medium transition"
                                            >
                                                Xóa
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return renderDashboard();
            case 'category': return <CategoryManager />;
            case 'promotion': return <PromotionManager />;
            case 'product': return <ProductManager />;
            case 'users': return renderUsers();
            case 'contact': return <ContactManager />; 
            case 'comment': return <CommentManager />; 
            case 'voucher': return <VoucherManager />; // Đã thêm render cho VoucherManager
            case 'order': return <OrderManager />;
            default: return renderDashboard();
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl flex-shrink-0">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-blue-400">Admin Panel</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        📊 Tổng Quan
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('category')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'category' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        📚 Loại Sách
                    </button>

                    <button 
                        onClick={() => setActiveTab('promotion')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'promotion' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        🎁 Khuyến Mãi
                    </button>

                    <button 
                        onClick={() => setActiveTab('product')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'product' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        📦 Sản Phẩm
                    </button>

                    <button 
                        onClick={() => setActiveTab('order')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'order' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        🛒 Quản lý Đơn hàng
                    </button>

                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'users' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        👥 Người Dùng
                    </button>

                    <button 
                        onClick={() => setActiveTab('contact')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'contact' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        ✉️ Quản lý Liên Hệ
                    </button>

                    <button 
                        onClick={() => setActiveTab('comment')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'comment' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        💬 Quản lý Đánh giá
                    </button>

                    {/* Menu Quản lý Mã giảm giá mới */}
                    <button 
                        onClick={() => setActiveTab('voucher')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'voucher' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        🎟️ Quản lý Mã giảm giá
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-700 text-center">
                    <span className="block font-medium mb-4 text-sm truncate px-2">{user.email}</span>
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition">Thoát</button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;