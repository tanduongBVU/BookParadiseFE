import { useState, useEffect, useMemo } from 'react';
import './PromotionManager.css';

const API_URL = 'https://localhost:7010/api/admin/khuyenmai';

const EMPTY_PROMO = { maKM: 0, tenKM: '', phanTramGiam: 0, ngayBatDau: '', ngayKetThuc: '' };
const QUICK_PERCENTS = [10, 20, 30, 50];
const DAY_MS = 24 * 60 * 60 * 1000;
const STATUS_ORDER = { active: 0, upcoming: 1, ended: 2 };

const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'active', label: 'Đang diễn ra' },
    { key: 'upcoming', label: 'Sắp diễn ra' },
    { key: 'ended', label: 'Đã kết thúc' },
];

/* ---------- Icons (inline SVG, không cần cài thêm thư viện) ---------- */
const Icon = ({ d, className = 'pm-icon' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d={d} />
    </svg>
);
const PlusIcon = () => <Icon d="M12 5v14M5 12h14" />;
const EditIcon = () => <Icon d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />;
const TrashIcon = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />;
const SearchIcon = () => <Icon d="M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />;
const CalendarIcon = () => <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />;
const TicketIcon = () => (
    <Icon className="pm-icon pm-icon-lg"
        d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3v3ZM13 6v12" />
);

/* ---------- Helpers ---------- */
const pad = (n) => String(n).padStart(2, '0');

// Chuyển ngày giờ từ API sang định dạng input datetime-local (YYYY-MM-DDTHH:mm).
// Dùng giờ địa phương để không bị lệch múi giờ như toISOString().
const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d)) return '';
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

// Tính trạng thái, tiến độ và dòng mô tả thời gian của một chương trình
const getInfo = (promo) => {
    const now = new Date();
    const start = new Date(promo.ngayBatDau);
    const end = new Date(promo.ngayKetThuc);

    if (now < start) {
        const days = Math.ceil((start - now) / DAY_MS);
        return { status: 'upcoming', label: 'Sắp diễn ra', pct: 0, caption: `Bắt đầu sau ${days} ngày` };
    }
    if (now > end) {
        return { status: 'ended', label: 'Đã kết thúc', pct: 100, caption: 'Chương trình đã hết hạn' };
    }
    const days = Math.max(1, Math.ceil((end - now) / DAY_MS));
    const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    return { status: 'active', label: 'Đang diễn ra', pct, caption: `Còn ${days} ngày` };
};

