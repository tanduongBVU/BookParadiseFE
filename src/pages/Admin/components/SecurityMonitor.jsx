
import { useCallback, useEffect, useState } from 'react';
import {
    getSecurityEvents,
    updateSecurityEventReview
} from '../../../services/securityEventService';

const REFRESH_INTERVAL = 5000;

const severityConfig = {
    High: {
        label: 'High',
        color: '#dc2626',
        background: '#fee2e2'
    },
    Medium: {
        label: 'Medium',
        color: '#b45309',
        background: '#fef3c7'
    },
    Low: {
        label: 'Low',
        color: '#1d4ed8',
        background: '#dbeafe'
    },
    Info: {
        label: 'Info',
        color: '#4b5563',
        background: '#e5e7eb'
    }
};

const reviewConfig = {
    New: {
        label: 'Chưa xử lý',
        color: '#dc2626',
        background: '#fee2e2'
    },
    Reviewing: {
        label: 'Đang xử lý',
        color: '#b45309',
        background: '#fef3c7'
    },
    Resolved: {
        label: 'Đã xử lý',
        color: '#15803d',
        background: '#dcfce7'
    }
};

const filterOptions = [
    { value: 'All', label: 'Tất cả' },
    { value: 'Pending', label: 'Chưa xử lý' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
    { value: 'Info', label: 'Info' }
];

const getSlowSearchTime = (description = '') => {
    const match = description.match(/mất\s+([\d.,]+)\s*ms/i);

    if (!match) {
        return null;
    }

    const milliseconds = Number(match[1].replace(',', '.'));

    return Number.isFinite(milliseconds) ? milliseconds : null;
};

const formatDate = (value) => {
    if (!value) {
        return 'Không có thời gian';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Không có thời gian';
    }

    return date.toLocaleString('vi-VN');
};

const getSeverity = (severity) => {
    return severityConfig[severity] || {
        label: severity || 'Không rõ',
        color: '#4b5563',
        background: '#e5e7eb'
    };
};

const getReview = (reviewStatus) => {
    return reviewConfig[reviewStatus] || {
        label: reviewStatus || 'Không rõ',
        color: '#4b5563',
        background: '#e5e7eb'
    };
};

const badgeStyle = (color, background) => ({
    display: 'inline-block',
    padding: '5px 9px',
    borderRadius: '6px',
    color,
    background,
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap'
});

const buttonStyle = (background, color = '#ffffff') => ({
    border: 'none',
    borderRadius: '6px',
    padding: '7px 10px',
    background,
    color,
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap'
});

const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '18px',
    minWidth: 0
};

