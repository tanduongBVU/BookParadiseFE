import { useState } from 'react';
import './ContactPage.css';

const INITIAL_FORM = {
    hoTen: '',
    email: '',
    noiDung: '',
};

export default function ContactPage() {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFeedback(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        const payload = {
            hoTen: formData.hoTen.trim(),
            email: formData.email.trim(),
            noiDung: formData.noiDung.trim(),
        };

        if (!payload.hoTen || !payload.email || !payload.noiDung) {
            setFeedback({
                type: 'error',
                message: 'Bạn vui lòng điền đầy đủ thông tin nhé.',
            });
            return;
        }

        setIsSubmitting(true);
        setFeedback(null);

        try {
            const response = await fetch(
                'https://localhost:7010/api/lienhe',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error('SEND_FAILED');
            }

            setFormData(INITIAL_FORM);

            setFeedback({
                type: 'success',
                message:
                    'Đã gửi tin nhắn! Cảm ơn bạn, BookParadise sẽ phản hồi sớm nhất có thể.',
            });
        } catch {
            setFeedback({
                type: 'error',
                message:
                    'Chưa gửi được tin nhắn. Bạn vui lòng thử lại sau nhé.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bp-contact">
            <div className="bp-contact__container">
                <header className="bp-contact__heading">
                    <p className="bp-contact__eyebrow">
                        BOOKPARADISE · LIÊN HỆ
                    </p>

                    <h1>
                        Một lời nhắn,
                        <br />
                        thêm một kết nối.
                    </h1>

                    <p>
                        Bạn đang tìm một cuốn sách, cần hỗ trợ đơn hàng
                        hay muốn góp ý? Chúng mình luôn sẵn lòng lắng nghe.
                    </p>
                </header>

                <div className="bp-contact__layout">
                    {/* Cột giới thiệu */}
                    <aside className="bp-contact__intro">
                        <div
                            className="bp-contact__book"
                            aria-hidden="true"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z" />
                                <path d="M12 6v14M6 9h3M6 12h3M15 9h3M15 12h3" />
                            </svg>
                        </div>

                        <h2>
                            Chúng mình có thể
                            <br />
                            giúp gì cho bạn?
                        </h2>

                        <p>
                            Mỗi câu hỏi và chia sẻ đều giúp BookParadise
                            phục vụ bạn tốt hơn.
                        </p>

                        <ul className="bp-contact__topics">
                            <li>
                                <span>01</span>
                                <div>
                                    <h3>Tìm cuốn sách phù hợp</h3>
                                    <p>
                                        Chia sẻ thể loại và tác giả
                                        bạn yêu thích.
                                    </p>
                                </div>
                            </li>

                            <li>
                                <span>02</span>
                                <div>
                                    <h3>Hỗ trợ đơn hàng</h3>
                                    <p>
                                        Gửi kèm mã đơn hàng để tiện
                                        kiểm tra.
                                    </p>
                                </div>
                            </li>

                            <li>
                                <span>03</span>
                                <div>
                                    <h3>Góp ý cùng chúng mình</h3>
                                    <p>
                                        Kể về trải nghiệm mua sách
                                        của bạn.
                                    </p>
                                </div>
                            </li>
                        </ul>

                        <div className="bp-contact__signature">
                            Cảm ơn bạn đã đồng hành cùng BookParadise.
                        </div>
                    </aside>

                    {/* Cột form */}
                    <form
                        className="bp-contact__form"
                        onSubmit={handleSubmit}
                        aria-busy={isSubmitting}
                    >
                        <h2>Gửi tin nhắn</h2>

                        <p className="bp-contact__form-description">
                            Để lại lời nhắn và email để chúng mình
                            phản hồi bạn.
                        </p>

                        {feedback && (
                            <div
                                className={`bp-contact__feedback bp-contact__feedback--${feedback.type}`}
                                role={
                                    feedback.type === 'error'
                                        ? 'alert'
                                        : 'status'
                                }
                            >
                                {feedback.message}
                            </div>
                        )}

                        <fieldset disabled={isSubmitting}>
                            <div className="bp-contact__row">
                                <div className="bp-contact__field">
                                    <label htmlFor="contact-name">
                                        Họ và tên <span>*</span>
                                    </label>

                                    <input
                                        id="contact-name"
                                        name="hoTen"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Tên của bạn"
                                        required
                                        value={formData.hoTen}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="bp-contact__field">
                                    <label htmlFor="contact-email">
                                        Email <span>*</span>
                                    </label>

                                    <input
                                        id="contact-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="ban@email.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="bp-contact__field">
                                <label htmlFor="contact-message">
                                    Nội dung tin nhắn <span>*</span>
                                </label>

                                <textarea
                                    id="contact-message"
                                    name="noiDung"
                                    rows={6}
                                    placeholder="Bạn muốn BookParadise hỗ trợ điều gì?"
                                    required
                                    value={formData.noiDung}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                className="bp-contact__submit"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <span
                                        className="bp-contact__spinner"
                                        aria-hidden="true"
                                    />
                                )}

                                {isSubmitting
                                    ? 'Đang gửi tin nhắn...'
                                    : 'Gửi tin nhắn'}

                                {!isSubmitting && (
                                    <span aria-hidden="true">↗</span>
                                )}
                            </button>
                        </fieldset>

                        <p className="bp-contact__note">
                            Các trường có dấu <span>*</span> là bắt buộc.
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
}