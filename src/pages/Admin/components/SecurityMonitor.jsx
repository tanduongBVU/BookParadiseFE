import { useCallback, useEffect, useState } from 'react';
import {
    getSecurityEvents,
    updateSecurityEventReview
} from '../../../services/securityEventService';

const REFRESH_INTERVAL = 5000;

const severityConfig = {
    High: { label: 'High', color: '#dc2626', background: '#fee2e2' },
    Medium: { label: 'Medium', color: '#b45309', background: '#fef3c7' },
    Low: { label: 'Low', color: '#1d4ed8', background: '#dbeafe' },
    Info: { label: 'Info', color: '#4b5563', background: '#e5e7eb' }
};

const reviewConfig = {
    New: { label: 'Chưa xử lý', color: '#dc2626', background: '#fee2e2' },
    Reviewing: { label: 'Đang xử lý', color: '#b45309', background: '#fef3c7' },
    Resolved: { label: 'Đã xử lý', color: '#15803d', background: '#dcfce7' }
};

const filterOptions = [
    { value: 'All', label: 'Tất cả' },
    { value: 'Pending', label: 'Chưa xử lý' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
    { value: 'Info', label: 'Info' }
];

const formatDate = (value) => {
    if (!value) return 'Không có thời gian';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Không có thời gian';
    return date.toLocaleString('vi-VN');
};

const getSeverity = (severity) => {
    return severityConfig[severity] || { label: severity || 'Không rõ', color: '#4b5563', background: '#e5e7eb' };
};

const getReview = (reviewStatus) => {
    return reviewConfig[reviewStatus] || { label: reviewStatus || 'Không rõ', color: '#4b5563', background: '#e5e7eb' };
};

const badgeStyle = (color, background) => ({
    display: 'inline-block', padding: '5px 9px', borderRadius: '6px',
    color, background, fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap'
});

const buttonStyle = (background, color = '#ffffff') => ({
    border: 'none', borderRadius: '6px', padding: '7px 10px',
    background, color, cursor: 'pointer', fontSize: '12px',
    fontWeight: 600, whiteSpace: 'nowrap'
});

const cardStyle = {
    background: '#ffffff', border: '1px solid #e5e7eb',
    borderRadius: '10px', padding: '18px', minWidth: 0
};

function SecurityMonitor() {
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [isFixing, setIsFixing] = useState(false); // Trạng thái đang chạy Index
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadEvents = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const response = await getSecurityEvents();
            const data = Array.isArray(response) ? response : response?.data;
            if (!Array.isArray(data)) throw new Error('API không trả về danh sách hợp lệ.');
            
            const sortedEvents = [...data].sort((a, b) => Number(b.id) - Number(a.id));
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
        const intervalId = setInterval(() => { loadEvents(false); }, REFRESH_INTERVAL);
        return () => clearInterval(intervalId);
    }, [loadEvents]);

    const handleReview = async (event, reviewStatus) => {
        try {
            setUpdatingId(event.id);
            await updateSecurityEventReview(event.id, reviewStatus);
            setEvents((previousEvents) =>
                previousEvents
                    .map((item) => item.id === event.id ? { ...item, reviewStatus } : item)
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

    // HÀM GỌI API TẠO INDEX TỐI ƯU CSDL
    const handleFixIndex = async () => {
        if (!window.confirm("Hệ thống sẽ thực thi lệnh tạo Index để tối ưu tìm kiếm. Tiếp tục?")) return;
        setIsFixing(true);
        try {
            const res = await fetch('https://localhost:7010/api/securityevents/fix-index', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                loadEvents(true); // Tải lại dữ liệu sau khi tối ưu xong
            } else {
                alert("Lỗi: " + data.message);
            }
        } catch (err) {
            alert("Lỗi kết nối máy chủ khi tạo Index.");
        } finally {
            setIsFixing(false);
        }
    };

    // HÀM GỌI API XÓA INDEX (ĐỂ DEMO LẠI KỊCH BẢN TÌM KIẾM CHẬM)
    const handleResetIndex = async () => {
        if (!window.confirm("BẠN CÓ CHẮC CHẮN MUỐN XÓA INDEX?\n(Hành động này dùng để mô phỏng lại tình huống CSDL bị chậm)")) return;
        try {
            const res = await fetch('https://localhost:7010/api/securityevents/remove-index', { method: 'DELETE' });
            const data = await res.json();
            alert(data.message);
        } catch (err) {
            alert("Lỗi kết nối máy chủ khi xóa Index.");
        }
    };

    const filteredEvents = events.filter((event) => {
        if (filter === 'All') return true;
        if (filter === 'Pending') return event.reviewStatus === 'New';
        return event.severity === filter;
    });

    const highCount = events.filter((event) => event.severity === 'High').length;
    const mediumCount = events.filter((event) => event.severity === 'Medium').length;
    const pendingCount = events.filter((event) => event.reviewStatus === 'New').length;

    return (
        <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', color: '#1f2937' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700 }}>Giám sát bảo mật & Tối ưu</h2>
                    <p style={{ margin: '8px 0 0', color: '#6b7280' }}>Theo dõi sự kiện bất thường và tự động tối ưu hóa CSDL.</p>
                    {lastUpdated && (
                        <small style={{ color: '#6b7280' }}>Cập nhật lần cuối: {formatDate(lastUpdated)}</small>
                    )}
                </div>

                {/* Khu vực các nút bấm toàn cục */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={handleResetIndex} style={buttonStyle('#fee2e2', '#991b1b')}>
                        🗑️ Xóa Index (Để test lại)
                    </button>
                    <button type="button" onClick={() => loadEvents(true)} disabled={loading} style={buttonStyle('#2563eb')}>
                        {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>
                </div>
            </div>

            {/* Thông báo lỗi nếu có */}
            {error && (
                <div role="alert" style={{ padding: '12px 16px', marginBottom: '18px', borderRadius: '8px', color: '#991b1b', background: '#fee2e2', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            {/* Các thẻ thống kê */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div style={cardStyle}>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>Tổng sự kiện đang tải</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>{events.length}</div>
                </div>
                <div style={cardStyle}>
                    <div style={{ color: '#dc2626', fontSize: '13px' }}>Sự kiện High</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#dc2626' }}>{highCount}</div>
                </div>
                <div style={cardStyle}>
                    <div style={{ color: '#b45309', fontSize: '13px' }}>Sự kiện Medium</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#b45309' }}>{mediumCount}</div>
                </div>
                <div style={cardStyle}>
                    <div style={{ color: '#2563eb', fontSize: '13px' }}>Chưa xử lý</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#2563eb' }}>{pendingCount}</div>
                </div>
            </div>

            {/* Bảng danh sách sự kiện */}
            <div style={{ ...cardStyle, padding: '0', overflowX: 'auto' }}>
                <div style={{ padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Danh sách sự kiện</h3>
                    <select value={filter} onChange={(event) => setFilter(event.target.value)} style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#ffffff' }}>
                        {filterOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {loading && events.length === 0 ? (
                    <p style={{ padding: '24px' }}>Đang tải dữ liệu...</p>
                ) : (
                    <table style={{ width: '100%', minWidth: '1150px', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                {['ID', 'Loại sự kiện', 'IP nguồn', 'Điểm rủi ro', 'Mức độ', 'Phân tích & Đề xuất AI', 'Thời gian', 'Trạng thái', 'Thao tác'].map((heading) => (
                                    <th key={heading} style={{ padding: '13px 12px', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ padding: '28px', textAlign: 'center', color: '#6b7280' }}>Không có sự kiện phù hợp.</td>
                                </tr>
                            ) : (
                                filteredEvents.map((event) => {
                                    const severity = getSeverity(event.severity);
                                    const review = getReview(event.reviewStatus);
                                    const isSlowSearch = event.eventType === 'slow_search';

                                    // Nhận diện xem kết quả phân tích có chứa đề xuất tạo Index không
                                    const hasAiRecommendation = event.analysisResult && event.analysisResult.includes("CREATE INDEX");

                                    return (
                                        <tr key={event.id} style={{ background: isSlowSearch ? '#fff7f7' : '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={cellStyle}><strong>{event.id}</strong></td>
                                            <td style={{ ...cellStyle, minWidth: '150px' }}>
                                                {isSlowSearch ? (
                                                    <span style={{ color: '#b91c1c', fontWeight: 700 }}>⚠ Tắc nghẽn CSDL</span>
                                                ) : (
                                                    event.eventType || 'Không rõ'
                                                )}
                                                {event.isSimulated && (
                                                    <div style={{ marginTop: '5px' }}>
                                                        <span style={badgeStyle('#6d28d9', '#ede9fe')}>Mô phỏng DB</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td style={cellStyle}>{event.sourceIp || 'Không rõ'}</td>
                                            <td style={cellStyle}>{event.riskScore ?? 0}</td>
                                            <td style={cellStyle}>
                                                <span style={badgeStyle(severity.color, severity.background)}>{severity.label}</span>
                                            </td>
                                            <td style={{ ...cellStyle, minWidth: '250px', maxWidth: '380px', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                                                
                                                {/* Hiển thị lỗi gốc */}
                                                <div style={{ color: '#4b5563', marginBottom: '8px' }}>
                                                    {event.description}
                                                </div>
                                                
                                                {/* Hiển thị Đề xuất AI và Nút bấm */}
                                                {hasAiRecommendation && (
                                                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '8px' }}>
                                                        <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>💡 Đề xuất từ AI:</strong>
                                                        <span style={{ color: '#15803d' }}>Phát hiện Full Table Scan. Đề nghị tạo Index GIN để tăng tốc truy vấn LIKE.</span>
                                                        
                                                        {/* Nút bấm tự động tối ưu */}
                                                        <button 
                                                            type="button" 
                                                            onClick={handleFixIndex} 
                                                            disabled={isFixing} 
                                                            style={{ ...buttonStyle('#10b981'), display: 'block', width: '100%', marginTop: '10px', padding: '8px' }}
                                                        >
                                                            {isFixing ? '⚙️ Đang ép DB tối ưu...' : '✨ Áp dụng tối ưu (Tạo Index)'}
                                                        </button>
                                                    </div>
                                                )}

                                                {!hasAiRecommendation && (
                                                    <div>{event.analysisResult || 'Chưa có kết quả phân tích'}</div>
                                                )}

                                            </td>
                                            <td style={{ ...cellStyle, minWidth: '150px' }}>{formatDate(event.createdAt)}</td>
                                            <td style={cellStyle}>
                                                <span style={badgeStyle(review.color, review.background)}>{review.label}</span>
                                            </td>
                                            <td style={cellStyle}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {event.reviewStatus !== 'Reviewing' && event.reviewStatus !== 'Resolved' && (
                                                        <button type="button" disabled={updatingId === event.id} onClick={() => handleReview(event, 'Reviewing')} style={buttonStyle('#d97706')}>
                                                            Đang xử lý
                                                        </button>
                                                    )}
                                                    {event.reviewStatus !== 'Resolved' && (
                                                        <button type="button" disabled={updatingId === event.id} onClick={() => handleReview(event, 'Resolved')} style={buttonStyle('#15803d')}>
                                                            Đã tối ưu xong
                                                        </button>
                                                    )}
                                                    {event.reviewStatus === 'Resolved' && (
                                                        <button type="button" disabled={updatingId === event.id} onClick={() => handleReview(event, 'New')} style={buttonStyle('#4b5563')}>
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
                <div style={{ padding: '12px 18px', borderTop: '1px solid #e5e7eb', color: '#6b7280', fontSize: '12px' }}>
                    Hiển thị {filteredEvents.length} / {events.length} sự kiện. Tự động cập nhật mỗi 5 giây. ID được sắp xếp giảm dần.
                </div>
            </div>
        </div>
    );
}

const cellStyle = { padding: '12px', verticalAlign: 'top', whiteSpace: 'nowrap' };

export default SecurityMonitor;