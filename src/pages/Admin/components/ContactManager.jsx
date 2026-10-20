// import { useState, useEffect } from 'react';

// const ContactManager = () => {
//     const [contacts, setContacts] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [replyModal, setReplyModal] = useState({ isOpen: false, data: null, message: '', isSending: false });

//     const fetchContacts = async () => {
//         const res = await fetch('https://localhost:7010/api/admin/lienhe');
//         const data = await res.json();
//         setContacts(data);
//     };

//     useEffect(() => { fetchContacts(); }, []);

//     const handleSendReply = async (e) => {
//         e.preventDefault();
//         setReplyModal(prev => ({ ...prev, isSending: true }));
//         try {
//             const res = await fetch(`https://localhost:7010/api/admin/lienhe/${replyModal.data.maLienHe}/reply`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ noiDungTraLoi: replyModal.message })
//             });
//             if (res.ok) {
//                 alert("Đã gửi email phản hồi thành công!");
//                 setReplyModal({ isOpen: false, data: null, message: '', isSending: false });
//                 fetchContacts(); // Tải lại danh sách để cập nhật trạng thái
//             }
//         } catch (error) {
//             alert("Lỗi khi gửi mail!");
//             setReplyModal(prev => ({ ...prev, isSending: false }));
//         }
//     };

//     // LOGIC TÌM KIẾM
//     const filteredContacts = contacts.filter(c => 
//         c.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) || 
//         c.email.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     return (
//         <div className="bg-white p-6 rounded-lg shadow">
//             <h2 className="text-xl font-bold text-gray-800 mb-4">Quản lý Liên Hệ</h2>
            
//             <input 
//                 type="text" 
//                 placeholder="Tìm kiếm theo Tên hoặc Email..." 
//                 className="w-full mb-4 p-2 border rounded"
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//             />

//             <table className="min-w-full text-left text-sm border">
//                 <thead className="bg-gray-100">
//                     <tr>
//                         <th className="p-3 border-b">Ngày gửi</th>
//                         <th className="p-3 border-b">Họ Tên</th>
//                         <th className="p-3 border-b">Email</th>
//                         <th className="p-3 border-b w-1/3">Nội dung</th>
//                         <th className="p-3 border-b text-center">Trạng thái</th>
//                         <th className="p-3 border-b text-center">Thao tác</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filteredContacts.map(c => (
//                         <tr key={c.maLienHe} className="hover:bg-gray-50">
//                             <td className="p-3 border-b">{new Date(c.ngayGui).toLocaleString('vi-VN')}</td>
//                             <td className="p-3 border-b font-medium">{c.hoTen}</td>
//                             <td className="p-3 border-b">{c.email}</td>
//                             <td className="p-3 border-b text-gray-600 truncate max-w-xs">{c.noiDung}</td>
//                             <td className="p-3 border-b text-center">
//                                 <span className={`px-2 py-1 rounded text-xs font-bold ${c.daTraLoi ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                                     {c.daTraLoi ? 'Đã trả lời' : 'Chưa xử lý'}
//                                 </span>
//                             </td>
//                             <td className="p-3 border-b text-center">
//                                 {!c.daTraLoi && (
//                                     <button onClick={() => setReplyModal({ isOpen: true, data: c, message: '', isSending: false })} className="text-blue-600 font-bold hover:underline">
//                                         Trả lời Mail
//                                     </button>
//                                 )}
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             {/* Modal Gửi Mail */}
//             {replyModal.isOpen && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 rounded-lg w-[500px]">
//                         <h3 className="text-lg font-bold mb-2">Trả lời liên hệ</h3>
//                         <p className="text-sm text-gray-600 mb-4">Gửi tới: <span className="font-bold">{replyModal.data.email}</span></p>
//                         <form onSubmit={handleSendReply}>
//                             <textarea 
//                                 rows="5" required 
//                                 placeholder="Nhập nội dung email phản hồi..."
//                                 className="w-full border p-2 rounded mb-4"
//                                 value={replyModal.message}
//                                 onChange={e => setReplyModal({...replyModal, message: e.target.value})}
//                             ></textarea>
//                             <div className="flex justify-end gap-2">
//                                 <button type="button" onClick={() => setReplyModal({...replyModal, isOpen: false})} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
//                                 <button type="submit" disabled={replyModal.isSending} className="px-4 py-2 bg-blue-600 text-white rounded">
//                                     {replyModal.isSending ? 'Đang gửi...' : 'Gửi Email'}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ContactManager;


