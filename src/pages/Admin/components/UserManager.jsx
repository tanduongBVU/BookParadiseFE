import { useContext, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthContext } from '../../../context/AuthContext';
import { getAllUsers, deleteUser, updateUserRole } from '../../../services/userService';
import './UserManager.css';

const roleTone = {
    Admin: 'admin',
    Nhan_Vien: 'staff',
    Khach_Hang: 'customer',
};

const roleLabel = {
    Admin: 'Admin',
    Nhan_Vien: 'Nhân viên',
    Khach_Hang: 'Khách hàng',
};

const UserManager = () => {
    const { user } = useContext(AuthContext);

    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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

    useEffect(() => {
        fetchUsers();
    }, []);

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

    // Tìm theo tên, email hoặc ID
    const filteredUsers = usersList.filter(
        (u) =>
            u.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.maNguoiDung.toString().includes(search)
    );

    // Số liệu tổng quan
    const summary = useMemo(() => {
        const admins = usersList.filter((u) => u.vaiTro === 'Admin').length;
        const customers = usersList.filter((u) => (u.vaiTro || 'Khach_Hang') === 'Khach_Hang').length;
        return { total: usersList.length, admins, customers };
    }, [usersList]);

    const exportToExcel = () => {
        if (usersList.length === 0) return alert('Không có dữ liệu để xuất!');
        const dataToExport = usersList.map((u) => ({
            'ID': u.maNguoiDung,
            'Họ Tên': u.hoTen || 'Chưa cập nhật',
            'Email': u.email,
            'Phân Quyền': roleLabel[u.vaiTro] || 'Khách hàng',
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'NguoiDung');
        XLSX.writeFile(workbook, 'DanhSachNguoiDung.xlsx');
    };

    const exportToPDF = () => {
        if (usersList.length === 0) return alert('Không có dữ liệu để xuất!');
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('DANH SACH NGUOI DUNG - BOOKPARADISE', 14, 15);

        const tableColumn = ['ID', 'Ho Ten', 'Email', 'Phan Quyen'];
        const tableRows = usersList.map((u) => [
            u.maNguoiDung,
            u.hoTen || 'Chua cap nhat',
            u.email,
            u.vaiTro === 'Admin' ? 'Admin' : u.vaiTro === 'Nhan_Vien' ? 'Nhan vien' : 'Khach hang',
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
        });

        doc.save('DanhSachNguoiDung.pdf');
    };

    return (
        <div className="um-page">
            {/* Banner */}
            <div className="um-hero">
                <div className="um-container">
                    <header className="um-header">
                        <div>
                            <h2 className="um-title">Quản lý Người Dùng</h2>
                            <p className="um-subtitle">Phân quyền và quản lý toàn bộ tài khoản trong hệ thống</p>
                        </div>

                        <div className="um-export">
                            <button onClick={exportToExcel} className="um-btn um-btn--excel">
                                📊 Xuất Excel
                            </button>
                            <button onClick={exportToPDF} className="um-btn um-btn--pdf">
                                📄 Xuất PDF
                            </button>
                        </div>
                    </header>
                </div>
            </div>

            <main className="um-container um-main">

                {/* Tổng quan */}
                <section className="um-summary">
                    <div className="um-summary-item">
                        <span className="um-summary-icon" data-tone="ok">👥</span>
                        <div>
                            <p className="um-summary-label">Tổng người dùng</p>
                            <p className="um-summary-value">{summary.total}</p>
                        </div>
                    </div>
                    <div className="um-summary-item">
                        <span className="um-summary-icon" data-tone="admin">🛡️</span>
                        <div>
                            <p className="um-summary-label">Quản trị viên</p>
                            <p className="um-summary-value">{summary.admins}</p>
                        </div>
                    </div>
                    <div className="um-summary-item">
                        <span className="um-summary-icon" data-tone="customer">🧍</span>
                        <div>
                            <p className="um-summary-label">Khách hàng</p>
                            <p className="um-summary-value">{summary.customers}</p>
                        </div>
                    </div>
                </section>

                {/* Bảng người dùng */}
                <section className="um-panel">
                    <div className="um-toolbar">
                        <input
                            type="text"
                            placeholder="Tìm ID, tên hoặc email người dùng..."
                            className="um-search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="um-table-wrap">
                        {loading ? (
                            <div className="um-loading">Đang tải dữ liệu...</div>
                        ) : (
                            <table className="um-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Người dùng</th>
                                        <th>Email</th>
                                        <th>Phân Quyền</th>
                                        <th className="um-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((item) => {
                                        const tone = roleTone[item.vaiTro] || 'customer';
                                        const name = item.hoTen || 'Chưa cập nhật';
                                        return (
                                            <tr key={item.maNguoiDung}>
                                                <td className="um-user-id">#{item.maNguoiDung}</td>
                                                <td>
                                                    <div className="um-customer">
                                                        <span className="um-avatar" data-tone={tone}>
                                                            {name[0]?.toUpperCase() || '?'}
                                                        </span>
                                                        <p className="um-customer-name">{name}</p>
                                                    </div>
                                                </td>
                                                <td className="um-email">{item.email}</td>
                                                <td>
                                                    <select
                                                        className="um-role-select"
                                                        data-tone={tone}
                                                        value={item.vaiTro || 'Khach_Hang'}
                                                        onChange={(e) => handleRoleChange(item.maNguoiDung, item.vaiTro, e.target.value)}
                                                    >
                                                        <option value="Admin">Admin</option>
                                                        <option value="Nhan_Vien">Nhân viên</option>
                                                        <option value="Khach_Hang">Khách hàng</option>
                                                    </select>
                                                </td>
                                                <td className="um-center">
                                                    {user.id !== item.maNguoiDung && (
                                                        <button
                                                            onClick={() => handleDelete(item.maNguoiDung, name)}
                                                            className="um-btn-delete"
                                                        >
                                                            Xóa
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="um-empty">
                                                <p className="um-empty-title">Không tìm thấy người dùng</p>
                                                <p className="um-empty-hint">Thử một từ khóa khác hoặc xóa bộ lọc tìm kiếm.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default UserManager;
