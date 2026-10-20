// import { useState, useEffect } from 'react';

// const CommentManager = () => {
//     const [comments, setComments] = useState([]);

//     const fetchComments = async () => {
//         const res = await fetch('https://localhost:7010/api/admin/binhluan');
//         if (res.ok) setComments(await res.json());
//     };

//     useEffect(() => { fetchComments(); }, []);

//     // Hàm cập nhật trạng thái (Duyệt / Hủy)
//     const updateStatus = async (id, status) => {
//         if (!window.confirm(`Bạn muốn đổi trạng thái thành: ${status === 'Da_Duyet' ? 'Duyệt' : 'Hủy/Cấm'}?`)) return;
        
//         await fetch(`https://localhost:7010/api/admin/binhluan/${id}/trangthai`, {
//             method: 'PATCH',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(status)
//         });
//         fetchComments();
//     };

//     // Hàm XÓA vĩnh viễn bình luận
//     const handleDelete = async (id) => {
//         if (!window.confirm("Bạn có chắc chắn muốn XÓA VĨNH VIỄN bình luận này khỏi hệ thống không? Hành động này không thể hoàn tác!")) return;
        
//         try {
//             const res = await fetch(`https://localhost:7010/api/admin/binhluan/${id}`, {
//                 method: 'DELETE'
//             });
//             if (res.ok) {
//                 fetchComments(); // Tải lại danh sách cho sạch
//             } else {
//                 alert("Có lỗi xảy ra khi xóa bình luận.");
//             }
//         } catch (error) {
//             console.error("Lỗi:", error);
//             alert("Lỗi kết nối đến server.");
//         }
//     };

//     return (
//         <div className="bg-white p-6 rounded-lg shadow">
//             <h2 className="text-xl font-bold text-gray-800 mb-6">Kiểm duyệt Bình Luận</h2>
//             <div className="overflow-x-auto">
//                 <table className="min-w-full text-left text-sm border">
//                     <thead className="bg-gray-100">
//                         <tr>
//                             <th className="p-3 border-b">Ngày</th>
//                             <th className="p-3 border-b">Người gửi</th>
//                             <th className="p-3 border-b">Mã Sách</th>
//                             <th className="p-3 border-b w-1/3">Nội dung</th>
//                             <th className="p-3 border-b text-center">Trạng thái</th>
//                             <th className="p-3 border-b text-center w-1/5">Thao tác</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {comments.map(c => (
//                             <tr key={c.maBinhLuan} className="hover:bg-gray-50">
//                                 <td className="p-3 border-b text-gray-600">{new Date(c.ngayBinhLuan).toLocaleDateString('vi-VN')}</td>
//                                 <td className="p-3 border-b font-medium">{c.tenNguoiDung}</td>
//                                 <td className="p-3 border-b text-blue-600 font-bold">#{c.maSach}</td>
//                                 <td className="p-3 border-b text-gray-700">{c.noiDung}</td>
//                                 <td className="p-3 border-b text-center">
//                                     <span className={`px-2 py-1 rounded text-xs font-bold ${
//                                         c.trangThaiAI === 'Da_Duyet' ? 'bg-green-100 text-green-700' :
//                                         c.trangThaiAI === 'Tu_Choi' ? 'bg-red-100 text-red-700' :
//                                         'bg-yellow-100 text-yellow-700'
//                                     }`}>
//                                         {c.trangThaiAI === 'Cho_Kiem_Duyet' ? 'Chờ duyệt' : c.trangThaiAI === 'Da_Duyet' ? 'Đã duyệt' : 'Đã hủy'}
//                                     </span>
//                                 </td>
//                                 <td className="p-3 border-b text-center">
//                                     <div className="flex items-center justify-center space-x-3">
//                                         {c.trangThaiAI !== 'Da_Duyet' && (
//                                             <button onClick={() => updateStatus(c.maBinhLuan, 'Da_Duyet')} className="text-green-600 font-bold hover:underline">Duyệt</button>
//                                         )}
//                                         {c.trangThaiAI !== 'Tu_Choi' && (
//                                             <button onClick={() => updateStatus(c.maBinhLuan, 'Tu_Choi')} className="text-orange-500 font-bold hover:underline">Hủy/Cấm</button>
//                                         )}
//                                         <span className="text-gray-300">|</span>
//                                         {/* Nút Xóa mới được thêm vào */}
//                                         <button onClick={() => handleDelete(c.maBinhLuan)} className="text-red-600 font-bold hover:underline">Xóa</button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                         {comments.length === 0 && <tr><td colSpan="6" className="text-center p-6 text-gray-500 font-medium">Hệ thống chưa có bình luận nào.</td></tr>}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default CommentManager;

import { useState, useEffect, useMemo } from 'react';
import './CommentManager.css';

const API = 'https://localhost:7010';

// Chuẩn hóa trạng thái từ DB: Da_Duyet = đã duyệt, Cho_Kiem_Duyet = chờ duyệt,
// mọi giá trị còn lại được coi là đã hủy (khớp với nhãn hiển thị cũ).
const getStatus = (c) => {
    if (c.trangThaiAI === 'Da_Duyet') return { key: 'approved', label: 'Đã duyệt', tone: 'ok' };
    if (c.trangThaiAI === 'Cho_Kiem_Duyet') return { key: 'pending', label: 'Chờ duyệt', tone: 'wait' };
    return { key: 'rejected', label: 'Đã hủy', tone: 'bad' };
};

const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'rejected', label: 'Đã hủy' },
];

