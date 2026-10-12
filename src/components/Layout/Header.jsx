import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header style={styles.header}>
            <div style={styles.logo}>
                <Link to="/" style={styles.logoText}>BookParadise</Link>
            </div>
            
            <nav style={styles.nav}>
                <Link to="/" style={styles.navLink}>Trang Chủ</Link>
                <Link to="/sach" style={styles.navLink}>Cửa Hàng</Link>
            </nav>
            
            <div style={styles.cart}>
                <Link to="/gio-hang" style={styles.cartLink}>🛒 Giỏ hàng (0)</Link>
            </div>
        </header>
    );
};

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    logoText: { fontSize: '24px', fontWeight: 'bold', color: '#d70018', textDecoration: 'none' },
    nav: { display: 'flex', gap: '20px' },
    navLink: { textDecoration: 'none', color: '#333', fontSize: '16px', fontWeight: '500' },
    cartLink: { textDecoration: 'none', color: '#333', fontSize: '16px', fontWeight: 'bold' }
};

export default Header;