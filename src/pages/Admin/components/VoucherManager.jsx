// import { useState, useEffect } from 'react';

// const VoucherManager = () => {
//     const [vouchers, setVouchers] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [formData, setFormData] = useState({
//         code: '', phanTramGiam: 0, tienGiamTrucTiep: 0, donHangToiThieu: 0, soLuong: 10, ngayHetHan: ''
//     });

//     const fetchVouchers = async () => {
//         const res = await fetch('https://localhost:7010/api/magiamgia');
//         if (res.ok) setVouchers(await res.json());
//     };

//     useEffect(() => { fetchVouchers(); }, []);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         await fetch('https://localhost:7010/api/magiamgia', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(formData)
//         });
//         setIsModalOpen(false);
//         fetchVouchers();
//     };

//     const handleDelete = async (id) => {
//         if (!window.confirm("Chắc chắn xóa mã này?")) return;
//         await fetch(`https://localhost:7010/api/magiamgia/${id}`, { method: 'DELETE' });
//         fetchVouchers();
//     };

//     return (
//         <div className="bg-white p-6 rounded-lg shadow">
//             <div className="flex justify-between mb-4">
//                 <h2 className="text-xl font-bold">Mã Giảm Giá</h2>
//                 <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">+ Thêm Mã</button>
//             </div>
            
//             <table className="w-full text-left text-sm border">
//                 <thead className="bg-gray-100">
//                     <tr>
//                         <th className="p-2 border">Code</th>
//                         <th className="p-2 border">Mức giảm</th>
//                         <th className="p-2 border">Đơn tối thiểu</th>
//                         <th className="p-2 border">Còn lại</th>
//                         <th className="p-2 border">Hạn Dùng</th>
//                         <th className="p-2 border text-center">Xóa</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {vouchers.map(v => (
//                         <tr key={v.id}>
//                             <td className="p-2 border font-bold text-red-600">{v.code}</td>
//                             <td className="p-2 border">{v.phanTramGiam > 0 ? `${v.phanTramGiam}%` : `${v.tienGiamTrucTiep.toLocaleString()}đ`}</td>
//                             <td className="p-2 border">{v.donHangToiThieu.toLocaleString()}đ</td>
//                             <td className="p-2 border">{v.soLuong}</td>
//                             <td className="p-2 border">{new Date(v.ngayHetHan).toLocaleDateString('vi-VN')}</td>
//                             <td className="p-2 border text-center"><button onClick={() => handleDelete(v.id)} className="text-red-600 font-bold">X</button></td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//                     <div className="bg-white p-6 rounded-lg w-[400px]">
//                         <h3 className="font-bold mb-4">Thêm Voucher</h3>
//                         <form onSubmit={handleSubmit} className="space-y-3 text-sm">
//                             <input type="text" placeholder="Mã Code (VD: SUMMER20)" required className="w-full border p-2 rounded uppercase" onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
//                             <div className="flex gap-2">
//                                 <input type="number" placeholder="% Giảm" className="w-1/2 border p-2 rounded" onChange={e => setFormData({...formData, phanTramGiam: Number(e.target.value)})} />
//                                 <input type="number" placeholder="Hoặc Tiền Giảm (đ)" className="w-1/2 border p-2 rounded" onChange={e => setFormData({...formData, tienGiamTrucTiep: Number(e.target.value)})} />
//                             </div>
//                             <input type="number" placeholder="Đơn hàng tối thiểu (đ)" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, donHangToiThieu: Number(e.target.value)})} />
//                             <input type="number" placeholder="Số lượng mã" required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, soLuong: Number(e.target.value)})} />
//                             <input type="datetime-local" required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, ngayHetHan: e.target.value})} />
                            
//                             <div className="flex justify-end gap-2 mt-4">
//                                 <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">Hủy</button>
//                                 <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Lưu</button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default VoucherManager;


import { useState, useEffect, useMemo } from 'react';
import './VoucherManager.css';

const API = 'https://localhost:7010';

const emptyForm = {
    code: '',
    phanTramGiam: 0,
    tienGiamTrucTiep: 0,
    donHangToiThieu: 0,
    soLuong: 10,
    ngayHetHan: '',
};

const formatMoney = (n) => `${(n ?? 0).toLocaleString('vi-VN')} đ`;

// Tính trạng thái hiển thị của voucher
const getVoucherStatus = (v) => {
    if (new Date(v.ngayHetHan) < new Date()) return { label: 'Hết hạn', tone: 'bad' };
    if (v.soLuong <= 0) return { label: 'Hết lượt dùng', tone: 'wait' };
    return { label: 'Đang hoạt động', tone: 'ok' };
};

const VoucherManager = () => {
    const [vouchers, setVouchers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(emptyForm);

    const fetchVouchers = async () => {
        const res = await fetch(`${API}/api/magiamgia`);
        if (res.ok) setVouchers(await res.json());
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    // Đóng modal bằng phím Esc
    useEffect(() => {
        if (!isModalOpen) return;
        const onKey = (e) => e.key === 'Escape' && closeModal();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isModalOpen]);

    const openModal = () => {
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API}/api/magiamgia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        closeModal();
        fetchVouchers();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Chắc chắn xóa mã này?')) return;
        await fetch(`${API}/api/magiamgia/${id}`, { method: 'DELETE' });
        fetchVouchers();
    };

    // Số liệu tổng quan
    const summary = useMemo(() => {
        const active = vouchers.filter((v) => getVoucherStatus(v).tone === 'ok').length;
        const expired = vouchers.filter((v) => new Date(v.ngayHetHan) < new Date()).length;
        return { total: vouchers.length, active, expired };
    }, [vouchers]);

    return (
        <div className="vm-page">
            {/* Banner */}
            <div className="vm-hero">
                <div className="vm-container">
                    <header className="vm-header">
                        <div>
                            <h2 className="vm-title">Mã giảm giá</h2>
                            <p className="vm-subtitle">Tạo và quản lý voucher khuyến mãi cho khách hàng của cửa hàng</p>
                        </div>
                        <button onClick={openModal} className="vm-btn-add">
                            <span className="vm-btn-add-icon">+</span> Thêm mã
                        </button>
                    </header>
                </div>
            </div>

            <main className="vm-container vm-main">
                {/* Tổng quan */}
                <section className="vm-summary">
                    <div className="vm-summary-item">
                        <span className="vm-summary-icon" data-tone="info">🎟️</span>
                        <div>
                            <p className="vm-summary-label">Tổng số mã</p>
                            <p className="vm-summary-value">{summary.total}</p>
                        </div>
                    </div>
                    <div className="vm-summary-item">
                        <span className="vm-summary-icon" data-tone="ok">✅</span>
                        <div>
                            <p className="vm-summary-label">Đang hoạt động</p>
                            <p className="vm-summary-value">{summary.active}</p>
                        </div>
                    </div>
                    <div className="vm-summary-item">
                        <span className="vm-summary-icon" data-tone="bad">⌛</span>
                        <div>
                            <p className="vm-summary-label">Đã hết hạn</p>
                            <p className="vm-summary-value">{summary.expired}</p>
                        </div>
                    </div>
                </section>

                {/* Bảng voucher */}
                <section className="vm-panel">
                    <div className="vm-table-wrap">
                        <table className="vm-table">
                            <thead>
                                <tr>
                                    <th>Mã code</th>
                                    <th>Mức giảm</th>
                                    <th>Đơn tối thiểu</th>
                                    <th>Còn lại</th>
                                    <th>Hạn dùng</th>
                                    <th>Trạng thái</th>
                                    <th className="vm-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vouchers.map((v) => {
                                    const status = getVoucherStatus(v);
                                    return (
                                        <tr key={v.id}>
                                            <td>
                                                <span className="vm-code">{v.code}</span>
                                            </td>
                                            <td className="vm-discount">
                                                {v.phanTramGiam > 0
                                                    ? `${v.phanTramGiam}%`
                                                    : formatMoney(v.tienGiamTrucTiep)}
                                            </td>
                                            <td className="vm-num">{formatMoney(v.donHangToiThieu)}</td>
                                            <td className="vm-qty">{v.soLuong}</td>
                                            <td className="vm-date">
                                                {new Date(v.ngayHetHan).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td>
                                                <span className="vm-badge" data-tone={status.tone}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="vm-center">
                                                <button onClick={() => handleDelete(v.id)} className="vm-btn-delete">
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {vouchers.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="vm-empty">
                                            <p className="vm-empty-title">Chưa có mã giảm giá nào</p>
                                            <p className="vm-empty-hint">Bấm "Thêm mã" để tạo voucher đầu tiên.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* MODAL THÊM VOUCHER */}
                {isModalOpen && (
                    <div
                        className="vm-overlay"
                        onClick={(e) => e.target === e.currentTarget && closeModal()}
                    >
                        <div className="vm-modal" role="dialog" aria-modal="true" aria-labelledby="vm-modal-title">
                            <div className="vm-modal-head">
                                <h3 className="vm-modal-title" id="vm-modal-title">Thêm voucher</h3>
                                <button onClick={closeModal} className="vm-close" aria-label="Đóng">
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="vm-form">
                                <div className="vm-field">
                                    <label className="vm-label" htmlFor="vm-code">Mã code</label>
                                    <input
                                        id="vm-code"
                                        type="text"
                                        placeholder="VD: SUMMER20"
                                        required
                                        className="vm-input vm-input--code"
                                        value={formData.code}
                                        onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                                    />
                                </div>

                                <div className="vm-row">
                                    <div className="vm-field">
                                        <label className="vm-label" htmlFor="vm-percent">Giảm theo %</label>
                                        <input
                                            id="vm-percent"
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="VD: 10"
                                            className="vm-input"
                                            value={formData.phanTramGiam || ''}
                                            onChange={(e) => updateField('phanTramGiam', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="vm-field">
                                        <label className="vm-label" htmlFor="vm-amount">Hoặc giảm tiền (đ)</label>
                                        <input
                                            id="vm-amount"
                                            type="number"
                                            min="0"
                                            placeholder="VD: 30000"
                                            className="vm-input"
                                            value={formData.tienGiamTrucTiep || ''}
                                            onChange={(e) => updateField('tienGiamTrucTiep', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <p className="vm-hint">
                                    Nhập một trong hai. Nếu nhập cả hai, hệ thống ưu tiên hiển thị giảm theo %.
                                </p>

                                <div className="vm-field">
                                    <label className="vm-label" htmlFor="vm-min">Đơn hàng tối thiểu (đ)</label>
                                    <input
                                        id="vm-min"
                                        type="number"
                                        min="0"
                                        placeholder="VD: 200000"
                                        className="vm-input"
                                        value={formData.donHangToiThieu || ''}
                                        onChange={(e) => updateField('donHangToiThieu', Number(e.target.value))}
                                    />
                                </div>

                                <div className="vm-row">
                                    <div className="vm-field">
                                        <label className="vm-label" htmlFor="vm-qty">Số lượng mã</label>
                                        <input
                                            id="vm-qty"
                                            type="number"
                                            min="1"
                                            placeholder="VD: 100"
                                            required
                                            className="vm-input"
                                            value={formData.soLuong || ''}
                                            onChange={(e) => updateField('soLuong', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="vm-field">
                                        <label className="vm-label" htmlFor="vm-expire">Hạn dùng</label>
                                        <input
                                            id="vm-expire"
                                            type="datetime-local"
                                            required
                                            className="vm-input"
                                            value={formData.ngayHetHan}
                                            onChange={(e) => updateField('ngayHetHan', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="vm-actions">
                                    <button type="button" onClick={closeModal} className="vm-btn-cancel">
                                        Hủy
                                    </button>
                                    <button type="submit" className="vm-btn-save">
                                        Lưu voucher
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

export default VoucherManager;