function SecurityMonitor() {
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadEvents = useCallback(async (showLoading = false) => {
        if (showLoading) {
            setLoading(true);
        }

        try {
            const response = await getSecurityEvents();

            // Hỗ trợ service trả về mảng hoặc Axios response.
            const data = Array.isArray(response)
                ? response
                : response?.data;

            if (!Array.isArray(data)) {
                throw new Error('API không trả về danh sách sự kiện hợp lệ.');
            }

            // ID lớn nhất hiển thị trước.
            const sortedEvents = [...data].sort((a, b) => {
                return Number(b.id) - Number(a.id);
            });

            setEvents(sortedEvents);
            setLastUpdated(new Date());
            setError('');
        } catch (err) {
            console.error('Lỗi tải sự kiện bảo mật:', err);
            setError('Không thể tải danh sách sự kiện bảo mật. Hãy kiểm tra Backend và API.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents(true);

        const intervalId = setInterval(() => {
            loadEvents(false);
        }, REFRESH_INTERVAL);

        return () => {
            clearInterval(intervalId);
        };
    }, [loadEvents]);

    const handleReview = async (event, reviewStatus) => {
        try {
            setUpdatingId(event.id);

            await updateSecurityEventReview(event.id, reviewStatus);

            // Cập nhật giao diện ngay sau khi API thành công.
            setEvents((previousEvents) =>
                previousEvents
                    .map((item) =>
                        item.id === event.id
                            ? { ...item, reviewStatus }
                            : item
                    )
                    .sort((a, b) => Number(b.id) - Number(a.id))
            );

            setError('');
        } catch (err) {
            console.error('Lỗi cập nhật trạng thái:', err);
            setError(`Không thể cập nhật trạng thái sự kiện ID ${event.id}.`);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredEvents = events.filter((event) => {
        if (filter === 'All') {
            return true;
        }

        if (filter === 'Pending') {
            return event.reviewStatus === 'New';
        }

        return event.severity === filter;
    });

    const highCount = events.filter(
        (event) => event.severity === 'High'
    ).length;

    const mediumCount = events.filter(
        (event) => event.severity === 'Medium'
    ).length;

    const pendingCount = events.filter(
        (event) => event.reviewStatus === 'New'
    ).length;

    const latestSlowSearch = events.find(
        (event) =>
            event.eventType === 'slow_search' &&
            event.reviewStatus !== 'Resolved'
    );

    return (
        <div
            style={{
                padding: '24px',
                background: '#f8fafc',
                minHeight: '100vh',
                color: '#1f2937'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                    marginBottom: '20px'
                }}
            >
                <div>
                    <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700 }}>
                        Giám sát bảo mật
                    </h2>

                    <p style={{ margin: '8px 0 0', color: '#6b7280' }}>
                        Theo dõi sự kiện bất thường và trạng thái xử lý của hệ thống.
                    </p>

                    {lastUpdated && (
                        <small style={{ color: '#6b7280' }}>
                            Cập nhật lần cuối: {formatDate(lastUpdated)}
                        </small>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => loadEvents(true)}
                    disabled={loading}
                    style={buttonStyle('#2563eb')}
                >
                    {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </div>

            {error && (
                <div
                    role="alert"
                    style={{
                        padding: '12px 16px',
                        marginBottom: '18px',
                        borderRadius: '8px',
                        color: '#991b1b',
                        background: '#fee2e2',
                        border: '1px solid #fecaca'
                    }}
                >
                    {error}
                </div>
            )}

            {latestSlowSearch && (
                <div
                    style={{
                        padding: '18px',
                        marginBottom: '22px',
                        border: '1px solid #fca5a5',
                        borderLeft: '5px solid #dc2626',
                        borderRadius: '10px',
                        background: '#fff1f2'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                        }}
                    >
                        <h3 style={{ margin: 0, color: '#b91c1c', fontSize: '18px' }}>
                            ⚠ Cảnh báo: Phát hiện tìm kiếm chậm
                        </h3>

                        <span style={badgeStyle('#b91c1c', '#fee2e2')}>
                            ID: {latestSlowSearch.id}
                        </span>
                    </div>

                    <p style={{ margin: '12px 0', color: '#7f1d1d' }}>
                        {latestSlowSearch.description || 'Không có mô tả sự kiện.'}
                    </p>

                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                            alignItems: 'center'
                        }}
                    >
                        {getSlowSearchTime(latestSlowSearch.description) !== null && (
                            <span style={badgeStyle('#b91c1c', '#fee2e2')}>
                                Thời gian:{' '}
                                {getSlowSearchTime(latestSlowSearch.description).toLocaleString('vi-VN')} ms
                            </span>
                        )}

                        <span
                            style={badgeStyle(
                                getSeverity(latestSlowSearch.severity).color,
                                getSeverity(latestSlowSearch.severity).background
                            )}
                        >
                            Mức độ: {getSeverity(latestSlowSearch.severity).label}
                        </span>

                        <span style={badgeStyle('#374151', '#e5e7eb')}>
                            IP: {latestSlowSearch.sourceIp || 'Không rõ'}
                        </span>

                        <span
                            style={badgeStyle(
                                getReview(latestSlowSearch.reviewStatus).color,
                                getReview(latestSlowSearch.reviewStatus).background
                            )}
                        >
                            {getReview(latestSlowSearch.reviewStatus).label}
                        </span>

                        {latestSlowSearch.isSimulated && (
                            <span style={badgeStyle('#6d28d9', '#ede9fe')}>
                                Mô phỏng
                            </span>
                        )}
                    </div>

                    {latestSlowSearch.reviewStatus !== 'Resolved' && (
                        <div
                            style={{
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap',
                                marginTop: '14px'
                            }}
                        >
                            {latestSlowSearch.reviewStatus !== 'Reviewing' && (
                                <button
                                    type="button"
                                    disabled={updatingId === latestSlowSearch.id}
                                    onClick={() => handleReview(latestSlowSearch, 'Reviewing')}
                                    style={buttonStyle('#d97706')}
                                >
                                    Đang xử lý
                                </button>
                            )}

                            <button
                                type="button"
                                disabled={updatingId === latestSlowSearch.id}
                                onClick={() => handleReview(latestSlowSearch, 'Resolved')}
                                style={buttonStyle('#15803d')}
                            >
                                Đánh dấu đã xử lý
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '14px',
                    marginBottom: '24px'
                }}
            >
                <div style={cardStyle}>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>
                        Tổng sự kiện đang tải
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>
                        {events.length}
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={{ color: '#dc2626', fontSize: '13px' }}>
                        Sự kiện High
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#dc2626' }}>
                        {highCount}
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={{ color: '#b45309', fontSize: '13px' }}>
                        Sự kiện Medium
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#b45309' }}>
                        {mediumCount}
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={{ color: '#2563eb', fontSize: '13px' }}>
                        Chưa xử lý
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#2563eb' }}>
                        {pendingCount}
                    </div>
                </div>
            </div>

            <div style={{ ...cardStyle, padding: '0', overflowX: 'auto' }}>
                <div
                    style={{
                        padding: '18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                        borderBottom: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: '18px' }}>
                        Danh sách sự kiện bảo mật
                    </h3>

                    <select
                        value={filter}
                        onChange={(event) => setFilter(event.target.value)}
                        style={{
                            padding: '9px 12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            background: '#ffffff'
                        }}
                    >
                        {filterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {loading && events.length === 0 ? (
                    <p style={{ padding: '24px' }}>Đang tải dữ liệu...</p>
                ) : (
                    <table
                        style={{
                            width: '100%',
                            minWidth: '1150px',
                            borderCollapse: 'collapse',
                            fontSize: '13px'
                        }}
                    >
                        <thead>
                            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                {[
                                    'ID',
                                    'Loại sự kiện',
                                    'IP nguồn',
                                    'Điểm rủi ro',
                                    'Mức độ',
                                    'Phân tích',
                                    'Thời gian',
                                    'Trạng thái',
                                    'Thao tác'
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        style={{
                                            padding: '13px 12px',
                                            borderBottom: '1px solid #e5e7eb',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredEvents.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        style={{
                                            padding: '28px',
                                            textAlign: 'center',
                                            color: '#6b7280'
                                        }}
                                    >
                                        Không có sự kiện phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredEvents.map((event) => {
                                    const severity = getSeverity(event.severity);
                                    const review = getReview(event.reviewStatus);
                                    const isSlowSearch = event.eventType === 'slow_search';

                                    return (
                                        <tr
                                            key={event.id}
                                            style={{
                                                background: isSlowSearch ? '#fff7f7' : '#ffffff',
                                                borderBottom: '1px solid #e5e7eb'
                                            }}
                                        >
                                            <td style={cellStyle}>
                                                <strong>{event.id}</strong>
                                            </td>

                                            <td style={{ ...cellStyle, minWidth: '150px' }}>
                                                {isSlowSearch ? (
                                                    <span style={{ color: '#b91c1c', fontWeight: 700 }}>
                                                        ⚠ Tìm kiếm chậm
                                                    </span>
                                                ) : (
                                                    event.eventType || 'Không rõ'
                                                )}

                                                {event.isSimulated && (
                                                    <div style={{ marginTop: '5px' }}>
                                                        <span style={badgeStyle('#6d28d9', '#ede9fe')}>
                                                            Mô phỏng
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            <td style={cellStyle}>
                                                {event.sourceIp || 'Không rõ'}
                                            </td>

                                            <td style={cellStyle}>
                                                {event.riskScore ?? 0}
                                            </td>

                                            <td style={cellStyle}>
                                                <span style={badgeStyle(severity.color, severity.background)}>
                                                    {severity.label}
                                                </span>
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    minWidth: '250px',
                                                    maxWidth: '360px',
                                                    whiteSpace: 'normal',
                                                    overflowWrap: 'anywhere'
                                                }}
                                            >
                                                {event.analysisResult ||
                                                    event.description ||
                                                    'Chưa có kết quả phân tích'}
                                            </td>

                                            <td style={{ ...cellStyle, minWidth: '150px' }}>
                                                {formatDate(event.createdAt)}
                                            </td>

                                            <td style={cellStyle}>
                                                <span style={badgeStyle(review.color, review.background)}>
                                                    {review.label}
                                                </span>
                                            </td>

                                            <td style={cellStyle}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    {event.reviewStatus !== 'Reviewing' &&
                                                        event.reviewStatus !== 'Resolved' && (
                                                            <button
                                                                type="button"
                                                                disabled={updatingId === event.id}
                                                                onClick={() => handleReview(event, 'Reviewing')}
                                                                style={buttonStyle('#d97706')}
                                                            >
                                                                Đang xử lý
                                                            </button>
                                                        )}

                                                    {event.reviewStatus !== 'Resolved' && (
                                                        <button
                                                            type="button"
                                                            disabled={updatingId === event.id}
                                                            onClick={() => handleReview(event, 'Resolved')}
                                                            style={buttonStyle('#15803d')}
                                                        >
                                                            Đã xử lý
                                                        </button>
                                                    )}

                                                    {event.reviewStatus === 'Resolved' && (
                                                        <button
                                                            type="button"
                                                            disabled={updatingId === event.id}
                                                            onClick={() => handleReview(event, 'New')}
                                                            style={buttonStyle('#4b5563')}
                                                        >
                                                            Mở lại
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}

                <div
                    style={{
                        padding: '12px 18px',
                        borderTop: '1px solid #e5e7eb',
                        color: '#6b7280',
                        fontSize: '12px'
                    }}
                >
                    Hiển thị {filteredEvents.length} / {events.length} sự kiện.
                    Tự động cập nhật mỗi 5 giây. ID được sắp xếp giảm dần.
                </div>
            </div>
        </div>
    );
}

const cellStyle = {
    padding: '12px',
    verticalAlign: 'top',
    whiteSpace: 'nowrap'
};

export default SecurityMonitor;
