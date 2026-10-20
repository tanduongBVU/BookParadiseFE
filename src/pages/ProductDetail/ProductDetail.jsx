import {
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import { Link, useParams } from 'react-router-dom';
import { getSachById } from '../../services/sachService';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import './ProductDetail.css';

const API_URL = 'https://localhost:7010';

const money = (value) =>
    `${(Number(value) || 0).toLocaleString('vi-VN')} đ`;

const initial = (name) =>
    String(name || 'B').trim().charAt(0).toUpperCase() || 'B';

function Icon({ name }) {
    const paths = {
        book: 'M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1ZM12 6v14',
        cart: 'M3 3h2l3 12h10l3-9H6M9 19h.01M18 19h.01',
        chat: 'M21 11a8 8 0 0 1-8 8H7l-5 3V11a9 9 0 0 1 19 0ZM7 10h10M7 14h6',
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={paths[name]} />
        </svg>
    );
}

export default function ProductDetail() {
    const { id } = useParams();

    // Hooks luôn đặt trước các lệnh return
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    const [sach, setSach] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);

    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [imageError, setImageError] = useState(false);

    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentsError, setCommentsError] = useState('');
    const [newComment, setNewComment] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const postRequest = useRef(null);

    // Tải thông tin sách
    useEffect(() => {
        let active = true;

        setLoading(true);
        setError('');
        setSach(null);
        setQuantity(1);
        setSelectedVariant(null);
        setImageError(false);

        const loadBook = async () => {
            try {
                const data = await getSachById(id);

                if (!data) {
                    throw new Error('NOT_FOUND');
                }

                if (active) {
                    setSach(data);
                    setSelectedVariant(data.cacBienThe?.[0] || null);
                }
            } catch {
                if (active) {
                    setError(
                        'Không thể tải thông tin cuốn sách này. Bạn vui lòng thử lại.'
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadBook();

        return () => {
            active = false;
        };
    }, [id, retry]);

    // Tải đánh giá
    useEffect(() => {
        const controller = new AbortController();

        setComments([]);
        setCommentsLoading(true);
        setCommentsError('');
        setNewComment('');
        setFeedback(null);
        setIsSending(false);

        const loadComments = async () => {
            try {
                const res = await fetch(
                    `${API_URL}/api/sach/${id}/binhluan`,
                    { signal: controller.signal }
                );

                if (!res.ok) {
                    throw new Error('LOAD_FAILED');
                }

                const data = await res.json();

                if (!Array.isArray(data)) {
                    throw new Error('INVALID_DATA');
                }

                if (!controller.signal.aborted) {
                    setComments(data);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setCommentsError(
                        'Chưa tải được đánh giá. Bạn có thể thử tải lại trang.'
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setCommentsLoading(false);
                }
            }
        };

        loadComments();

        return () => {
            controller.abort();
            postRequest.current?.abort();
        };
    }, [id]);

    const currentStock = Math.max(
        0,
        Math.floor(
            Number(
                selectedVariant
                    ? selectedVariant.soLuong
                    : sach?.soLuong
            ) || 0
        )
    );

    const isAvailable = currentStock > 0;

    // Giá gốc + phụ phí của phiên bản
    const displayPrice =
        (Number(sach?.gia) || 0) +
        (Number(selectedVariant?.giaCongThem) || 0);

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (isSending) return;

        if (!user || !newComment.trim()) {
            setFeedback({
                type: 'error',
                text: 'Bạn cần đăng nhập và nhập nội dung đánh giá.',
            });
            return;
        }

        const controller = new AbortController();
        postRequest.current = controller;

        setIsSending(true);
        setFeedback(null);

        try {
            const res = await fetch(`${API_URL}/api/binhluan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
                body: JSON.stringify({
                    maNguoiDung: user.id || user.maNguoiDung,
                    maSach: Number(id),
                    noiDung: newComment.trim(),
                }),
            });

            if (!res.ok) {
                throw new Error('SEND_FAILED');
            }

            if (!controller.signal.aborted) {
                setNewComment('');

                setFeedback({
                    type: 'success',
                    text: 'Đã gửi đánh giá! Nội dung của bạn đang chờ quản trị viên duyệt.',
                });
            }
        } catch {
            if (!controller.signal.aborted) {
                setFeedback({
                    type: 'error',
                    text: 'Chưa gửi được đánh giá. Bạn vui lòng thử lại sau.',
                });
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsSending(false);
            }

            if (postRequest.current === controller) {
                postRequest.current = null;
            }
        }
    };

    if (loading) {
        return (
            <div className="bp-detail">
                <div
                    className="bpd-container bpd-state"
                    role="status"
                >
                    <span
                        className="bpd-spinner"
                        aria-hidden="true"
                    />
                    <p>Đang tải thông tin sách...</p>
                </div>
            </div>
        );
    }

    if (error || !sach) {
        return (
            <div className="bp-detail">
                <div
                    className="bpd-container bpd-state"
                    role="alert"
                >
                    <Icon name="book" />
                    <h2>Chưa tải được sách</h2>
                    <p>
                        {error || 'Không tìm thấy cuốn sách này.'}
                    </p>

                    <button
                        type="button"
                        className="bpd-primary"
                        onClick={() => setRetry((value) => value + 1)}
                    >
                        Thử lại
                    </button>

                    <Link to="/sach" className="bpd-text-link">
                        Về cửa hàng
                    </Link>
                </div>
            </div>
        );
    }

    const imageUrl = sach.hinhAnh
        ? /^https?:\/\//i.test(sach.hinhAnh)
            ? sach.hinhAnh
            : `${API_URL}/${sach.hinhAnh.replace(/^\/+/, '')}`
        : '';

    return (
        <div className="bp-detail">
            <div className="bpd-container">
                {/* Đường dẫn */}
                <nav
                    className="bpd-breadcrumb"
                    aria-label="Đường dẫn trang"
                >
                    <Link to="/">Trang chủ</Link>
                    <span aria-hidden="true">/</span>
                    <Link to="/sach">Cửa hàng</Link>
                    <span aria-hidden="true">/</span>
                    <span aria-current="page">{sach.tenSach}</span>
                </nav>

                {/* Thông tin sản phẩm */}
                <section
                    className="bpd-product"
                    aria-labelledby="book-title"
                >
                    <div className="bpd-media">
                        <div className="bpd-media-frame">
                            {imageUrl && !imageError ? (
                                <img
                                    src={imageUrl}
                                    alt={sach.tenSach}
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="bpd-no-image">
                                    <Icon name="book" />
                                    <span>Chưa có ảnh bìa</span>
                                </div>
                            )}
                        </div>

                        
                    </div>

                    <div className="bpd-info">
                        <div className="bpd-topline">
                            <span className="bpd-eyebrow">
                                TỦ SÁCH BOOKPARADISE
                            </span>

                            <span
                                className={`bpd-stock${
                                    isAvailable ? '' : ' is-empty'
                                }`}
                            >
                                {isAvailable
                                    ? `Còn hàng · ${currentStock} cuốn`
                                    : 'Tạm hết hàng'}
                            </span>
                        </div>

                        <h1 id="book-title">{sach.tenSach}</h1>

                        <div className="bpd-price-box">
                            <span>Giá bán</span>
                            <strong>{money(displayPrice)}</strong>

                            {selectedVariant && (
                                <small>
                                    {selectedVariant.tenBienThe}
                                </small>
                            )}
                        </div>

                        {/* Phiên bản sách */}
                        {sach.cacBienThe?.length > 0 && (
                            <div
                                className="bpd-variants"
                                role="group"
                                aria-label="Chọn phiên bản"
                            >
                                <h2>Phiên bản</h2>

                                <div className="bpd-variant-list">
                                    {sach.cacBienThe.map((bt) => {
                                        const selected =
                                            selectedVariant?.maBienThe ===
                                            bt.maBienThe;

                                        return (
                                            <button
                                                type="button"
                                                key={bt.maBienThe}
                                                className={`bpd-variant${
                                                    selected
                                                        ? ' is-selected'
                                                        : ''
                                                }`}
                                                aria-pressed={selected}
                                                onClick={() => {
                                                    setSelectedVariant(bt);
                                                    setQuantity(1);
                                                }}
                                            >
                                                {bt.tenBienThe}

                                                {Number(bt.giaCongThem) > 0 && (
                                                    <small>
                                                        +{money(bt.giaCongThem)}
                                                    </small>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="bpd-description">
                            <h2>Về cuốn sách</h2>
                            <p>
                                {sach.moTa ||
                                    'Nội dung giới thiệu đang được cập nhật.'}
                            </p>
                        </div>

                        {/* Số lượng và thêm giỏ */}
                        <div className="bpd-purchase">
                            <div className="bpd-quantity-block">
                                <span id="book-quantity-label">
                                    Số lượng
                                </span>

                                <div
                                    className="bpd-quantity"
                                    role="group"
                                    aria-labelledby="book-quantity-label"
                                >
                                    <button
                                        type="button"
                                        aria-label="Giảm số lượng"
                                        disabled={!isAvailable || quantity <= 1}
                                        onClick={() =>
                                            setQuantity((value) =>
                                                Math.max(1, value - 1)
                                            )
                                        }
                                    >
                                        −
                                    </button>

                                    <span aria-live="polite">
                                        {isAvailable ? quantity : 0}
                                    </span>

                                    <button
                                        type="button"
                                        aria-label="Tăng số lượng"
                                        disabled={
                                            !isAvailable ||
                                            quantity >= currentStock
                                        }
                                        onClick={() =>
                                            setQuantity((value) =>
                                                Math.min(
                                                    currentStock,
                                                    value + 1
                                                )
                                            )
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="bpd-primary bpd-add-cart"
                                disabled={!isAvailable}
                                onClick={() => {
                                    if (isAvailable) {
                                        addToCart(
                                            sach,
                                            quantity,
                                            selectedVariant
                                        );
                                    }
                                }}
                            >
                                <Icon name="cart" />

                                {isAvailable
                                    ? 'Thêm vào giỏ hàng'
                                    : 'Sản phẩm tạm hết hàng'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Đánh giá */}
                <section
                    className="bpd-reviews"
                    aria-labelledby="reviews-title"
                >
                    <div className="bpd-review-heading">
                        <div>
                            <p>GÓC NHÌN TỪ BẠN ĐỌC</p>
                            <h2 id="reviews-title">
                                Chia sẻ về cuốn sách
                            </h2>
                        </div>

                        {!commentsLoading && !commentsError && (
                            <span className="bpd-review-count">
                                {comments.length} đánh giá
                            </span>
                        )}
                    </div>

                    {user ? (
                        <form
                            className="bpd-review-form"
                            onSubmit={handleSubmitComment}
                            aria-busy={isSending}
                        >
                       

                            <textarea
                                id="book-comment"
                                rows={4}
                                required
                                disabled={isSending}
                                placeholder="Điều gì ở cuốn sách khiến bạn ấn tượng?"
                                value={newComment}
                                onChange={(e) => {
                                    setNewComment(e.target.value);
                                    setFeedback(null);
                                }}
                            />

                            <div className="bpd-form-footer">
                                <span>
                                    Đánh giá sẽ hiển thị sau khi được duyệt.
                                </span>

                                <button
                                    className="bpd-primary"
                                    type="submit"
                                    disabled={isSending}
                                >
                                    {isSending
                                        ? 'Đang gửi...'
                                        : 'Gửi đánh giá'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bpd-login-note">
                            <Icon name="chat" />
                            <p>
                                <Link to="/dang-nhap">Đăng nhập</Link>{' '}
                                để chia sẻ cảm nhận của bạn về cuốn sách.
                            </p>
                        </div>
                    )}

                    {feedback && (
                        <div
                            className={`bpd-feedback bpd-feedback--${feedback.type}`}
                            role={
                                feedback.type === 'error'
                                    ? 'alert'
                                    : 'status'
                            }
                        >
                            {feedback.text}
                        </div>
                    )}

                    <div className="bpd-comment-list">
                        {commentsLoading ? (
                            <p
                                className="bpd-comment-note"
                                role="status"
                            >
                                Đang tải đánh giá...
                            </p>
                        ) : commentsError ? (
                            <p
                                className="bpd-comment-note"
                                role="alert"
                            >
                                {commentsError}
                            </p>
                        ) : comments.length === 0 ? (
                            <div className="bpd-empty-comments">
                                <Icon name="chat" />
                                <p>
                                    Chưa có đánh giá nào. Hãy chia sẻ
                                    cảm nhận đầu tiên nhé!
                                </p>
                            </div>
                        ) : (
                            comments.map((cmt, index) => (
                                <article
                                    className="bpd-comment"
                                    key={cmt.maBinhLuan ?? index}
                                >
                                    <span
                                        className="bpd-comment-avatar"
                                        aria-hidden="true"
                                    >
                                        {initial(cmt.tenNguoiDung)}
                                    </span>

                                    <div className="bpd-comment-body">
                                        <h3>
                                            {cmt.tenNguoiDung || 'Bạn đọc'}
                                        </h3>
                                        <p>{cmt.noiDung}</p>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}