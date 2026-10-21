import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getAllUsers } from '../../services/userService';
import { getDanhSachSach } from '../../services/sachService';
import './AdminDashboard.css';

// Import các component quản lý
import CategoryManager from './components/CategoryManager';
import PromotionManager from './components/PromotionManager';
import ProductManager from './components/ProductManager';
import ContactManager from './components/ContactManager';
import CommentManager from './components/CommentManager';
import VoucherManager from './components/VoucherManager';
import OrderManager from './components/OrderManager';
import UserManager from './components/UserManager';
import DashboardOverview from './components/DashboardOverview';
import SecurityMonitor from './components/SecurityMonitor';

/* ---------------------------------------------------------
   Icon set — small inline SVGs, no extra dependency needed.
--------------------------------------------------------- */
const iconProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconMark = (p) => ( <svg {...iconProps} {...p}><path d="M6 4h12v16l-6-4-6 4V4Z" /></svg> );
const IconGrid = (p) => ( <svg {...iconProps} {...p}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg> );
const IconBook = (p) => ( <svg {...iconProps} {...p}><path d="M4 5.5C4 4.67 4.67 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" /><path d="M20 5.5c0-.83-.67-1.5-1.5-1.5H12v16h6.5c.83 0 1.5-.67 1.5-1.5v-13Z" /></svg> );
const IconBox = (p) => ( <svg {...iconProps} {...p}><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" /><path d="M3.8 7.3 12 12l8.2-4.7" /><path d="M12 12v9" /></svg> );
const IconGift = (p) => ( <svg {...iconProps} {...p}><rect x="3.5" y="9" width="17" height="4" rx="0.5" /><path d="M5 13h14v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7Z" /><path d="M12 9V21" /><path d="M12 9C10.5 6.5 8.5 5.5 7.3 6.4c-1.2.9-.4 2.6 1.2 2.6H12Z" /><path d="M12 9c1.5-2.5 3.5-3.5 4.7-2.6 1.2.9.4 2.6-1.2 2.6H12Z" /></svg> );
const IconTicket = (p) => ( <svg {...iconProps} {...p}><path d="M3 9.5a2 2 0 0 1 0-4h18a2 2 0 0 1 0 4 2 2 0 0 0 0 5 2 2 0 0 1 0 4H3a2 2 0 0 1 0-4 2 2 0 0 0 0-5Z" /><path d="M10 5.5v13" strokeDasharray="2 2" /></svg> );
const IconCart = (p) => ( <svg {...iconProps} {...p}><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.3a2 2 0 0 0 2-1.6L20 8H6" /><circle cx="9.5" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></svg> );
const IconUsers = (p) => ( <svg {...iconProps} {...p}><circle cx="9" cy="8.5" r="3" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 8.2a2.7 2.7 0 1 1 0 5.4" /><path d="M15 14.3c2.6.2 4.6 2.1 4.6 4.7" /></svg> );
const IconMail = (p) => ( <svg {...iconProps} {...p}><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="M4.5 7 12 12.5 19.5 7" /></svg> );
const IconChat = (p) => ( <svg {...iconProps} {...p}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.5 3.5V16h-.5A2.5 2.5 0 0 1 2.5 13.5" transform="translate(1)" /></svg> );
const IconLogout = (p) => ( <svg {...iconProps} {...p}><path d="M9 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H9" /><path d="M15 16l4-4-4-4" /><path d="M19 12H9" /></svg> );
const IconHome = (p) => ( <svg {...iconProps} {...p}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v8.5a1 1 0 0 0 1 1h3.5v-5h3v5H17a1 1 0 0 0 1-1V10" /></svg> );
const IconShield = (p) => ( <svg {...iconProps} {...p}><path d="M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z" /><path d="m9 12 2 2 4-4" /></svg> );

const NAV_GROUPS = [
    {
        label: 'Vận hành',
        items: [
            { id: 'dashboard', label: 'Tổng Quan', icon: IconGrid },
            { id: 'category', label: 'Loại Sách', icon: IconBook },
            { id: 'product', label: 'Sản Phẩm', icon: IconBox },
            { id: 'promotion', label: 'Khuyến Mãi', icon: IconGift },
            { id: 'voucher', label: 'Mã Giảm Giá', icon: IconTicket },
            { id: 'order', label: 'Đơn Hàng', icon: IconCart },
        ],
    },
    {
        label: 'Cộng đồng',
        items: [
            { id: 'users', label: 'Người Dùng', icon: IconUsers },
            { id: 'contact', label: 'Liên Hệ', icon: IconMail },
            { id: 'comment', label: 'Đánh Giá', icon: IconChat },
        ],
    },
    {
        label: 'Bảo mật',
        items: [
            { id: 'security', label: 'Giám Sát Bảo Mật và Tối ưu', icon: IconShield },
        ],
    },
];

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // 1. Nhận diện Role (Xử lý đồng thời cả 2 trường hợp thuộc tính có thể trả về từ API)
    const userRole = user?.role || user?.vaiTro || user?.vai_tro; 
    const isAdmin = userRole === 'Admin';
    const isEmployee = userRole === 'Nhan_Vien'; // Khớp với Database của bạn

    // 2. Nếu là nhân viên, tab mặc định khi vào admin sẽ là 'Đơn hàng' thay vì 'Tổng quan'
    const [activeTab, setActiveTab] = useState(() => isAdmin ? 'dashboard' : 'order');

    const [stats, setStats] = useState({
        doanhThu: 0,
        donHangMoi: 0,
        sachTrongKho: 0,
        nguoiDung: 0,
    });

    const fetchDashboardStats = async () => {
        try {
            const users = await getAllUsers();
            const sach = await getDanhSachSach();
            setStats({
                doanhThu: 0,
                donHangMoi: 0,
                sachTrongKho: sach.length,
                nguoiDung: users.length,
            });
        } catch (error) {
            console.error("Lỗi lấy dữ liệu tổng quan:", error);
        }
    };

    useEffect(() => {
        // Chỉ gọi API thống kê nếu là Admin và đang ở tab Tổng quan
        if (isAdmin && activeTab === 'dashboard') {
            fetchDashboardStats();
        }
    }, [isAdmin, activeTab]);

    // 3. Đá văng bất kỳ ai không phải Admin VÀ không phải Nhân Viên
    if (!user || (!isAdmin && !isEmployee)) {
        return (
            <div className="denied-screen">
                <h1 className="denied-screen__title">Truy cập bị từ chối</h1>
                <Link to="/" className="denied-screen__link">Về trang chủ</Link>
            </div>
        );
    }

    // 4. Lọc Menu: Nếu là Nhân viên, tự động loại bỏ tab 'dashboard' và 'users' khỏi giao diện
    const filteredNavGroups = NAV_GROUPS.map(group => {
        return {
            ...group,
            items: group.items.filter(item => {
                if (isEmployee && (item.id === 'dashboard' || item.id === 'users')) {
                    return false;
                }
                return true;
            })
        };
    }).filter(group => group.items.length > 0); // Xóa luôn group nếu không còn menu nào bên trong

    const renderContent = () => {
        // Bảo mật lớp thứ 2: Đề phòng nhân viên cố tình đổi state bằng React DevTools
        if (isEmployee && (activeTab === 'dashboard' || activeTab === 'users')) {
            return <div className="p-10 text-center text-red-500 font-bold">Bạn không có quyền truy cập chức năng này.</div>;
        }

        switch (activeTab) {
            case 'dashboard': return <DashboardOverview />;
            case 'category': return <CategoryManager />;
            case 'promotion': return <PromotionManager />;
            case 'product': return <ProductManager />;
            case 'users': return <UserManager />;
            case 'contact': return <ContactManager />;
            case 'comment': return <CommentManager />;
            case 'voucher': return <VoucherManager />;
            case 'order': return <OrderManager />;
            case 'security': return <SecurityMonitor />;
            default: return <OrderManager />;
        }
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar__brand">
                    <div className="admin-sidebar__mark">
                        <IconMark style={{ width: 20, height: 20 }} />
                    </div>
                    <div>
                        <h2 className="admin-sidebar__title">Admin Panel</h2>
                        <p className="admin-sidebar__subtitle">
                            {isAdmin ? 'Quản trị tối cao' : 'Nhân viên vận hành'}
                        </p>
                    </div>
                </div>

                <nav className="admin-sidebar__nav">
                    {/* Render menu từ biến mảng đã được lọc (filteredNavGroups) */}
                    {filteredNavGroups.map((group) => (
                        <div className="admin-nav-group" key={group.label}>
                            <div className="admin-nav-group__label">{group.label}</div>
                            {group.items.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`admin-nav-item ${activeTab === id ? 'is-active' : ''}`}
                                >
                                    <Icon />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="admin-sidebar__footer">
                    <div className="admin-sidebar__account">
                        <div className="admin-sidebar__avatar">
                            {user.email?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex flex-col">
                            <span className="admin-sidebar__email font-bold">{user.hoTen || user.email}</span>
                            <span className="text-xs text-gray-400">{isAdmin ? 'Quản trị viên' : 'Nhân viên'}</span>
                        </div>
                    </div>
                    <button onClick={() => { logout(); navigate('/'); }} className="admin-sidebar__logout">
                        <IconLogout />
                        Đăng xuất
                    </button>

                    <Link to="/" className="admin-sidebar__home">
                        <IconHome />
                        Về trang chủ
                    </Link>
                </div>
            </aside>

            <main className="admin-main">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;