const PromotionManager = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPromo, setCurrentPromo] = useState(EMPTY_PROMO);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchPromotions = async () => {
        try {
            setError('');
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setPromotions(await res.json());
        } catch (err) {
            console.error('Lỗi khi tải khuyến mãi:', err);
            setError('Không tải được danh sách. Kiểm tra backend đã chạy và cổng API đã đúng chưa.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPromotions(); }, []);

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

    // Gắn trạng thái cho từng khuyến mãi, sắp: đang diễn ra -> sắp diễn ra -> đã kết thúc
    const items = useMemo(() => {
        return promotions
            .map((promo) => ({ promo, info: getInfo(promo) }))
            .sort((a, b) =>
                STATUS_ORDER[a.info.status] - STATUS_ORDER[b.info.status] ||
                new Date(a.promo.ngayKetThuc) - new Date(b.promo.ngayKetThuc));
    }, [promotions]);

    const counts = useMemo(() => ({
        all: items.length,
        active: items.filter((i) => i.info.status === 'active').length,
        upcoming: items.filter((i) => i.info.status === 'upcoming').length,
        ended: items.filter((i) => i.info.status === 'ended').length,
    }), [items]);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items.filter(({ promo, info }) =>
            (tab === 'all' || info.status === tab) &&
            (!q || promo.tenKM.toLowerCase().includes(q)));
    }, [items, search, tab]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (new Date(currentPromo.ngayKetThuc) <= new Date(currentPromo.ngayBatDau)) {
            setFormError('Thời gian kết thúc phải sau thời gian bắt đầu.');
            return;
        }

        const isUpdate = currentPromo.maKM !== 0;
        const url = isUpdate ? `${API_URL}/${currentPromo.maKM}` : API_URL;

        try {
            setSaving(true);
            setFormError('');
            const res = await fetch(url, {
                method: isUpdate ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...currentPromo, phanTramGiam: Number(currentPromo.phanTramGiam) }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await fetchPromotions();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Lỗi khi lưu:', err);
            setFormError('Lưu thất bại. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`${API_URL}/${deleteTarget.maKM}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setDeleteTarget(null);
            fetchPromotions();
        } catch (err) {
            console.error('Lỗi khi xóa:', err);
            setDeleteTarget(null);
            setError('Không xóa được khuyến mãi này. Vui lòng thử lại.');
        }
    };

    const openForm = (promo = EMPTY_PROMO) => {
        setFormError('');
        setCurrentPromo({
            ...promo,
            ngayBatDau: formatDateTime(promo.ngayBatDau),
            ngayKetThuc: formatDateTime(promo.ngayKetThuc),
        });
        setIsModalOpen(true);
    };

    const setField = (field) => (e) => setCurrentPromo({ ...currentPromo, [field]: e.target.value });

    return (
        <div className="pm-root">
            {/* Tiêu đề trang */}
            <div className="pm-head">
                <div>
                    <h2 className="pm-title">Quản lý khuyến mãi</h2>
                    <p className="pm-subtitle">
                        {counts.active > 0
                            ? `Hiện có ${counts.active} chương trình đang diễn ra.`
                            : 'Hiện chưa có chương trình nào đang diễn ra.'}
                    </p>
                </div>
                <button onClick={() => openForm()} className="pm-btn pm-btn-primary">
                    <PlusIcon />
                    Thêm khuyến mãi
                </button>
            </div>

            {/* Tab lọc + tìm kiếm */}
            <div className="pm-toolbar">
                <div className="pm-tabs" role="tablist">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            role="tab"
                            aria-selected={tab === t.key}
                            onClick={() => setTab(t.key)}
                            className={`pm-tab ${tab === t.key ? 'pm-tab-on' : ''}`}
                        >
                            {t.label}
                            <span className="pm-tab-count">{counts[t.key]}</span>
                        </button>
                    ))}
                </div>

                <div className="pm-search">
                    <span className="pm-search-icon"><SearchIcon /></span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm khuyến mãi..."
                        className="pm-search-input"
                    />
                </div>
            </div>

            {/* Thông báo lỗi */}
            {error && (
                <div className="pm-alert">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="pm-alert-close">Đóng</button>
                </div>
            )}

            {/* Danh sách vé */}
            {loading ? (
                <div className="pm-grid">
                    {[0, 1, 2].map((i) => <div key={i} className="pm-skeleton" />)}
                </div>
            ) : visible.length === 0 ? (
                <div className="pm-empty">
                    <div className="pm-empty-icon"><TicketIcon /></div>
                    <p className="pm-empty-title">
                        {promotions.length === 0 ? 'Chưa có khuyến mãi nào' : 'Không có khuyến mãi phù hợp'}
                    </p>
                    {promotions.length === 0 ? (
                        <>
                            <p className="pm-empty-text">Tạo chương trình đầu tiên để thu hút khách mua sách.</p>
                            <button onClick={() => openForm()} className="pm-btn pm-btn-primary">
                                <PlusIcon />
                                Thêm khuyến mãi
                            </button>
                        </>
                    ) : (
                        <p className="pm-empty-text">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                    )}
                </div>
            ) : (
                <div className="pm-grid">
                    {visible.map(({ promo, info }) => (
                        <div key={promo.maKM} className="pm-ticket-wrap">
                            <article className={`pm-ticket pm-is-${info.status}`}>
                                <div className="pm-stub">
                                    <span className="pm-stub-num">{promo.phanTramGiam}<small>%</small></span>
                                    <span className="pm-stub-label">giảm giá</span>
                                </div>

                                <div className="pm-body">
                                    <div className="pm-top">
                                        <h3 className="pm-name">{promo.tenKM}</h3>
                                        <span className="pm-pill">{info.label}</span>
                                    </div>

                                    <div className="pm-meta">
                                        <CalendarIcon />
                                        <span>{formatDate(promo.ngayBatDau)} – {formatDate(promo.ngayKetThuc)}</span>
                                        <span className="pm-meta-code">Mã {promo.maKM}</span>
                                    </div>

                                    <div className="pm-progress">
                                        <div className="pm-progress-fill" style={{ width: `${info.pct}%` }} />
                                    </div>

                                    <div className="pm-foot">
                                        <span className="pm-caption">{info.caption}</span>
                                        <div className="pm-foot-actions">
                                            <button
                                                onClick={() => openForm(promo)}
                                                className="pm-icon-btn pm-icon-edit"
                                                aria-label={`Sửa ${promo.tenKM}`}
                                                title="Sửa"
                                            >
                                                <EditIcon />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(promo)}
                                                className="pm-icon-btn pm-icon-delete"
                                                aria-label={`Xóa ${promo.tenKM}`}
                                                title="Xóa"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Thêm/Sửa */}
            {isModalOpen && (
                <div
                    className="pm-overlay"
                    onMouseDown={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
                >
                    <div className="pm-modal" role="dialog" aria-modal="true">
                        <h3 className="pm-modal-title">
                            {currentPromo.maKM === 0 ? 'Thêm khuyến mãi mới' : 'Sửa khuyến mãi'}
                        </h3>
                        <p className="pm-modal-desc">
                            {currentPromo.maKM === 0
                                ? 'Nhập tên, mức giảm và thời gian áp dụng.'
                                : `Đang chỉnh sửa khuyến mãi mã ${currentPromo.maKM}.`}
                        </p>

                        <form onSubmit={handleSave} className="pm-form">
                            <div className="pm-field">
                                <label htmlFor="tenKM" className="pm-label">Tên khuyến mãi</label>
                                <input
                                    id="tenKM"
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="Ví dụ: Ngày hội sách"
                                    className="pm-input"
                                    value={currentPromo.tenKM}
                                    onChange={setField('tenKM')}
                                />
                            </div>

                            <div className="pm-field">
                                <label htmlFor="phanTramGiam" className="pm-label">Phần trăm giảm</label>
                                <div className="pm-input-suffix">
                                    <input
                                        id="phanTramGiam"
                                        type="number"
                                        required
                                        min="0"
                                        max="100"
                                        className="pm-input"
                                        value={currentPromo.phanTramGiam}
                                        onChange={setField('phanTramGiam')}
                                    />
                                    <span className="pm-suffix">%</span>
                                </div>
                                <div className="pm-chips">
                                    {QUICK_PERCENTS.map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setCurrentPromo({ ...currentPromo, phanTramGiam: p })}
                                            className={`pm-chip ${Number(currentPromo.phanTramGiam) === p ? 'pm-chip-on' : ''}`}
                                        >
                                            {p}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pm-field pm-grid-2">
                                <div>
                                    <label htmlFor="ngayBatDau" className="pm-label">Bắt đầu</label>
                                    <input
                                        id="ngayBatDau"
                                        type="datetime-local"
                                        required
                                        className="pm-input"
                                        value={currentPromo.ngayBatDau}
                                        onChange={setField('ngayBatDau')}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ngayKetThuc" className="pm-label">Kết thúc</label>
                                    <input
                                        id="ngayKetThuc"
                                        type="datetime-local"
                                        required
                                        className="pm-input"
                                        value={currentPromo.ngayKetThuc}
                                        onChange={setField('ngayKetThuc')}
                                    />
                                </div>
                            </div>

                            {formError && <div className="pm-alert pm-alert-inline">{formError}</div>}

                            <div className="pm-modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="pm-btn pm-btn-ghost">
                                    Hủy
                                </button>
                                <button type="submit" disabled={saving} className="pm-btn pm-btn-primary">
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
                    className="pm-overlay"
                    onMouseDown={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
                >
                    <div className="pm-modal pm-modal-sm" role="dialog" aria-modal="true">
                        <div className="pm-danger-icon"><TrashIcon /></div>
                        <h3 className="pm-modal-title">Xóa khuyến mãi?</h3>
                        <p className="pm-modal-desc">
                            Khuyến mãi <strong>“{deleteTarget.tenKM}”</strong> sẽ bị xóa vĩnh viễn và không thể khôi phục.
                        </p>
                        <div className="pm-modal-actions">
                            <button onClick={() => setDeleteTarget(null)} className="pm-btn pm-btn-ghost">
                                Hủy
                            </button>
                            <button onClick={handleDelete} className="pm-btn pm-btn-danger">
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionManager;
