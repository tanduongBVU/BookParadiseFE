import { useState, useEffect } from 'react';

const VoucherManager = () => {
    const [vouchers, setVouchers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '', phanTramGiam: 0, tienGiamTrucTiep: 0, donHangToiThieu: 0, soLuong: 10, ngayHetHan: ''
    });

    const fetchVouchers = async () => {
        const res = await fetch('https://localhost:7010/api/magiamgia');
        if (res.ok) setVouchers(await res.json());
    };

    useEffect(() => { fetchVouchers(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch('https://localhost:7010/api/magiamgia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setIsModalOpen(false);
        fetchVouchers();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Chắc chắn xóa mã này?")) return;
        await fetch(`https://localhost:7010/api/magiamgia/${id}`, { method: 'DELETE' });
        fetchVouchers();
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Mã Giảm Giá</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">+ Thêm Mã</button>
            </div>
            
            <table className="w-full text-left text-sm border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Code</th>
                        <th className="p-2 border">Mức giảm</th>
                        <th className="p-2 border">Đơn tối thiểu</th>
                        <th className="p-2 border">Còn lại</th>
                        <th className="p-2 border">Hạn Dùng</th>
                        <th className="p-2 border text-center">Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {vouchers.map(v => (
                        <tr key={v.id}>
                            <td className="p-2 border font-bold text-red-600">{v.code}</td>
                            <td className="p-2 border">{v.phanTramGiam > 0 ? `${v.phanTramGiam}%` : `${v.tienGiamTrucTiep.toLocaleString()}đ`}</td>
                            <td className="p-2 border">{v.donHangToiThieu.toLocaleString()}đ</td>
                            <td className="p-2 border">{v.soLuong}</td>
                            <td className="p-2 border">{new Date(v.ngayHetHan).toLocaleDateString('vi-VN')}</td>
                            <td className="p-2 border text-center"><button onClick={() => handleDelete(v.id)} className="text-red-600 font-bold">X</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[400px]">
                        <h3 className="font-bold mb-4">Thêm Voucher</h3>
                        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                            <input type="text" placeholder="Mã Code (VD: SUMMER20)" required className="w-full border p-2 rounded uppercase" onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                            <div className="flex gap-2">
                                <input type="number" placeholder="% Giảm" className="w-1/2 border p-2 rounded" onChange={e => setFormData({...formData, phanTramGiam: Number(e.target.value)})} />
                                <input type="number" placeholder="Hoặc Tiền Giảm (đ)" className="w-1/2 border p-2 rounded" onChange={e => setFormData({...formData, tienGiamTrucTiep: Number(e.target.value)})} />
                            </div>
                            <input type="number" placeholder="Đơn hàng tối thiểu (đ)" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, donHangToiThieu: Number(e.target.value)})} />
                            <input type="number" placeholder="Số lượng mã" required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, soLuong: Number(e.target.value)})} />
                            <input type="datetime-local" required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, ngayHetHan: e.target.value})} />
                            
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">Hủy</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherManager;