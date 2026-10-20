import { useState, useEffect, useMemo } from 'react';
import './CategoryManager.css';

// LƯU Ý: Đổi cổng localhost cho khớp với Backend C# của bạn (ví dụ: 5xxx hoặc 7xxx)
const API_URL = 'https://localhost:7010/api/admin/loaisach';

const EMPTY_CATEGORY = { maLoai: 0, tenLoai: '' };

/* ---------- Icons (inline SVG, không cần cài thêm thư viện) ---------- */
const Icon = ({ d, className = 'ctg-icon' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d={d} />
    </svg>
);
const PlusIcon = () => <Icon d="M12 5v14M5 12h14" />;
const EditIcon = () => <Icon d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />;
const TrashIcon = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />;
const SearchIcon = () => <Icon d="M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />;

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(EMPTY_CATEGORY);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [saving, setSaving] = useState(false);

    // Lấy danh sách loại sách
    const fetchCategories = async () => {
        try {
            setError('');
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            setCategories(await response.json());
        } catch (err) {
            console.error('Lỗi khi tải loại sách:', err);
            setError('Không tải được danh sách. Kiểm tra backend đã chạy và cổng API đã đúng chưa.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Đóng modal bằng phím Esc
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setIsModalOpen(false);
                setDeleteTarget(null);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? categories.filter((c) => c.tenLoai.toLowerCase().includes(q)) : categories;
    }, [categories, search]);

    // Lưu (Thêm mới hoặc Cập nhật)
    const handleSave = async (e) => {
        e.preventDefault();
        const isUpdate = currentCategory.maLoai !== 0;
        const url = isUpdate ? `${API_URL}/${currentCategory.maLoai}` : API_URL;

        try {
            setSaving(true);
            const response = await fetch(url, {
                method: isUpdate ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentCategory),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            await fetchCategories();
            setIsModalOpen(false);
            setCurrentCategory(EMPTY_CATEGORY);
        } catch (err) {
            console.error('Lỗi khi lưu:', err);
            setError('Lưu thất bại. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    // Xóa
    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const response = await fetch(`${API_URL}/${deleteTarget.maLoai}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            setDeleteTarget(null);
            fetchCategories();
        } catch (err) {
            console.error('Lỗi khi xóa:', err);
            setDeleteTarget(null);
            setError('Không xóa được. Loại sách này có thể đang được dùng bởi sách khác.');
        }
    };

    const openAddForm = () => {
        setCurrentCategory(EMPTY_CATEGORY);
        setIsModalOpen(true);
    };

    const openEditForm = (category) => {
        setCurrentCategory(category);
        setIsModalOpen(true);
    };

    return (
        <div className="ctg-page">
            {/* Banner */}
            <div className="ctg-hero">
                <div className="ctg-container">
                    <header className="ctg-header">
                        <div>
                            <h2 className="ctg-title">Quản lý loại sách</h2>
                            <p className="ctg-subtitle">
                                Sắp xếp sách theo từng thể loại để khách hàng dễ tìm kiếm hơn
                            </p>
                        </div>
                        <button onClick={openAddForm} className="ctg-btn ctg-btn-add">
                            <PlusIcon />
                            Thêm loại sách
                        </button>
                    </header>
                </div>
            </div>

            <main className="ctg-container ctg-main">
                {/* Thông báo lỗi */}
                {error && (
                    <div className="ctg-alert" role="alert">
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="ctg-alert-close">Đóng</button>
                    </div>
                )}

                {/* Bảng */}
                <section className="ctg-panel">
                    <div className="ctg-toolbar">
                        <div className="ctg-search">
                            <span className="ctg-search-icon"><SearchIcon /></span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm loại sách..."
                                className="ctg-search-input"
                            />
                        </div>
                        <span className="ctg-count">{categories.length} loại sách</span>
                    </div>

                    <div className="ctg-table-wrap">
                        <table className="ctg-table">
                            <thead>
                                <tr>
                                    <th className="ctg-col-id">Mã</th>
                                    <th>Tên loại sách</th>
                                    <th className="ctg-col-actions">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr><td colSpan="3" className="ctg-empty">Đang tải dữ liệu...</td></tr>
                                )}

                                {!loading && filtered.map((cat) => (
                                    <tr key={cat.maLoai}>
                                        <td><span className="ctg-id">{cat.maLoai}</span></td>
                                        <td className="ctg-name">{cat.tenLoai}</td>
                                        <td className="ctg-col-actions">
                                            <div className="ctg-row-actions">
                                                <button onClick={() => openEditForm(cat)} className="ctg-link-btn ctg-link-edit">
                                                    <EditIcon /> Sửa
                                                </button>
                                                <button onClick={() => setDeleteTarget(cat)} className="ctg-link-btn ctg-link-delete">
                                                    <TrashIcon /> Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {!loading && filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="ctg-empty">
                                            <p className="ctg-empty-title">
                                                {search ? 'Không tìm thấy loại sách phù hợp' : 'Chưa có loại sách nào'}
                                            </p>
                                            {!search && (
                                                <p className="ctg-empty-text">Nhấn “Thêm loại sách” để tạo loại đầu tiên.</p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Modal Thêm/Sửa */}
                {isModalOpen && (
                    <div
                        className="ctg-overlay"
                        onMouseDown={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
                    >
                        <div className="ctg-modal" role="dialog" aria-modal="true">
                            <h3 className="ctg-modal-title">
                                {currentCategory.maLoai === 0 ? 'Thêm loại sách mới' : 'Sửa loại sách'}
                            </h3>
                            <p className="ctg-modal-desc">
                                {currentCategory.maLoai === 0
                                    ? 'Nhập tên cho loại sách mới.'
                                    : `Đang chỉnh sửa loại sách mã ${currentCategory.maLoai}.`}
                            </p>

                            <form onSubmit={handleSave} className="ctg-form">
                                <label htmlFor="tenLoai" className="ctg-label">Tên loại sách</label>
                                <input
                                    id="tenLoai"
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="Ví dụ: Lịch sử"
                                    className="ctg-input"
                                    value={currentCategory.tenLoai}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, tenLoai: e.target.value })}
                                />

                                <div className="ctg-modal-actions">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="ctg-btn ctg-btn-ghost">
                                        Hủy
                                    </button>
                                    <button type="submit" disabled={saving} className="ctg-btn ctg-btn-primary">
                                        {saving ? 'Đang lưu...' : 'Lưu'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal xác nhận xóa */}
                {deleteTarget && (
                    <div
                        className="ctg-overlay"
                        onMouseDown={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
                    >
                        <div className="ctg-modal ctg-modal-sm" role="alertdialog" aria-modal="true">
                            <div className="ctg-danger-icon"><TrashIcon /></div>
                            <h3 className="ctg-modal-title">Xóa loại sách?</h3>
                            <p className="ctg-modal-desc">
                                Loại sách <strong>“{deleteTarget.tenLoai}”</strong> sẽ bị xóa vĩnh viễn.
                            </p>
                            <div className="ctg-modal-actions">
                                <button onClick={() => setDeleteTarget(null)} className="ctg-btn ctg-btn-ghost">
                                    Hủy
                                </button>
                                <button onClick={handleDelete} className="ctg-btn ctg-btn-danger">
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CategoryManager;
