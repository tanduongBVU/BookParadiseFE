import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { createDonHang, createChiTietDonHang, applyVoucher } from '../../services/orderService';
import './Checkout.css';

const PHONE_REGEX = /^(0|\+84)\d{9}$/;
const fmt = (n) => n.toLocaleString('vi-VN') + ' đ';

/* ---------- Icon nhỏ (SVG nội tuyến, không cần cài thư viện) ---------- */
const Icon = ({ children, size = 18 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {children}
    </svg>
);

const IconUser = () => (
    <Icon>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </Icon>
);
const IconPhone = () => (
    <Icon>
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </Icon>
);
const IconMail = () => (
    <Icon>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
    </Icon>
);
const IconPin = () => (
    <Icon>
        <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.5" />
    </Icon>
);
const IconNote = () => (
    <Icon>
        <path d="M5 4h14v12l-5 5H5z" />
        <path d="M14 21v-5h5" />
    </Icon>
);
const IconTruck = () => (
    <Icon size={22}>
        <path d="M2 6h11v10H2z" />
        <path d="M13 9h4l4 4v3h-8" />
        <circle cx="6.5" cy="17.5" r="1.8" />
        <circle cx="17.5" cy="17.5" r="1.8" />
    </Icon>
);
const IconWallet = () => (
    <Icon size={22}>
        <path d="M3 7a2 2 0 0 1 2-2h13v4" />
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <circle cx="16.5" cy="13.5" r="1.2" />
    </Icon>
);

const Checkout = () => {
    const { cart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [hoTen, setHoTen] = useState(user?.hoTen || '');
    const [soDienThoai, setSoDienThoai] = useState(user?.soDienThoai || '');
    const [diaChi, setDiaChi] = useState(user?.diaChi || '');
    const [ghiChu, setGhiChu] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [voucherCodeInput, setVoucherCodeInput] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherError, setVoucherError] = useState('');
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

    useEffect(() => {
        if (!user) {
            alert('Bạn cần đăng nhập để thanh toán!');
            navigate('/dang-nhap');
        } else if (cart.length === 0) {
            navigate('/sach');
        }
    }, [user, cart, navigate]);

    const tongTienGoc = cart.reduce((total, item) => total + item.gia * item.soMua, 0);
    const tongSoLuong = cart.reduce((total, item) => total + item.soMua, 0);
    const soTienGiam = appliedVoucher ? appliedVoucher.soTienGiam : 0;
    const tongTienThanhToan = Math.max(tongTienGoc - soTienGiam, 0);

    const validate = () => {
        const errs = {};
        if (!hoTen.trim()) errs.hoTen = 'Nhập họ tên người nhận.';
        if (!soDienThoai.trim()) errs.soDienThoai = 'Nhập số điện thoại.';
        else if (!PHONE_REGEX.test(soDienThoai.trim())) errs.soDienThoai = 'Số điện thoại chưa đúng (VD: 0912345678).';
        if (!diaChi.trim()) errs.diaChi = 'Nhập địa chỉ giao hàng.';
        else if (diaChi.trim().length < 10) errs.diaChi = 'Địa chỉ quá ngắn, hãy ghi rõ số nhà, đường, phường/xã, quận/huyện, tỉnh/thành.';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleApplyVoucher = async () => {
        if (!voucherCodeInput.trim()) return;
        setIsApplyingVoucher(true);
        setVoucherError('');
        try {
            const data = await applyVoucher(voucherCodeInput, tongTienGoc);
            setAppliedVoucher(data);
            setVoucherCodeInput('');
        } catch (err) {
            setVoucherError(err);
            setAppliedVoucher(null);
        } finally {
            setIsApplyingVoucher(false);
        }
    };

    const handleDatHang = async (e) => {
        e.preventDefault();
        setError('');
        if (!validate()) return;

        setLoading(true);
        try {
            const donHangResult = await createDonHang(
                user.id || user.maNguoiDung,
                tongTienThanhToan,
                appliedVoucher?.code,
                soTienGiam,
                {
                    hoTenNguoiNhan: hoTen.trim(),
                    soDienThoai: soDienThoai.trim(),
                    diaChiGiaoHang: diaChi.trim(),
                    ghiChu: ghiChu.trim(),
                }
            );
            const newMaDonHang = donHangResult.maDonHang;

            for (const item of cart) {
                await createChiTietDonHang(newMaDonHang, item.maSach, item.soMua, item.gia);
            }

            clearCart();
            alert(`Đặt hàng thành công! Mã đơn hàng của bạn là #${newMaDonHang}`);
            navigate('/');
        } catch (err) {
            setError(err || 'Có lỗi xảy ra trong quá trình đặt hàng.');
        } finally {
            setLoading(false);
        }
    };

    if (!user || cart.length === 0) return null;

    return (
        <div className="co">
            {/* Banner kệ sách */}
            <div className="co-hero">
                <div className="co-hero-in">
                    <h1 className="co-title">Thanh toán</h1>
                    <p className="co-sub">Điền thông tin nhận hàng và xác nhận đơn.</p>
                </div>
            </div>

            <div className="co-wrap">
                <div className="co-grid">
                    {/* ===== Form ===== */}
                    <form className="co-form" onSubmit={handleDatHang} noValidate>
                        {error && <div className="co-alert">{error}</div>}

                        <section className="co-section">
                            <div className="co-section-head">
                                <span className="co-badge"><IconTruck /></span>
                                <div>
                                    <h2 className="co-section-title">Thông tin giao hàng</h2>
                                    <p className="co-section-desc">Đơn sẽ được giao đến địa chỉ này.</p>
                                </div>
                            </div>

                            <div className="co-fields">
                                <div className="co-field-full">
                                    <label className="co-label" htmlFor="hoTen">Họ và tên người nhận</label>
                                    <div className="co-ico">
                                        <IconUser />
                                        <input
                                            id="hoTen"
                                            className={`co-input ${fieldErrors.hoTen ? 'is-error' : ''}`}
                                            type="text"
                                            placeholder="Nguyễn Văn A"
                                            value={hoTen}
                                            onChange={(e) => setHoTen(e.target.value)}
                                        />
                                    </div>
                                    {fieldErrors.hoTen && <p className="co-msg is-error">{fieldErrors.hoTen}</p>}
                                </div>

                                <div>
                                    <label className="co-label" htmlFor="sdt">Số điện thoại</label>
                                    <div className="co-ico">
                                        <IconPhone />
                                        <input
                                            id="sdt"
                                            className={`co-input ${fieldErrors.soDienThoai ? 'is-error' : ''}`}
                                            type="tel"
                                            inputMode="tel"
                                            maxLength={12}
                                            placeholder="0912345678"
                                            value={soDienThoai}
                                            onChange={(e) => setSoDienThoai(e.target.value.replace(/[^\d+]/g, ''))}
                                        />
                                    </div>
                                    {fieldErrors.soDienThoai && <p className="co-msg is-error">{fieldErrors.soDienThoai}</p>}
                                </div>

                                <div>
                                    <label className="co-label" htmlFor="email">Email</label>
                                    <div className="co-ico">
                                        <IconMail />
                                        <input id="email" className="co-input" type="text" value={user.email || ''} disabled />
                                    </div>
                                </div>

                                <div className="co-field-full">
                                    <label className="co-label" htmlFor="diaChi">Địa chỉ giao hàng</label>
                                    <div className="co-ico is-area">
                                        <IconPin />
                                        <textarea
                                            id="diaChi"
                                            className={`co-textarea ${fieldErrors.diaChi ? 'is-error' : ''}`}
                                            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                            value={diaChi}
                                            onChange={(e) => setDiaChi(e.target.value)}
                                        />
                                    </div>
                                    {fieldErrors.diaChi && <p className="co-msg is-error">{fieldErrors.diaChi}</p>}
                                </div>

                                <div className="co-field-full">
                                    <label className="co-label" htmlFor="ghiChu">
                                        Ghi chú <span className="co-opt">(không bắt buộc)</span>
                                    </label>
                                    <div className="co-ico">
                                        <IconNote />
                                        <input
                                            id="ghiChu"
                                            className="co-input"
                                            type="text"
                                            placeholder="VD: Gọi trước khi giao, giao giờ hành chính"
                                            value={ghiChu}
                                            onChange={(e) => setGhiChu(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="co-section">
                            <div className="co-section-head">
                                <span className="co-badge"><IconWallet /></span>
                                <div>
                                    <h2 className="co-section-title">Phương thức thanh toán</h2>
                                    <p className="co-section-desc">Hiện chỉ hỗ trợ thanh toán khi nhận hàng.</p>
                                </div>
                            </div>
                            <div className="co-pay">
                                <span className="co-pay-dot" />
                                <div>
                                    <div className="co-pay-name">Thanh toán khi nhận hàng (COD)</div>
                                    <div className="co-pay-note">Trả tiền mặt cho nhân viên giao hàng.</div>
                                </div>
                            </div>
                        </section>

                        <button className="co-submit" type="submit" disabled={loading}>
                            <span>{loading ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}</span>
                            {!loading && <span className="co-submit-total">{fmt(tongTienThanhToan)}</span>}
                        </button>
                    </form>

                    {/* ===== Hóa đơn ===== */}
                    <aside className="co-receipt">
                        <div className="co-receipt-head">
                            <h2 className="co-receipt-title">Đơn hàng của bạn</h2>
                            <span className="co-receipt-count">{tongSoLuong} sản phẩm</span>
                        </div>

                        <ul className="co-items">
                            {cart.map((item) => (
                                <li key={item.cartId} className="co-item">
                                    <img
                                        className="co-item-img"
                                        src={item.hinhAnh ? `https://localhost:7010${item.hinhAnh}` : 'https://via.placeholder.com/60x80?text=Sách'}
                                        alt={item.tenSach}
                                    />
                                    <div className="co-item-body">
                                        <h4 className="co-item-name">{item.tenSach}</h4>
                                        {item.tenBienThe && <span className="co-item-variant">{item.tenBienThe}</span>}
                                        <div className="co-item-row">
                                            <span>SL: {item.soMua}</span>
                                            <span className="co-item-price">{fmt(item.gia * item.soMua)}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="co-voucher">
                            <label className="co-label" htmlFor="voucher">Mã giảm giá</label>
                            <div className="co-voucher-row">
                                <input
                                    id="voucher"
                                    className="co-input"
                                    type="text"
                                    placeholder="Nhập mã (VD: SALE50)"
                                    value={voucherCodeInput}
                                    onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                                />
                                <button
                                    type="button"
                                    className="co-btn-dark"
                                    onClick={handleApplyVoucher}
                                    disabled={isApplyingVoucher || !voucherCodeInput}
                                >
                                    {isApplyingVoucher ? 'Đang kiểm tra...' : 'Áp dụng'}
                                </button>
                            </div>
                            {voucherError && <p className="co-msg is-error">{voucherError}</p>}
                            {appliedVoucher && (
                                <div className="co-voucher-ok">
                                    <span>Đã áp dụng mã {appliedVoucher.code}</span>
                                    <button type="button" className="co-link" onClick={() => setAppliedVoucher(null)}>
                                        Gỡ bỏ
                                    </button>
                                </div>
                            )}
                        </div>

                        <dl className="co-totals">
                            <div className="co-totals-row">
                                <dt>Tạm tính</dt>
                                <dd>{fmt(tongTienGoc)}</dd>
                            </div>
                            {appliedVoucher && (
                                <div className="co-totals-row is-discount">
                                    <dt>Giảm giá voucher</dt>
                                    <dd>- {fmt(soTienGiam)}</dd>
                                </div>
                            )}
                            <div className="co-totals-row">
                                <dt>Phí vận chuyển</dt>
                                <dd>Miễn phí</dd>
                            </div>
                            <div className="co-totals-final">
                                <dt>Tổng cộng</dt>
                                <dd>{fmt(tongTienThanhToan)}</dd>
                            </div>
                        </dl>

                        <div className="co-barcode" aria-hidden="true" />
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
