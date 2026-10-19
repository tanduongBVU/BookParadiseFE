import { useState, useEffect } from 'react';

const CommentManager = () => {
    const [comments, setComments] = useState([]);

    const fetchComments = async () => {
        const res = await fetch('https://localhost:7010/api/admin/binhluan');
        if (res.ok) setComments(await res.json());
    };

    useEffect(() => { fetchComments(); }, []);

    // Hàm cập nhật trạng thái (Duyệt / Hủy)
    const updateStatus = async (id, status) => {
        if (!window.confirm(`Bạn muốn đổi trạng thái thành: ${status === 'Da_Duyet' ? 'Duyệt' : 'Hủy/Cấm'}?`)) return;
        
        await fetch(`https://localhost:7010/api/admin/binhluan/${id}/trangthai`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(status)
        });
        fetchComments();
    };

    // Hàm XÓA vĩnh viễn bình luận
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn XÓA VĨNH VIỄN bình luận này khỏi hệ thống không? Hành động này không thể hoàn tác!")) return;
        
        try {
            const res = await fetch(`https://localhost:7010/api/admin/binhluan/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchComments(); // Tải lại danh sách cho sạch
            } else {
                alert("Có lỗi xảy ra khi xóa bình luận.");
            }
        } catch (error) {
            console.error("Lỗi:", error);
            alert("Lỗi kết nối đến server.");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Kiểm duyệt Bình Luận</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 border-b">Ngày</th>
                            <th className="p-3 border-b">Người gửi</th>
                            <th className="p-3 border-b">Mã Sách</th>
                            <th className="p-3 border-b w-1/3">Nội dung</th>
                            <th className="p-3 border-b text-center">Trạng thái</th>
                            <th className="p-3 border-b text-center w-1/5">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.map(c => (
                            <tr key={c.maBinhLuan} className="hover:bg-gray-50">
                                <td className="p-3 border-b text-gray-600">{new Date(c.ngayBinhLuan).toLocaleDateString('vi-VN')}</td>
                                <td className="p-3 border-b font-medium">{c.tenNguoiDung}</td>
                                <td className="p-3 border-b text-blue-600 font-bold">#{c.maSach}</td>
                                <td className="p-3 border-b text-gray-700">{c.noiDung}</td>
                                <td className="p-3 border-b text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        c.trangThaiAI === 'Da_Duyet' ? 'bg-green-100 text-green-700' :
                                        c.trangThaiAI === 'Tu_Choi' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {c.trangThaiAI === 'Cho_Kiem_Duyet' ? 'Chờ duyệt' : c.trangThaiAI === 'Da_Duyet' ? 'Đã duyệt' : 'Đã hủy'}
                                    </span>
                                </td>
                                <td className="p-3 border-b text-center">
                                    <div className="flex items-center justify-center space-x-3">
                                        {c.trangThaiAI !== 'Da_Duyet' && (
                                            <button onClick={() => updateStatus(c.maBinhLuan, 'Da_Duyet')} className="text-green-600 font-bold hover:underline">Duyệt</button>
                                        )}
                                        {c.trangThaiAI !== 'Tu_Choi' && (
                                            <button onClick={() => updateStatus(c.maBinhLuan, 'Tu_Choi')} className="text-orange-500 font-bold hover:underline">Hủy/Cấm</button>
                                        )}
                                        <span className="text-gray-300">|</span>
                                        {/* Nút Xóa mới được thêm vào */}
                                        <button onClick={() => handleDelete(c.maBinhLuan)} className="text-red-600 font-bold hover:underline">Xóa</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {comments.length === 0 && <tr><td colSpan="6" className="text-center p-6 text-gray-500 font-medium">Hệ thống chưa có bình luận nào.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommentManager;