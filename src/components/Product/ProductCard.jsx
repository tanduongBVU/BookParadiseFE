import { Link } from 'react-router-dom';

const ProductCard = ({ data }) => {
    if (!data) return null;

    // Chỉ hiển thị sách nếu trường hienThi là true (để ẩn các sách ngưng bán)
    if (data.hienThi === false) return null;

    return (
        <div style={styles.card}>
            {/* Model chưa có trường hình ảnh, dùng ảnh mặc định tạm thời */}
            <img 
                src={"https://via.placeholder.com/200x250?text=Chưa+có+ảnh"} 
                alt={data.tenSach} 
                style={styles.image}
            />
            
            <div style={styles.info}>
                <h3 style={styles.title} title={data.tenSach}>
                    {data.tenSach || "Đang cập nhật tên"}
                </h3>
                
                <p style={styles.price}>
                    {data.gia ? data.gia.toLocaleString('vi-VN') : '0'} đ
                </p>

                {/* Hiển thị số lượng kho */}
                <p style={{ fontSize: '12px', color: data.soLuong > 0 ? 'green' : 'red', marginBottom: '10px' }}>
                    {data.soLuong > 0 ? `Còn hàng (${data.soLuong})` : 'Hết hàng'}
                </p>
                
                <button 
                    style={data.soLuong > 0 ? styles.btnCart : styles.btnDisabled}
                    disabled={data.soLuong <= 0}
                >
                    {data.soLuong > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                </button>
                
                {/* Link dẫn sang trang chi tiết dùng maSach */}
                <Link to={`/sach/${data.maSach}`} style={styles.btnDetail}>
                    Xem chi tiết
                </Link>
            </div>
        </div>
    );
};

const styles = {
    card: { border: '1px solid #eaeaea', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    image: { width: '100%', height: '250px', objectFit: 'cover', borderRadius: '4px' },
    info: { marginTop: '15px', textAlign: 'center' },
    title: { fontSize: '16px', margin: '0 0 10px', height: '40px', overflow: 'hidden', color: '#333' },
    price: { color: '#d70018', fontWeight: 'bold', fontSize: '18px', margin: '0 0 5px' },
    btnCart: { backgroundColor: '#d70018', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', width: '100%', marginBottom: '10px', fontWeight: 'bold' },
    btnDisabled: { backgroundColor: '#ccc', color: '#666', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'not-allowed', width: '100%', marginBottom: '10px', fontWeight: 'bold' },
    btnDetail: { display: 'block', color: '#0056b3', textDecoration: 'none', fontSize: '14px', border: '1px solid #0056b3', padding: '8px', borderRadius: '4px' }
};

export default ProductCard;