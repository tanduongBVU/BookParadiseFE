import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Wishlist from './pages/Wishlist/Wishlist';

// Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Pages
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Checkout from './pages/Checkout/Checkout';
import SalePage from './pages/Salepage/Salepage'; 
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Tạo 1 Component bao bọc Layout của Cửa hàng
const ShopLayout = ({ children }) => (
    <>
        <Header />
        <main className="min-h-screen bg-gray-50">
            {children}
        </main>
        <Footer />
    </>
);

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
              <Routes>
                
                {/* NHÓM 1: GIAO DIỆN CỬA HÀNG (Đã được bọc Header/Footer qua ShopLayout) */}
                <Route path="/" element={<ShopLayout><Home /></ShopLayout>} />
                <Route path="/sach" element={<ShopLayout><Shop /></ShopLayout>} />
                <Route path="/sale" element={<ShopLayout><SalePage /></ShopLayout>} />
                <Route path="/sach/:id" element={<ShopLayout><ProductDetail /></ShopLayout>} />
                <Route path="/gio-hang" element={<ShopLayout><Cart /></ShopLayout>} />
                <Route path="/dang-nhap" element={<ShopLayout><Login /></ShopLayout>} />
                <Route path="/dang-ky" element={<ShopLayout><Register /></ShopLayout>} />
                <Route path="/thanh-toan" element={<ShopLayout><Checkout /></ShopLayout>} />
                <Route path="/yeu-thich" element={<ShopLayout><Wishlist /></ShopLayout>} />
                <Route path="/about" element={<ShopLayout><AboutPage /></ShopLayout>} />
                <Route path="/lien-he" element={<ShopLayout><ContactPage /></ShopLayout>} />

                {/* NHÓM 2: GIAO DIỆN ADMIN (Không có Header/Footer của cửa hàng) */}
                <Route path="/admin" element={<AdminDashboard />} />

              </Routes>
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;