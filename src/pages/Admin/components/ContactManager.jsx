import { useState, useEffect } from 'react';

const ContactManager = () => {
    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [replyModal, setReplyModal] = useState({ isOpen: false, data: null, message: '', isSending: false });

    const fetchContacts = async () => {
        const res = await fetch('https://localhost:7010/api/admin/lienhe');
        const data = await res.json();
        setContacts(data);
    };

    useEffect(() => { fetchContacts(); }, []);

    const handleSendReply = async (e) => {
        e.preventDefault();
        setReplyModal(prev => ({ ...prev, isSending: true }));
        try {
            const res = await fetch(`https://localhost:7010/api/admin/lienhe/${replyModal.data.maLienHe}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noiDungTraLoi: replyModal.message })
            });
            if (res.ok) {
                alert("Đã gửi email phản hồi thành công!");
                setReplyModal({ isOpen: false, data: null, message: '', isSending: false });
                fetchContacts(); // Tải lại danh sách để cập nhật trạng thái
            }
        } catch (error) {
            alert("Lỗi khi gửi mail!");
            setReplyModal(prev => ({ ...prev, isSending: false }));
        }
    };

    // LOGIC TÌM KIẾM
    const filteredContacts = contacts.filter(c => 
        c.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quản lý Liên Hệ</h2>
            
            <input 
                type="text" 
                placeholder="Tìm kiếm theo Tên hoặc Email..." 
                className="w-full mb-4 p-2 border rounded"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />

            <table className="min-w-full text-left text-sm border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 border-b">Ngày gửi</th>
                        <th className="p-3 border-b">Họ Tên</th>
                        <th className="p-3 border-b">Email</th>
                        <th className="p-3 border-b w-1/3">Nội dung</th>
                        <th className="p-3 border-b text-center">Trạng thái</th>
                        <th className="p-3 border-b text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredContacts.map(c => (
                        <tr key={c.maLienHe} className="hover:bg-gray-50">
                            <td className="p-3 border-b">{new Date(c.ngayGui).toLocaleString('vi-VN')}</td>
                            <td className="p-3 border-b font-medium">{c.hoTen}</td>
                            <td className="p-3 border-b">{c.email}</td>
                            <td className="p-3 border-b text-gray-600 truncate max-w-xs">{c.noiDung}</td>
                            <td className="p-3 border-b text-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${c.daTraLoi ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {c.daTraLoi ? 'Đã trả lời' : 'Chưa xử lý'}
                                </span>
                            </td>
                            <td className="p-3 border-b text-center">
                                {!c.daTraLoi && (
                                    <button onClick={() => setReplyModal({ isOpen: true, data: c, message: '', isSending: false })} className="text-blue-600 font-bold hover:underline">
                                        Trả lời Mail
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal Gửi Mail */}
            {replyModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[500px]">
                        <h3 className="text-lg font-bold mb-2">Trả lời liên hệ</h3>
                        <p className="text-sm text-gray-600 mb-4">Gửi tới: <span className="font-bold">{replyModal.data.email}</span></p>
                        <form onSubmit={handleSendReply}>
                            <textarea 
                                rows="5" required 
                                placeholder="Nhập nội dung email phản hồi..."
                                className="w-full border p-2 rounded mb-4"
                                value={replyModal.message}
                                onChange={e => setReplyModal({...replyModal, message: e.target.value})}
                            ></textarea>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setReplyModal({...replyModal, isOpen: false})} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                                <button type="submit" disabled={replyModal.isSending} className="px-4 py-2 bg-blue-600 text-white rounded">
                                    {replyModal.isSending ? 'Đang gửi...' : 'Gửi Email'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactManager;