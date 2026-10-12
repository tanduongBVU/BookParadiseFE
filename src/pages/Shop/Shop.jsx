import { useState, useEffect } from 'react';
import { getDanhSachSach } from '../../services/sachService';
import ProductCard from '../../components/Product/ProductCard';

const Shop = () => {
    const [danhSach, setDanhSach] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDanhSachSach();
                setDanhSach(data);
                setLoading(false);
            } catch (err) {
                setError("Không thể tải dữ liệu, hãy kiểm tra lại Backend.");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Đang tải dữ liệu sách...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Tất cả sách</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {danhSach.length === 0 ? (
                    <p>Chưa có cuốn sách nào trong Database.</p>
                ) : (
                    danhSach.map((sach) => (
                        // Đổi key thành sach.maSach
                        <ProductCard key={sach.maSach} data={sach} />
                    ))
                )}
            </div>
        </div>
    );
};

export default Shop;