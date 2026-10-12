import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Layout
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Import Pages
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';

function App() {
  return (
    <BrowserRouter>
      {/* Header luôn hiển thị ở mọi trang */}
      <Header />
      
      {/* Khu vực nội dung thay đổi theo URL */}
      <main style={{ minHeight: '80vh', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sach" element={<Shop />} />
          <Route path="/sach/:id" element={<ProductDetail />} />
          <Route path="/gio-hang" element={<Cart />} />
        </Routes>
      </main>

      {/* Footer luôn hiển thị ở cuối */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;