import { useState, useEffect, useMemo } from 'react';
import './ContactManager.css';

const API = 'https://localhost:7010';

const closedModal = { isOpen: false, data: null, message: '', isSending: false };

const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chưa xử lý' },
    { key: 'replied', label: 'Đã trả lời' },
];

const ContactManager = () => {
    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [replyModal, setReplyModal] = useState(closedModal);

    const fetchContacts = async () => {
        const res = await fetch(`${API}/api/admin/lienhe`);
        if (res.ok) setContacts(await res.json());
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // Đóng modal bằng phím Esc (không đóng khi đang gửi)
    useEffect(() => {
        if (!replyModal.isOpen) return;
        const onKey = (e) => e.key === 'Escape' && closeModal();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [replyModal.isOpen, replyModal.isSending]);

    const closeModal = () => {
        if (replyModal.isSending) return;
        setReplyModal(closedModal);
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        setReplyModal((prev) => ({ ...prev, isSending: true }));
        try {
            const res = await fetch(`${API}/api/admin/lienhe/${replyModal.data.maLienHe}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noiDungTraLoi: replyModal.message }),
            });
            if (res.ok) {
                alert('Đã gửi email phản hồi thành công!');
                setReplyModal(closedModal);
                fetchContacts(); // Tải lại danh sách để cập nhật trạng thái
            } else {
                alert('Gửi email không thành công, vui lòng thử lại!');
                setReplyModal((prev) => ({ ...prev, isSending: false }));
            }
        } catch (error) {
            alert('Lỗi khi gửi mail!');
            setReplyModal((prev) => ({ ...prev, isSending: false }));
        }
    };

    // Số liệu theo trạng thái
    const counts = useMemo(() => {
        const replied = contacts.filter((c) => c.daTraLoi).length;
        return { all: contacts.length, replied, pending: contacts.length - replied };
    }, [contacts]);

    // LOGIC TÌM KIẾM + LỌC TRẠNG THÁI
    const keyword = searchTerm.toLowerCase();
    const filteredContacts = contacts.filter((c) => {
        const matchSearch =
            c.hoTen?.toLowerCase().includes(keyword) || c.email?.toLowerCase().includes(keyword);
        const matchFilter =
            filter === 'all' || (filter === 'replied' ? c.daTraLoi : !c.daTraLoi);
        return matchSearch && matchFilter;
    });

    return (
        <div className="ct-page">
            {/* Banner */}
            <div className="ct-hero">
                <div className="ct-container">
                    <header className="ct-header">
                        <h2 className="ct-title">Quản lý liên hệ</h2>
                        <p className="ct-subtitle">Xem tin nhắn khách hàng gửi đến và phản hồi trực tiếp qua email</p>
                    </header>
                </div>
            </div>

            <main className="ct-container ct-main">
                {/* Tổng quan */}
                <section className="ct-summary">
                    <div className="ct-summary-item">
                        <span className="ct-summary-icon" data-tone="info">✉️</span>
                        <div>
                            <p className="ct-summary-label">Tổng liên hệ</p>
                            <p className="ct-summary-value">{counts.all}</p>
                        </div>
                    </div>
                    <div className="ct-summary-item">
                        <span className="ct-summary-icon" data-tone="bad">📬</span>
                        <div>
                            <p className="ct-summary-label">Chưa xử lý</p>
                            <p className="ct-summary-value">{counts.pending}</p>
                        </div>
                    </div>
                    <div className="ct-summary-item">
                        <span className="ct-summary-icon" data-tone="ok">✅</span>
                        <div>
                            <p className="ct-summary-label">Đã trả lời</p>
                            <p className="ct-summary-value">{counts.replied}</p>
                        </div>
                    </div>
                </section>

                {/* Bảng liên hệ */}
                <section className="ct-panel">
                    <div className="ct-toolbar">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            className="ct-search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="ct-tabs">
                            {filters.map((f) => (
                                <button
                                    key={f.key}
                                    className="ct-tab"
                                    aria-pressed={filter === f.key}
                                    onClick={() => setFilter(f.key)}
                                >
                                    {f.label}
                                    <span className="ct-tab-count">{counts[f.key]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="ct-table-wrap">
                        <table className="ct-table">
                            <thead>
                                <tr>
                                    <th>Ngày gửi</th>
                                    <th>Họ tên</th>
                                    <th>Email</th>
                                    <th className="ct-col-content">Nội dung</th>
                                    <th className="ct-center">Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.map((c) => (
                                    <tr key={c.maLienHe}>
                                        <td className="ct-date">{new Date(c.ngayGui).toLocaleString('vi-VN')}</td>
                                        <td>
                                            <div className="ct-user">
                                                <span className="ct-avatar">
                                                    {(c.hoTen || '?').trim().charAt(0).toUpperCase()}
                                                </span>
                                                <span className="ct-user-name">{c.hoTen}</span>
                                            </div>
                                        </td>
                                        <td className="ct-email">{c.email}</td>
                                        <td>
                                            <p className="ct-message" title={c.noiDung}>{c.noiDung}</p>
                                        </td>
                                        <td className="ct-center">
                                            <span className="ct-badge" data-tone={c.daTraLoi ? 'ok' : 'bad'}>
                                                {c.daTraLoi ? 'Đã trả lời' : 'Chưa xử lý'}
                                            </span>
                                        </td>
                                        <td>
                                            {!c.daTraLoi ? (
                                                <button
                                                    onClick={() =>
                                                        setReplyModal({ isOpen: true, data: c, message: '', isSending: false })
                                                    }
                                                    className="ct-btn-reply"
                                                >
                                                    ✉️ Trả lời mail
                                                </button>
                                            ) : (
                                                <span className="ct-done">Hoàn tất</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {filteredContacts.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="ct-empty">
                                            <p className="ct-empty-title">
                                                {contacts.length === 0 ? 'Chưa có liên hệ nào' : 'Không tìm thấy liên hệ phù hợp'}
                                            </p>
                                            <p className="ct-empty-hint">
                                                {contacts.length === 0
                                                    ? 'Tin nhắn khách hàng gửi từ trang liên hệ sẽ hiện ở đây.'
                                                    : 'Thử đổi từ khóa hoặc chọn mục trạng thái khác.'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Modal gửi mail */}
                {replyModal.isOpen && (
                    <div
                        className="ct-overlay"
                        onClick={(e) => e.target === e.currentTarget && closeModal()}
                    >
                        <div className="ct-modal" role="dialog" aria-modal="true" aria-labelledby="ct-modal-title">
                            <div className="ct-modal-head">
                                <h3 className="ct-modal-title" id="ct-modal-title">Trả lời liên hệ</h3>
                                <button onClick={closeModal} className="ct-close" aria-label="Đóng">
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleSendReply} className="ct-form">
                                <div className="ct-recipient">
                                    <span className="ct-avatar">
                                        {(replyModal.data.hoTen || '?').trim().charAt(0).toUpperCase()}
                                    </span>
                                    <div>
                                        <p className="ct-recipient-label">Gửi tới</p>
                                        <p className="ct-recipient-mail">{replyModal.data.email}</p>
                                    </div>
                                </div>

                                <blockquote className="ct-quote">
                                    <p className="ct-quote-label">{replyModal.data.hoTen} đã viết</p>
                                    <p className="ct-quote-text">{replyModal.data.noiDung}</p>
                                </blockquote>

                                <div className="ct-field">
                                    <label className="ct-label" htmlFor="ct-reply">Nội dung phản hồi</label>
                                    <textarea
                                        id="ct-reply"
                                        required
                                        placeholder="Nhập nội dung email phản hồi..."
                                        className="ct-textarea"
                                        value={replyModal.message}
                                        onChange={(e) => setReplyModal({ ...replyModal, message: e.target.value })}
                                    />
                                </div>

                                <div className="ct-actions">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={replyModal.isSending}
                                        className="ct-btn-cancel"
                                    >
                                        Hủy
                                    </button>
                                    <button type="submit" disabled={replyModal.isSending} className="ct-btn-send">
                                        {replyModal.isSending ? 'Đang gửi...' : 'Gửi email'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ContactManager;
