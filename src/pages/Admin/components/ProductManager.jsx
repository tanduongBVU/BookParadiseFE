
import { useState, useEffect, useMemo } from 'react';
import './Productmanager.css';

const API_SACH = 'https://localhost:7010/api/admin/sach';
const API_LOAI_SACH = 'https://localhost:7010/api/admin/loaisach';
const API_KM = 'https://localhost:7010/api/admin/khuyenmai';
const API_BIEN_THE = 'https://localhost:7010/api/admin/bienthe';

const LOW_STOCK = 10; // Tồn kho từ mức này trở xuống sẽ hiện "Sắp hết"

/* ---------- Icons (inline SVG, không cần cài thêm thư viện) ---------- */
const Icon = ({ d, className = 'pd-icon' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d={d} />
    </svg>
);
const PlusIcon = () => <Icon d="M12 5v14M5 12h14" />;
const EditIcon = () => <Icon d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />;
const TrashIcon = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />;
const SearchIcon = () => <Icon d="M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />;
const CloseIcon = () => <Icon d="M18 6 6 18M6 6l12 12" />;
const LayersIcon = () => <Icon d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />;
const UploadIcon = () => <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />;
const BookIcon = () => (
    <Icon className="pd-icon pd-icon-lg"
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14ZM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
);
const EyeIcon = () => <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />;
const EyeOffIcon = () => <Icon d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94 M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19 m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22" />;

/* ---------- Helpers hiển thị ---------- */
const money = (n) => `${Number(n || 0).toLocaleString('vi-VN')} đ`;
const imgUrl = (path) => (path ? `https://localhost:7010${path}` : '');

const stockState = (n) => {
    if (n <= 0) return { cls: 'pd-stock-out', label: 'Hết hàng' };
    if (n <= LOW_STOCK) return { cls: 'pd-stock-low', label: 'Sắp hết' };
    return null;
};

// Bìa sách có gáy sách; size: sm | md | lg
const Cover = ({ src, size = 'md', alt = 'Bìa sách', emptyText }) => (
    <div className={`pd-cover pd-cover-${size}`}>
        {src ? (
            <img src={src} alt={alt} />
        ) : (
            <span className="pd-cover-empty">
                {size !== 'sm' && <BookIcon />}
                {emptyText}
            </span>
        )}
    </div>
);

const ProductManager = () => {
    /* ====== STATE & LOGIC ====== */
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

    // (chỉ để biết đã tải xong lần đầu, tránh nháy "Chưa có sách" khi đang tải)
    const [loaded, setLoaded] = useState(false);
    useEffect(() => { fetchData().finally(() => setLoaded(true)); }, []);

    useEffect(() => {
        // Kiểm tra xem có sách nào đang ở trạng thái chờ AI duyệt không
        const hasProcessingItems = products.some(p => p.trangThaiAI === 'Cho_Kiem_Duyet');

        if (hasProcessingItems) {
            // Nếu có, tự động gọi API tải lại bảng mỗi 2 giây
            const intervalId = setInterval(() => {
                fetchData();
            }, 2000);

            // Dọn dẹp interval khi hoàn thành để không bị tràn bộ nhớ
            return () => clearInterval(intervalId);
        }
    }, [products]);

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

        // CHỐT CHẶN FRONTEND: Bắt buộc giá phải > 0
        if (currentProduct.gia <= 0) {
            window.alert("Lỗi: Giá bán sản phẩm phải lớn hơn 0 đ!");
            return; // Dừng lại, không gọi API
        }

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
        if (!window.confirm('Bạn muốn xóa sách này?')) {
            return;
        }

        try {
            const response = await fetch(`${API_SACH}/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                window.alert(
                    data.message || 'Không thể xóa sách này.'
                );
                return;
            }

            window.alert(
                data.message || 'Thao tác thành công!'
            );

            await fetchData();
        } catch (error) {
            console.error('Lỗi khi xóa sách:', error);
            window.alert('Không thể kết nối đến máy chủ.');
        }
    };

    const toggleSale = async (id) => {
        await fetch(`${API_SACH}/${id}/toggle-sale`, { method: 'PATCH' });
        fetchData();
    };

    const toggleVisibility = async (id) => {
    try {
        const res = await fetch(`${API_SACH}/${id}/toggle-visibility`, { method: 'PATCH' });
        
        // Nếu Backend chặn lại (mã lỗi 400 BadRequest)
        if (!res.ok) {
            const errorData = await res.json();
            window.alert(errorData.message || "Lỗi không thể mở hiển thị.");
            return; // Dừng lại, không fetch lại data
        }

        // Nếu thành công thì tải lại bảng
        fetchData();
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái hiển thị:', error);
        window.alert('Không thể kết nối đến máy chủ.');
    }
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

    /* ====== PHẦN CHỈ DÙNG CHO GIAO DIỆN ====== */
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');

    // Đóng modal bằng phím Esc
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setIsProductModalOpen(false);
                setIsVariantModalOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const categoryMap = useMemo(() => new Map(categories.map((c) => [c.maLoai, c.tenLoai])), [categories]);
    const promoMap = useMemo(() => new Map(promotions.map((k) => [k.maKM, k])), [promotions]);
    const saleCount = products.filter((p) => p.hienThiTrangSale).length;

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return products.filter((p) =>
            (!q || p.tenSach.toLowerCase().includes(q)) &&
            (!catFilter || String(p.maLoai) === catFilter));
    }, [products, search, catFilter]);

    const setField = (field) => (e) => setCurrentProduct({ ...currentProduct, [field]: e.target.value });

    return (
        <div className="pd-root">
            {/* Tiêu đề trang */}
            <div className="pd-head">
                <div>
                    <h2 className="pd-title">Quản lý sản phẩm</h2>
                    <p className="pd-subtitle">
                        {products.length} đầu sách, {saleCount} cuốn đang bật trang Sale.
                    </p>
                </div>
                <button onClick={() => openProductForm()} className="pd-btn pd-btn-primary">
                    <PlusIcon />
                    Thêm sách mới
                </button>
            </div>

            {/* Tìm kiếm + lọc */}
            <div className="pd-toolbar">
                <div className="pd-search">
                    <span className="pd-search-icon"><SearchIcon /></span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo tên sách..."
                        className="pd-search-input"
                    />
                </div>
                <select
                    value={catFilter}
                    onChange={(e) => setCatFilter(e.target.value)}
                    className="pd-select pd-filter"
                    aria-label="Lọc theo loại sách"
                >
                    <option value="">Tất cả loại sách</option>
                    {categories.map((c) => <option key={c.maLoai} value={c.maLoai}>{c.tenLoai}</option>)}
                </select>
            </div>

            {/* Bảng sách */}
            {loaded && (
                <div className="pd-card">
                    {visible.length === 0 ? (
                        <div className="pd-empty">
                            <div className="pd-empty-icon"><BookIcon /></div>
                            <p className="pd-empty-title">
                                {products.length === 0 ? 'Chưa có sách nào' : 'Không tìm thấy sách phù hợp'}
                            </p>
                            {products.length === 0 ? (
                                <>
                                    <p className="pd-empty-text">Thêm cuốn sách đầu tiên để bắt đầu bán hàng.</p>
                                    <button onClick={() => openProductForm()} className="pd-btn pd-btn-primary">
                                        <PlusIcon />
                                        Thêm sách mới
                                    </button>
                                </>
                            ) : (
                                <p className="pd-empty-text">Thử đổi từ khóa hoặc bộ lọc loại sách.</p>
                            )}
                        </div>
                    ) : (
                        <div className="pd-table-wrap">
                            <table className="pd-table">
                                <thead>
                                    <tr>
                                        <th>Sách</th>
                                        <th className="pd-col-price">Giá gốc</th>
                                        <th className="pd-col-stock">Tồn kho</th>
                                        <th className="pd-col-sale">Trang Sale</th>
                                        <th>Trạng thái hiển thị</th>
                                        <th className="pd-col-actions">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((p) => {
                                        const stock = stockState(p.soLuong);
                                        const catName = categoryMap.get(p.maLoai);
                                        const promo = promoMap.get(p.maKM);
                                        return (
                                            <tr key={p.maSach}>
                                                <td>
                                                    <div className="pd-book">
                                                        <Cover src={imgUrl(p.hinhAnh)} alt={p.tenSach} />
                                                        <div>
                                                            <h3 className="pd-book-name">{p.tenSach}</h3>
                                                            {(catName || promo) && (
                                                                <div className="pd-tags">
                                                                    {catName && <span className="pd-tag pd-tag-cat">{catName}</span>}
                                                                    {promo && (
                                                                        <span className="pd-tag pd-tag-promo">
                                                                            {promo.tenKM} (-{promo.phanTramGiam}%)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="pd-price">{money(p.gia)}</span></td>
                                                <td>
                                                    <div className="pd-stock">
                                                        <span className="pd-stock-num">{p.soLuong}</span>
                                                        {stock && <span className={`pd-stock-pill ${stock.cls}`}>{stock.label}</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        role="switch"
                                                        aria-checked={p.hienThiTrangSale}
                                                        aria-label={`Bật trang Sale cho ${p.tenSach}`}
                                                        onClick={() => toggleSale(p.maSach)}
                                                        className="pd-switch"
                                                    >
                                                        <span className="pd-switch-track" />
                                                        {p.hienThiTrangSale ? 'Đang bật' : 'Tắt'}
                                                    </button>
                                                </td>
                                                <td>
                                                    {p.trangThaiAI === 'Cho_Kiem_Duyet' ? (
                                                        <span className="pd-stock-pill"
                                                            style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                                                            Đang xử lý
                                                        </span>
                                                    ) : p.trangThaiAI === 'Hop_Le' && p.hienThi ? (
                                                        <span className="pd-stock-pill"
                                                            style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                                                            Đang hiển thị
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <span className="pd-stock-pill"
                                                                style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                                                                Đã ẩn
                                                            </span>
                                                            {p.trangThaiAI && (
                                                                <div style={{ fontSize: '12px', marginTop: '5px', color: '#b91c1c' }}>
                                                                    Lý do: {p.trangThaiAI}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </td>
                                                <td className="pd-right">
                                                    <div className="pd-row-actions">
                                                        <button
                                                            onClick={() => toggleVisibility(p.maSach)}
                                                            className="pd-icon-btn"
                                                            style={{ color: p.hienThi ? '#9ca3af' : '#10b981' }}
                                                            aria-label={p.hienThi ? `Ẩn ${p.tenSach}` : `Mở ẩn ${p.tenSach}`}
                                                            title={p.hienThi ? "Tắt hiển thị" : "Mở hiển thị (Sản phẩm hợp lệ)"}
                                                        >
                                                            {p.hienThi ? <EyeOffIcon /> : <EyeIcon />}
                                                        </button>

                                                        <button onClick={() => openVariantModal(p)} className="pd-variant-btn">
                                                            <LayersIcon /> Biến thể
                                                        </button>
                                                        <button
                                                            onClick={() => openProductForm(p)}
                                                            className="pd-icon-btn pd-icon-edit"
                                                            aria-label={`Sửa ${p.tenSach}`}
                                                            title="Sửa"
                                                        >
                                                            <EditIcon />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(p.maSach)}
                                                            className="pd-icon-btn pd-icon-delete"
                                                            aria-label={`Xóa ${p.tenSach}`}
                                                            title="Xóa"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Thêm/Sửa sách */}
            {isProductModalOpen && (
                <div
                    className="pd-overlay"
                    onMouseDown={(e) => e.target === e.currentTarget && setIsProductModalOpen(false)}
                >
                    <div className="pd-modal pd-modal-lg" role="dialog" aria-modal="true">
                        <h3 className="pd-modal-title">
                            {currentProduct.maSach === 0 ? 'Thêm sách mới' : 'Sửa sách'}
                        </h3>
                        <p className="pd-modal-desc">
                            {currentProduct.maSach === 0
                                ? 'Điền thông tin cuốn sách và chọn ảnh bìa.'
                                : `Đang chỉnh sửa sách mã ${currentProduct.maSach}.`}
                        </p>

                        <form onSubmit={handleSaveProduct} className="pd-form">
                            <div className="pd-form-grid">
                                {/* Ảnh bìa */}
                                <div className="pd-upload">
                                    <div className="pd-upload-frame">
                                        <Cover
                                            src={imgUrl(currentProduct.hinhAnh)}
                                            size="lg"
                                            alt="Xem trước ảnh bìa"
                                            emptyText="Chưa có ảnh"
                                        />
                                    </div>
                                    <input
                                        id="hinhAnh"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="pd-file-input"
                                    />
                                    <label htmlFor="hinhAnh" className="pd-file-btn">
                                        <UploadIcon />
                                        {currentProduct.hinhAnh ? 'Đổi ảnh bìa' : 'Chọn ảnh bìa'}
                                    </label>
                                    <p className="pd-upload-hint">Ảnh được tải lên ngay khi bạn chọn.</p>
                                </div>

                                {/* Thông tin */}
                                <div className="pd-form-fields">
                                    <div className="pd-span-2">
                                        <label htmlFor="tenSach" className="pd-label">Tên sách</label>
                                        <input
                                            id="tenSach"
                                            type="text"
                                            required
                                            autoFocus
                                            placeholder="Ví dụ: Lập trình C# cơ bản"
                                            className="pd-input"
                                            value={currentProduct.tenSach}
                                            onChange={setField('tenSach')}
                                        />
                                    </div>

                                    <div className="pd-span-2">
                                        <label htmlFor="moTa" className="pd-label">Mô tả</label>
                                        <textarea
                                            id="moTa"
                                            rows="3"
                                            placeholder="Giới thiệu ngắn về nội dung cuốn sách"
                                            className="pd-input"
                                            value={currentProduct.moTa}
                                            onChange={setField('moTa')}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="gia" className="pd-label">Giá</label>
                                        <div className="pd-input-suffix">
                                            <input
                                                id="gia"
                                                type="number"
                                                required
                                                className="pd-input"
                                                value={currentProduct.gia}
                                                onChange={setField('gia')}
                                            />
                                            <span className="pd-suffix">đ</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="soLuong" className="pd-label">Số lượng</label>
                                        <input
                                            id="soLuong"
                                            type="number"
                                            required
                                            className="pd-input"
                                            value={currentProduct.soLuong}
                                            onChange={setField('soLuong')}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="maLoai" className="pd-label">Loại sách</label>
                                        <select
                                            id="maLoai"
                                            className="pd-input pd-select"
                                            value={currentProduct.maLoai}
                                            onChange={setField('maLoai')}
                                        >
                                            <option value="">Chọn loại sách</option>
                                            {categories.map((c) => <option key={c.maLoai} value={c.maLoai}>{c.tenLoai}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="maKM" className="pd-label">Đợt khuyến mãi</label>
                                        <select
                                            id="maKM"
                                            className="pd-input pd-select"
                                            value={currentProduct.maKM}
                                            onChange={setField('maKM')}
                                        >
                                            <option value="">Không tham gia</option>
                                            {promotions.map((km) => <option key={km.maKM} value={km.maKM}>{km.tenKM}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pd-modal-actions">
                                <button type="button" onClick={() => setIsProductModalOpen(false)} className="pd-btn pd-btn-ghost">
                                    Hủy
                                </button>
                                <button type="submit" className="pd-btn pd-btn-primary">
                                    Lưu sách
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal biến thể */}
            {isVariantModalOpen && (
                <div
                    className="pd-overlay"
                    onMouseDown={(e) => e.target === e.currentTarget && setIsVariantModalOpen(false)}
                >
                    <div className="pd-modal pd-modal-md" role="dialog" aria-modal="true">
                        <div className="pd-modal-head">
                            <div className="pd-modal-head-main">
                                <Cover src={imgUrl(selectedProduct?.hinhAnh)} size="sm" alt="" />
                                <div>
                                    <h3 className="pd-modal-title">Biến thể sách</h3>
                                    <p className="pd-modal-desc">{selectedProduct?.tenSach}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsVariantModalOpen(false)}
                                className="pd-icon-btn"
                                aria-label="Đóng"
                                title="Đóng"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="pd-variant-table-wrap">
                            <table className="pd-variant-table">
                                <thead>
                                    <tr>
                                        <th>Tên biến thể</th>
                                        <th>Giá cộng thêm</th>
                                        <th>Kho</th>
                                        <th className="pd-right">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variants.map((v) => (
                                        <tr key={v.maBienThe}>
                                            <td>{v.tenBienThe}</td>
                                            <td><span className="pd-variant-plus">+{money(v.giaCongThem)}</span></td>
                                            <td>{v.soLuong}</td>
                                            <td className="pd-right">
                                                <button
                                                    onClick={() => handleDeleteVariant(v.maBienThe)}
                                                    className="pd-icon-btn pd-icon-delete"
                                                    aria-label={`Xóa biến thể ${v.tenBienThe}`}
                                                    title="Xóa"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {variants.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="pd-variant-empty">
                                                Chưa có biến thể nào. Thêm bìa cứng, bản ký tặng... ở bên dưới.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <form onSubmit={handleAddVariant} className="pd-variant-form">
                            <div className="pd-variant-name">
                                <label htmlFor="tenBienThe" className="pd-label">Tên biến thể</label>
                                <input
                                    id="tenBienThe"
                                    type="text"
                                    required
                                    placeholder="Ví dụ: Bìa cứng"
                                    className="pd-input"
                                    value={newVariant.tenBienThe}
                                    onChange={(e) => setNewVariant({ ...newVariant, tenBienThe: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="giaCongThem" className="pd-label">Giá cộng thêm</label>
                                <input
                                    id="giaCongThem"
                                    type="number"
                                    required
                                    className="pd-input"
                                    value={newVariant.giaCongThem}
                                    onChange={(e) => setNewVariant({ ...newVariant, giaCongThem: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="slBienThe" className="pd-label">Kho</label>
                                <input
                                    id="slBienThe"
                                    type="number"
                                    required
                                    className="pd-input"
                                    value={newVariant.soLuong}
                                    onChange={(e) => setNewVariant({ ...newVariant, soLuong: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="pd-btn pd-btn-green">
                                <PlusIcon /> Thêm
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManager;