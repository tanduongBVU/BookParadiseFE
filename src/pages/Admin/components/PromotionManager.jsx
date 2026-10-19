import { useState, useEffect } from 'react';

const API_URL = 'https://localhost:7010/api/admin/khuyenmai';

const PromotionManager = () => {
    const [promotions, setPromotions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPromo, setCurrentPromo] = useState({ 
        maKM: 0, tenKM: '', phanTramGiam: 0, ngayBatDau: '', ngayKetThuc: '' 
    });

    const fetchPromotions = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setPromotions(data);
        } catch (error) {
            console.error('Lỗi khi tải khuyến mãi:', error);
        }
    };

    useEffect(() => { fetchPromotions(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        const isUpdate = currentPromo.maKM !== 0;
        const url = isUpdate ? `${API_URL}/${currentPromo.maKM}` : API_URL;
        
        try {
            await fetch(url, {
                method: isUpdate ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentPromo)
            });
            fetchPromotions();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Lỗi khi lưu:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) return;
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchPromotions();
    };

    // Hàm chuyển đổi định dạng ngày giờ để hiển thị vào input datetime-local
    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().slice(0, 16); // Lấy định dạng YYYY-MM-DDTHH:mm
    };

    const openForm = (promo = { maKM: 0, tenKM: '', phanTramGiam: 0, ngayBatDau: '', ngayKetThuc: '' }) => {
        setCurrentPromo({
            ...promo,
            ngayBatDau: formatDateTime(promo.ngayBatDau),
            ngayKetThuc: formatDateTime(promo.ngayKetThuc)
        });
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Quản lý Khuyến Mãi</h2>
                <button onClick={() => openForm()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Thêm Khuyến Mãi
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 border-b">ID</th>
                            <th className="p-3 border-b">Tên CTKM</th>
                            <th className="p-3 border-b">Giảm (%)</th>
                            <th className="p-3 border-b">Thời gian</th>
                            <th className="p-3 border-b">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.map((promo) => (
                            <tr key={promo.maKM} className="hover:bg-gray-50">
                                <td className="p-3 border-b">{promo.maKM}</td>
                                <td className="p-3 border-b font-medium">{promo.tenKM}</td>
                                <td className="p-3 border-b text-red-600 font-bold">{promo.phanTramGiam}%</td>
                                <td className="p-3 border-b text-sm">
                                    Từ: {new Date(promo.ngayBatDau).toLocaleDateString('vi-VN')} <br/>
                                    Đến: {new Date(promo.ngayKetThuc).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-3 border-b">
                                    <button onClick={() => openForm(promo)} className="text-yellow-600 mr-3">Sửa</button>
                                    <button onClick={() => handleDelete(promo.maKM)} className="text-red-600">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[500px]">
                        <h3 className="text-lg font-bold mb-4">{currentPromo.maKM === 0 ? 'Thêm Khuyến Mãi' : 'Sửa Khuyến Mãi'}</h3>
                        <form onSubmit={handleSave}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium">Tên Khuyến Mãi</label>
                                <input type="text" required className="w-full border p-2 rounded"
                                    value={currentPromo.tenKM} onChange={e => setCurrentPromo({...currentPromo, tenKM: e.target.value})} />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium">Phần trăm giảm (%)</label>
                                <input type="number" required min="0" max="100" className="w-full border p-2 rounded"
                                    value={currentPromo.phanTramGiam} onChange={e => setCurrentPromo({...currentPromo, phanTramGiam: e.target.value})} />
                            </div>
                            <div className="mb-3 flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium">Bắt đầu</label>
                                    <input type="datetime-local" required className="w-full border p-2 rounded"
                                        value={currentPromo.ngayBatDau} onChange={e => setCurrentPromo({...currentPromo, ngayBatDau: e.target.value})} />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium">Kết thúc</label>
                                    <input type="datetime-local" required className="w-full border p-2 rounded"
                                        value={currentPromo.ngayKetThuc} onChange={e => setCurrentPromo({...currentPromo, ngayKetThuc: e.target.value})} />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionManager;