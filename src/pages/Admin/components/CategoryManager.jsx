import { useState, useEffect } from 'react';

// LƯU Ý: Thay đổi cổng localhost cho khớp với Backend C# của bạn đang chạy (ví dụ: 5xxx hoặc 7xxx)
const API_URL = 'https://localhost:7010/api/admin/loaisach'; 

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ maLoai: 0, tenLoai: '' });

    // Lấy danh sách loại sách
    const fetchCategories = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Lỗi khi tải loại sách:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Xử lý Lưu (Thêm mới hoặc Cập nhật)
    const handleSave = async (e) => {
        e.preventDefault();
        const isUpdate = currentCategory.maLoai !== 0;
        const url = isUpdate ? `${API_URL}/${currentCategory.maLoai}` : API_URL;
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentCategory)
            });
            fetchCategories();
            setIsModalOpen(false);
            setCurrentCategory({ maLoai: 0, tenLoai: '' });
        } catch (error) {
            console.error('Lỗi khi lưu:', error);
        }
    };

    // Xử lý Xóa
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa loại sách này?')) return;
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (error) {
            console.error('Lỗi khi xóa:', error);
        }
    };

    // Mở form thêm mới
    const openAddForm = () => {
        setCurrentCategory({ maLoai: 0, tenLoai: '' });
        setIsModalOpen(true);
    };

    // Mở form sửa
    const openEditForm = (category) => {
        setCurrentCategory(category);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Quản lý Loại Sách</h2>
                <button 
                    onClick={openAddForm}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Thêm Loại Sách
                </button>
            </div>

            {/* Bảng danh sách */}
            <div className="overflow-x-auto">
                <table className="min-w-full border text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 border-b">ID</th>
                            <th className="p-3 border-b">Tên Loại Sách</th>
                            <th className="p-3 border-b">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.maLoai} className="hover:bg-gray-50">
                                <td className="p-3 border-b">{cat.maLoai}</td>
                                <td className="p-3 border-b font-medium">{cat.tenLoai}</td>
                                <td className="p-3 border-b">
                                    <button onClick={() => openEditForm(cat)} className="text-yellow-600 hover:underline mr-3">Sửa</button>
                                    <button onClick={() => handleDelete(cat.maLoai)} className="text-red-600 hover:underline">Xóa</button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr><td colSpan="3" className="text-center p-4 text-gray-500">Chưa có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form Thêm/Sửa */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-bold mb-4">
                            {currentCategory.maLoai === 0 ? 'Thêm Loại Sách Mới' : 'Sửa Loại Sách'}
                        </h3>
                        <form onSubmit={handleSave}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Tên loại sách</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={currentCategory.tenLoai}
                                    onChange={(e) => setCurrentCategory({...currentCategory, tenLoai: e.target.value})}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                                    Hủy
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;