const CommentManager = () => {
    const [comments, setComments] = useState([]);
    const [filter, setFilter] = useState('all');

    const fetchComments = async () => {
        const res = await fetch(`${API}/api/admin/binhluan`);
        if (res.ok) setComments(await res.json());
    };

    useEffect(() => {
        fetchComments();
    }, []);

    // Cập nhật trạng thái (Duyệt / Hủy)
    const updateStatus = async (id, status) => {
        if (!window.confirm(`Bạn muốn đổi trạng thái thành: ${status === 'Da_Duyet' ? 'Duyệt' : 'Hủy/Cấm'}?`)) return;

        await fetch(`${API}/api/admin/binhluan/${id}/trangthai`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(status),
        });
        fetchComments();
    };

    // XÓA vĩnh viễn bình luận
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN bình luận này khỏi hệ thống không? Hành động này không thể hoàn tác!')) return;

        try {
            const res = await fetch(`${API}/api/admin/binhluan/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchComments();
            } else {
                alert('Có lỗi xảy ra khi xóa bình luận.');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Lỗi kết nối đến server.');
        }
    };

    // Số liệu theo từng trạng thái
    const counts = useMemo(() => {
        const c = { all: comments.length, pending: 0, approved: 0, rejected: 0 };
        comments.forEach((item) => {
            c[getStatus(item).key] += 1;
        });
        return c;
    }, [comments]);

    const visibleComments = comments.filter((c) => filter === 'all' || getStatus(c).key === filter);

    return (
        <div className="cm-page">
            {/* Banner */}
            <div className="cm-hero">
                <div className="cm-container">
                    <header className="cm-header">
                        <h2 className="cm-title">Kiểm duyệt bình luận</h2>
                        <p className="cm-subtitle">Duyệt, ẩn hoặc xóa các đánh giá của khách hàng trước khi hiển thị trên trang sách</p>
                    </header>
                </div>
            </div>

            <main className="cm-container cm-main">
                {/* Tổng quan */}
                <section className="cm-summary">
                    <div className="cm-summary-item">
                        <span className="cm-summary-icon" data-tone="info">💬</span>
                        <div>
                            <p className="cm-summary-label">Tổng bình luận</p>
                            <p className="cm-summary-value">{counts.all}</p>
                        </div>
                    </div>
                    <div className="cm-summary-item">
                        <span className="cm-summary-icon" data-tone="wait">⏳</span>
                        <div>
                            <p className="cm-summary-label">Chờ duyệt</p>
                            <p className="cm-summary-value">{counts.pending}</p>
                        </div>
                    </div>
                    <div className="cm-summary-item">
                        <span className="cm-summary-icon" data-tone="ok">✅</span>
                        <div>
                            <p className="cm-summary-label">Đã duyệt</p>
                            <p className="cm-summary-value">{counts.approved}</p>
                        </div>
                    </div>
                    <div className="cm-summary-item">
                        <span className="cm-summary-icon" data-tone="bad">🚫</span>
                        <div>
                            <p className="cm-summary-label">Đã hủy</p>
                            <p className="cm-summary-value">{counts.rejected}</p>
                        </div>
                    </div>
                </section>

                {/* Bảng bình luận */}
                <section className="cm-panel">
                    <div className="cm-toolbar">
                        {filters.map((f) => (
                            <button
                                key={f.key}
                                className="cm-tab"
                                aria-pressed={filter === f.key}
                                onClick={() => setFilter(f.key)}
                            >
                                {f.label}
                                <span className="cm-tab-count">{counts[f.key]}</span>
                            </button>
                        ))}
                    </div>

                    <div className="cm-table-wrap">
                        <table className="cm-table">
                            <thead>
                                <tr>
                                    <th>Ngày</th>
                                    <th>Người gửi</th>
                                    <th>Mã sách</th>
                                    <th className="cm-col-content">Nội dung</th>
                                    <th className="cm-center">Trạng thái</th>
                                    <th className="cm-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleComments.map((c) => {
                                    const status = getStatus(c);
                                    return (
                                        <tr key={c.maBinhLuan}>
                                            <td className="cm-date">
                                                {new Date(c.ngayBinhLuan).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td>
                                                <div className="cm-user">
                                                    <span className="cm-avatar">
                                                        {(c.tenNguoiDung || '?').trim().charAt(0).toUpperCase()}
                                                    </span>
                                                    <span className="cm-user-name">{c.tenNguoiDung}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="cm-book">#{c.maSach}</span>
                                            </td>
                                            <td>
                                                <p className="cm-content">{c.noiDung}</p>
                                            </td>
                                            <td className="cm-center">
                                                <span className="cm-badge" data-tone={status.tone}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="cm-actions">
                                                    {status.key !== 'approved' && (
                                                        <button
                                                            onClick={() => updateStatus(c.maBinhLuan, 'Da_Duyet')}
                                                            className="cm-act cm-act--approve"
                                                        >
                                                            Duyệt
                                                        </button>
                                                    )}
                                                    {status.key !== 'rejected' && (
                                                        <button
                                                            onClick={() => updateStatus(c.maBinhLuan, 'Tu_Choi')}
                                                            className="cm-act cm-act--reject"
                                                        >
                                                            Hủy/Cấm
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(c.maBinhLuan)}
                                                        className="cm-act cm-act--delete"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {visibleComments.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="cm-empty">
                                            <p className="cm-empty-title">
                                                {comments.length === 0
                                                    ? 'Hệ thống chưa có bình luận nào'
                                                    : 'Không có bình luận ở mục này'}
                                            </p>
                                            <p className="cm-empty-hint">
                                                {comments.length === 0
                                                    ? 'Bình luận của khách hàng sẽ xuất hiện tại đây để bạn kiểm duyệt.'
                                                    : 'Chọn mục khác để xem các bình luận còn lại.'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default CommentManager;
