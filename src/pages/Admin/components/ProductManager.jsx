import { useState, useEffect } from 'react';

const API_SACH = 'https://localhost:7010/api/admin/sach';
const API_LOAI_SACH = 'https://localhost:7010/api/admin/loaisach';
const API_KM = 'https://localhost:7010/api/admin/khuyenmai';
const API_BIEN_THE = 'https://localhost:7010/api/admin/bienthe';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [promotions, setPromotions] = useState([]);
    
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({ 
        maSach: 0, tenSach: '', moTa: '', gia: 0, soLuong: 0, 
        trangThaiAI: '', hienThi: true, hienThiTrangSale: false, maLoai: '', maKM: '', hinhAnh: '' 
    });

    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [newVariant, setNewVariant] = useState({ tenBienThe: '', giaCongThem: 0, soLuong: 0 });

    const fetchData = async () => {
        const [resSach, resLoai, resKM] = await Promise.all([
            fetch(API_SACH), fetch(API_LOAI_SACH), fetch(API_KM)
        ]);
        setProducts(await resSach.json());
        setCategories(await resLoai.json());
        setPromotions(await resKM.json());
    };

    useEffect(() => { fetchData(); }, []);

    // HÀM XỬ LÝ UPLOAD ẢNH
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_SACH}/upload-image`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                // Cập nhật đường dẫn ảnh vào form
                setCurrentProduct({ ...currentProduct, hinhAnh: data.url });
            }
        } catch (error) {
            console.error('Lỗi upload ảnh:', error);
            alert('Upload ảnh thất bại!');
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        const payload = {
            ...currentProduct,
            maLoai: currentProduct.maLoai ? parseInt(currentProduct.maLoai) : null,
            maKM: currentProduct.maKM ? parseInt(currentProduct.maKM) : null
        };
        
        const isUpdate = currentProduct.maSach !== 0;
        await fetch(isUpdate ? `${API_SACH}/${currentProduct.maSach}` : API_SACH, {
            method: isUpdate ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        fetchData();
        setIsProductModalOpen(false);
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Bạn muốn xóa sách này?')) return;
        await fetch(`${API_SACH}/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const toggleSale = async (id) => {
        await fetch(`${API_SACH}/${id}/toggle-sale`, { method: 'PATCH' });
        fetchData(); 
    };

    const openProductForm = (prod = null) => {
        if (prod) {
            setCurrentProduct({
                ...prod,
                maLoai: prod.maLoai || '',
                maKM: prod.maKM || '',
                hinhAnh: prod.hinhAnh || ''
            });
        } else {
            setCurrentProduct({ maSach: 0, tenSach: '', moTa: '', gia: 0, soLuong: 0, trangThaiAI: '', hienThi: true, hienThiTrangSale: false, maLoai: '', maKM: '', hinhAnh: '' });
        }
        setIsProductModalOpen(true);
    };

    const openVariantModal = async (product) => {
        setSelectedProduct(product);
        const res = await fetch(`${API_BIEN_THE}/sach/${product.maSach}`);
        setVariants(await res.json());
        setIsVariantModalOpen(true);
    };

    const handleAddVariant = async (e) => {
        e.preventDefault();
        const payload = { ...newVariant, maSach: selectedProduct.maSach };
        await fetch(API_BIEN_THE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        setNewVariant({ tenBienThe: '', giaCongThem: 0, soLuong: 0 });
        const res = await fetch(`${API_BIEN_THE}/sach/${selectedProduct.maSach}`);
        setVariants(await res.json());
    };

    const handleDeleteVariant = async (id) => {
        await fetch(`${API_BIEN_THE}/${id}`, { method: 'DELETE' });
        const res = await fetch(`${API_BIEN_THE}/sach/${selectedProduct.maSach}`);
        setVariants(await res.json());
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Quản lý Sản Phẩm</h2>
                <button onClick={() => openProductForm()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Thêm Sách Mới
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border text-left text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 border-b">Ảnh</th>
                            <th className="p-3 border-b w-1/4">Tên Sách</th>
                            <th className="p-3 border-b">Giá Gốc</th>
                            <th className="p-3 border-b">Tồn kho</th>
                            <th className="p-3 border-b text-center">Bật trang Sale</th>
                            <th className="p-3 border-b text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.maSach} className="hover:bg-gray-50">
                                <td className="p-3 border-b">
                                    {p.hinhAnh ? (
                                        <img src={`https://localhost:7010${p.hinhAnh}`} alt="Book" className="w-12 h-16 object-cover rounded shadow-sm" />
                                    ) : (
                                        <div className="w-12 h-16 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 rounded">Trống</div>
                                    )}
                                </td>
                                <td className="p-3 border-b font-medium text-blue-600">{p.tenSach}</td>
                                <td className="p-3 border-b">{p.gia.toLocaleString()} đ</td>
                                <td className="p-3 border-b">{p.soLuong}</td>
                                <td className="p-3 border-b text-center">
                                    <button 
                                        onClick={() => toggleSale(p.maSach)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                            p.hienThiTrangSale ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'
                                        }`}
                                    >
                                        {p.hienThiTrangSale ? 'Đang bật Sale' : 'Tắt'}
                                    </button>
                                </td>
                                <td className="p-3 border-b text-center">
                                    <button onClick={() => openVariantModal(p)} className="text-purple-600 font-bold mx-2">Biến thể</button>
                                    <button onClick={() => openProductForm(p)} className="text-yellow-600 mx-2">Sửa</button>
                                    <button onClick={() => handleDeleteProduct(p.maSach)} className="text-red-600 mx-2">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isProductModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">{currentProduct.maSach === 0 ? 'Thêm Sách' : 'Sửa Sách'}</h3>
                        <form onSubmit={handleSaveProduct} className="grid grid-cols-2 gap-4">
                            
                            {/* Khu vực Upload Ảnh */}
                            <div className="col-span-2 flex gap-4 items-center bg-gray-50 p-4 rounded border border-dashed border-gray-300">
                                <div className="w-24 h-32 bg-gray-200 flex items-center justify-center rounded overflow-hidden shadow-inner">
                                    {currentProduct.hinhAnh ? (
                                        <img src={`https://localhost:7010${currentProduct.hinhAnh}`} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-gray-400">Chưa có ảnh</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-2">Ảnh bìa sách (Tự động lưu khi chọn)</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                    />
                                    <input type="hidden" value={currentProduct.hinhAnh} />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium">Tên Sách</label>
                                <input type="text" required className="w-full border p-2 rounded" 
                                    value={currentProduct.tenSach} onChange={e => setCurrentProduct({...currentProduct, tenSach: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">Mô tả</label>
                                <textarea className="w-full border p-2 rounded" rows="3"
                                    value={currentProduct.moTa} onChange={e => setCurrentProduct({...currentProduct, moTa: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Giá</label>
                                <input type="number" required className="w-full border p-2 rounded" 
                                    value={currentProduct.gia} onChange={e => setCurrentProduct({...currentProduct, gia: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Số lượng</label>
                                <input type="number" required className="w-full border p-2 rounded" 
                                    value={currentProduct.soLuong} onChange={e => setCurrentProduct({...currentProduct, soLuong: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Loại Sách</label>
                                <select className="w-full border p-2 rounded" value={currentProduct.maLoai} onChange={e => setCurrentProduct({...currentProduct, maLoai: e.target.value})}>
                                    <option value="">-- Chọn loại --</option>
                                    {categories.map(c => <option key={c.maLoai} value={c.maLoai}>{c.tenLoai}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Đợt Khuyến Mãi (Nếu có)</label>
                                <select className="w-full border p-2 rounded" value={currentProduct.maKM} onChange={e => setCurrentProduct({...currentProduct, maKM: e.target.value})}>
                                    <option value="">-- Không tham gia KM --</option>
                                    {promotions.map(km => <option key={km.maKM} value={km.maKM}>{km.tenKM}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 flex justify-end space-x-2 mt-4">
                                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu Sách</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isVariantModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    {/* ... (Phần Biến thể giữ nguyên như cũ) */}
                    <div className="bg-white p-6 rounded-lg w-[600px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Biến thể sách: {selectedProduct?.tenSach}</h3>
                            <button onClick={() => setIsVariantModalOpen(false)} className="text-red-500 font-bold">Đóng X</button>
                        </div>
                        <div className="max-h-60 overflow-y-auto mb-4 border rounded">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 border-b">Tên (Bìa cứng/Chữ ký)</th>
                                        <th className="p-2 border-b">Giá cộng thêm</th>
                                        <th className="p-2 border-b">SL</th>
                                        <th className="p-2 border-b text-center">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variants.map(v => (
                                        <tr key={v.maBienThe}>
                                            <td className="p-2 border-b">{v.tenBienThe}</td>
                                            <td className="p-2 border-b">+{v.giaCongThem.toLocaleString()}đ</td>
                                            <td className="p-2 border-b">{v.soLuong}</td>
                                            <td className="p-2 border-b text-center">
                                                <button onClick={() => handleDeleteVariant(v.maBienThe)} className="text-red-600">X</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {variants.length === 0 && <tr><td colSpan="4" className="p-4 text-center">Chưa có biến thể nào</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <form onSubmit={handleAddVariant} className="flex gap-2 items-end bg-gray-50 p-3 rounded">
                            <div className="w-1/2">
                                <label className="block text-xs font-medium">Tên biến thể</label>
                                <input type="text" required placeholder="VD: Bìa cứng" className="w-full border p-1 rounded" 
                                    value={newVariant.tenBienThe} onChange={e => setNewVariant({...newVariant, tenBienThe: e.target.value})} />
                            </div>
                            <div className="w-1/4">
                                <label className="block text-xs font-medium">Giá (+ thêm)</label>
                                <input type="number" required className="w-full border p-1 rounded" 
                                    value={newVariant.giaCongThem} onChange={e => setNewVariant({...newVariant, giaCongThem: e.target.value})} />
                            </div>
                            <div className="w-1/4">
                                <label className="block text-xs font-medium">Kho</label>
                                <input type="number" required className="w-full border p-1 rounded" 
                                    value={newVariant.soLuong} onChange={e => setNewVariant({...newVariant, soLuong: e.target.value})} />
                            </div>
                            <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded font-bold h-[34px]">Thêm</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManager;