// import { useState, useEffect } from 'react';
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// const OrderManager = () => {
//     const [orders, setOrders] = useState([]);
//     const [search, setSearch] = useState('');
    
//     // State cho Modal chi tiết đơn hàng
//     const [selectedOrder, setSelectedOrder] = useState(null);
//     const [orderDetails, setOrderDetails] = useState([]);
//     const [loadingDetails, setLoadingDetails] = useState(false);

//     // Danh sách trạng thái chuẩn nghiệp vụ
//     const orderStatuses = [
//         "Chờ xác nhận", 
//         "Đã xác nhận", 
//         "Đang chuẩn bị hàng", 
//         "Đang giao hàng", 
//         "Đã giao hàng", 
//         "Đã hủy"
//     ];

//     const fetchOrders = async () => {
//         const res = await fetch('https://localhost:7010/api/DonHang/admin/all');
//         if (res.ok) setOrders(await res.json());
//     };

//     useEffect(() => { fetchOrders(); }, []);

//     // 1. Hàm cập nhật trạng thái đơn hàng
//     const handleUpdateStatus = async (id, newStatus) => {
//         if (!window.confirm(`Xác nhận đổi đơn hàng #${id} sang: ${newStatus}?`)) return;
        
//         await fetch(`https://localhost:7010/api/DonHang/admin/${id}/trangthai`, {
//             method: 'PATCH',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(newStatus)
//         });
//         fetchOrders();
//     };

//     // 2. Hàm xem chi tiết
//     const handleViewDetails = async (order) => {
//         setSelectedOrder(order);
//         setLoadingDetails(true);
//         const res = await fetch(`https://localhost:7010/api/DonHang/admin/${order.maDonHang}/chitiet`);
//         if (res.ok) setOrderDetails(await res.json());
//         setLoadingDetails(false);
//     };

//     // 3. Hàm Xuất EXCEL
//     const exportToExcel = () => {
//         if (orders.length === 0) return alert("Không có dữ liệu để xuất!");
//         const dataToExport = orders.map(o => ({
//             "Mã ĐH": o.maDonHang,
//             "Khách Hàng": o.tenNguoiDung,
//             "Email": o.email,
//             "Ngày Đặt": new Date(o.ngayDat).toLocaleString('vi-VN'),
//             "Tổng Tiền": o.tongTien,
//             "Trạng Thái": o.trangThaiAI === 'Cho_Kiem_Duyet' ? 'Chờ xác nhận' : o.trangThaiAI
//         }));
        
//         const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, "DonHang");
//         XLSX.writeFile(workbook, "DanhSachDonHang.xlsx");
//     };

//     // 4. Hàm Xuất PDF (Đã sửa lỗi cú pháp autoTable)
//     const exportToPDF = () => {
//         if (orders.length === 0) return alert("Không có dữ liệu để xuất!");
//         const doc = new jsPDF();
        
//         doc.setFontSize(16);
//         doc.text("DANH SACH DON HANG - BOOKPARADISE", 14, 15); 
        
//         const tableColumn = ["Ma DH", "Khach Hang", "Ngay Dat", "Tong Tien (VND)", "Trang Thai"];
//         const tableRows = [];

//         orders.forEach(o => {
//             const rowData = [
//                 o.maDonHang,
//                 o.tenNguoiDung,
//                 new Date(o.ngayDat).toLocaleDateString('vi-VN'),
//                 o.tongTien.toLocaleString('vi-VN'),
//                 o.trangThaiAI === 'Cho_Kiem_Duyet' ? 'Cho xac nhan' : o.trangThaiAI
//             ];
//             tableRows.push(rowData);
//         });

//         // Sử dụng cú pháp mới của thư viện
//         autoTable(doc, {
//             head: [tableColumn],
//             body: tableRows,
//             startY: 25,
//         });

//         doc.save("DanhSachDonHang.pdf");
//     };

//     // Tìm kiếm theo tên khách, email hoặc mã đơn hàng
//     const filteredOrders = orders.filter(o => 
//         o.tenNguoiDung?.toLowerCase().includes(search.toLowerCase()) || 
//         o.email?.toLowerCase().includes(search.toLowerCase()) ||
//         o.maDonHang.toString().includes(search)
//     );

//     return (
//         <div className="bg-white p-6 rounded-lg shadow min-h-screen">
//             <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
//                 <h2 className="text-2xl font-bold text-gray-800">Quản lý Đơn Hàng</h2>
                
//                 <div className="flex gap-2">
//                     <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-medium transition">
//                         📊 Xuất Excel
//                     </button>
//                     <button onClick={exportToPDF} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow font-medium transition">
//                         📄 Xuất PDF
//                     </button>
//                 </div>
//             </div>

//             <input 
//                 type="text" 
//                 placeholder="Tìm mã đơn hàng, tên hoặc email khách hàng..." 
//                 className="w-full mb-6 p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//             />

//             <div className="overflow-x-auto">
//                 <table className="min-w-full text-left text-sm border-collapse">
//                     <thead className="bg-slate-100 text-slate-700">
//                         <tr>
//                             <th className="p-3 border-b font-bold">Mã ĐH</th>
//                             <th className="p-3 border-b font-bold">Ngày Đặt</th>
//                             <th className="p-3 border-b font-bold">Khách Hàng</th>
//                             <th className="p-3 border-b font-bold">Tổng Tiền</th>
//                             <th className="p-3 border-b font-bold">Trạng Thái</th>
//                             <th className="p-3 border-b font-bold text-center">Thao tác</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filteredOrders.map(o => {
//                             // Chuyển đổi trạng thái mặc định của DB để hiển thị đẹp hơn
//                             const currentStatus = o.trangThaiAI === 'Cho_Kiem_Duyet' ? 'Chờ xác nhận' : o.trangThaiAI;
                            
//                             return (
//                                 <tr key={o.maDonHang} className="hover:bg-slate-50 border-b">
//                                     <td className="p-3 font-bold text-blue-600">#{o.maDonHang}</td>
//                                     <td className="p-3">{new Date(o.ngayDat).toLocaleString('vi-VN')}</td>
//                                     <td className="p-3">
//                                         <p className="font-bold text-gray-800">{o.tenNguoiDung}</p>
//                                         <p className="text-xs text-gray-500">{o.email}</p>
//                                     </td>
//                                     <td className="p-3 font-bold text-red-600">{o.tongTien.toLocaleString('vi-VN')} đ</td>
//                                     <td className="p-3">
//                                         <select 
//                                             className={`p-1.5 rounded text-sm font-medium border cursor-pointer outline-none ${
//                                                 currentStatus === 'Đã hủy' ? 'bg-red-50 text-red-700' :
//                                                 currentStatus === 'Đã giao hàng' ? 'bg-green-50 text-green-700' :
//                                                 currentStatus === 'Chờ xác nhận' ? 'bg-yellow-50 text-yellow-700' :
//                                                 'bg-blue-50 text-blue-700'
//                                             }`}
//                                             value={currentStatus}
//                                             onChange={(e) => handleUpdateStatus(o.maDonHang, e.target.value)}
//                                         >
//                                             {orderStatuses.map(stt => (
//                                                 <option key={stt} value={stt}>{stt}</option>
//                                             ))}
//                                         </select>
//                                     </td>
//                                     <td className="p-3 text-center">
//                                         <button 
//                                             onClick={() => handleViewDetails(o)}
//                                             className="bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700 text-xs font-bold shadow"
//                                         >
//                                             Xem Chi Tiết
//                                         </button>
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                         {filteredOrders.length === 0 && (
//                             <tr><td colSpan="6" className="text-center p-6 text-gray-500 font-medium">Không tìm thấy đơn hàng nào.</td></tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* MODAL CHI TIẾT ĐƠN HÀNG */}
//             {selectedOrder && (
//                 <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
//                         <div className="flex justify-between items-center p-5 border-b">
//                             <h3 className="text-xl font-bold text-gray-800">Chi Tiết Đơn Hàng #{selectedOrder.maDonHang}</h3>
//                             <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
//                         </div>
                        
//                         <div className="p-5 overflow-y-auto flex-1">
//                             {loadingDetails ? (
//                                 <p className="text-center text-gray-500 py-10">Đang tải chi tiết sản phẩm...</p>
//                             ) : (
//                                 <div>
//                                     <div className="flex justify-between mb-6 bg-slate-50 p-4 rounded-lg border">
//                                         <div>
//                                             <p className="text-sm text-gray-500">Khách hàng</p>
//                                             <p className="font-bold text-gray-800">{selectedOrder.tenNguoiDung}</p>
//                                             <p className="text-sm text-gray-600">{selectedOrder.email}</p>
//                                         </div>
//                                         <div className="text-right">
//                                             <p className="text-sm text-gray-500">Tổng cộng</p>
//                                             <p className="font-bold text-xl text-red-600">{selectedOrder.tongTien.toLocaleString('vi-VN')} đ</p>
//                                             <p className="text-sm font-medium mt-1">
//                                                 Trạng thái: <span className="text-blue-600">{selectedOrder.trangThaiAI === 'Cho_Kiem_Duyet' ? 'Chờ xác nhận' : selectedOrder.trangThaiAI}</span>
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <h4 className="font-bold text-gray-800 mb-3">Sản phẩm đã mua ({orderDetails.length})</h4>
//                                     <div className="space-y-3">
//                                         {orderDetails.map(item => (
//                                             <div key={item.maChiTiet} className="flex gap-4 p-3 border rounded-lg items-center bg-white shadow-sm">
//                                                 <img src={item.hinhAnh ? `https://localhost:7010${item.hinhAnh}` : "https://via.placeholder.com/60x80"} alt={item.tenSach} className="w-12 h-16 object-cover rounded border" />
//                                                 <div className="flex-1">
//                                                     <p className="font-bold text-gray-800 text-sm">{item.tenSach}</p>
//                                                     <p className="text-gray-500 text-xs mt-1">Đơn giá: {item.donGia.toLocaleString('vi-VN')} đ</p>
//                                                 </div>
//                                                 <div className="text-right">
//                                                     <p className="text-sm font-medium text-gray-600">SL: x{item.soLuong}</p>
//                                                     <p className="font-bold text-red-600 mt-1">{(item.donGia * item.soLuong).toLocaleString('vi-VN')} đ</p>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default OrderManager;


import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './OrderManager.css';

const API = 'https://localhost:7010';

// Danh sách trạng thái chuẩn nghiệp vụ
const orderStatuses = [
    'Chờ xác nhận',
    'Đã xác nhận',
    'Đang chuẩn bị hàng',
    'Đang giao hàng',
    'Đã giao hàng',
    'Đã hủy',
];

// Màu sắc tương ứng từng trạng thái (xem [data-tone] trong CSS)
const statusTone = {
    'Chờ xác nhận': 'wait',
    'Đã xác nhận': 'ok',
    'Đang chuẩn bị hàng': 'prep',
    'Đang giao hàng': 'ship',
    'Đã giao hàng': 'done',
    'Đã hủy': 'cancel',
};

// Chuyển trạng thái mặc định của DB sang tên hiển thị
const normalizeStatus = (s) => (s === 'Cho_Kiem_Duyet' ? 'Chờ xác nhận' : s);

const formatMoney = (n) => `${(n ?? 0).toLocaleString('vi-VN')} đ`;

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState('');

    // State cho Modal chi tiết đơn hàng
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchOrders = async () => {
        const res = await fetch(`${API}/api/DonHang/admin/all`);
        if (res.ok) setOrders(await res.json());
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Đóng modal bằng phím Esc
    useEffect(() => {
        if (!selectedOrder) return;
        const onKey = (e) => e.key === 'Escape' && setSelectedOrder(null);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selectedOrder]);

    // 1. Cập nhật trạng thái đơn hàng
    const handleUpdateStatus = async (id, newStatus) => {
        if (!window.confirm(`Xác nhận đổi đơn hàng #${id} sang: ${newStatus}?`)) return;

        await fetch(`${API}/api/DonHang/admin/${id}/trangthai`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStatus),
        });
        fetchOrders();
    };

    // 2. Xem chi tiết
    const handleViewDetails = async (order) => {
        setSelectedOrder(order);
        setOrderDetails([]);
        setLoadingDetails(true);
        const res = await fetch(`${API}/api/DonHang/admin/${order.maDonHang}/chitiet`);
        if (res.ok) setOrderDetails(await res.json());
        setLoadingDetails(false);
    };

    // 3. Xuất EXCEL
    const exportToExcel = () => {
        if (orders.length === 0) return alert('Không có dữ liệu để xuất!');
        const dataToExport = orders.map((o) => ({
            'Mã ĐH': o.maDonHang,
            'Khách Hàng': o.tenNguoiDung,
            Email: o.email,
            'Ngày Đặt': new Date(o.ngayDat).toLocaleString('vi-VN'),
            'Tổng Tiền': o.tongTien,
            'Trạng Thái': normalizeStatus(o.trangThaiAI),
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DonHang');
        XLSX.writeFile(workbook, 'DanhSachDonHang.xlsx');
    };

    // 4. Xuất PDF
    const exportToPDF = () => {
        if (orders.length === 0) return alert('Không có dữ liệu để xuất!');
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('DANH SACH DON HANG - BOOKPARADISE', 14, 15);

        const tableColumn = ['Ma DH', 'Khach Hang', 'Ngay Dat', 'Tong Tien (VND)', 'Trang Thai'];
        const tableRows = orders.map((o) => [
            o.maDonHang,
            o.tenNguoiDung,
            new Date(o.ngayDat).toLocaleDateString('vi-VN'),
            o.tongTien.toLocaleString('vi-VN'),
            o.trangThaiAI === 'Cho_Kiem_Duyet' ? 'Cho xac nhan' : o.trangThaiAI,
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
        });

        doc.save('DanhSachDonHang.pdf');
    };

    // Tìm kiếm theo tên khách, email hoặc mã đơn hàng
    const filteredOrders = orders.filter(
        (o) =>
            o.tenNguoiDung?.toLowerCase().includes(search.toLowerCase()) ||
            o.email?.toLowerCase().includes(search.toLowerCase()) ||
            o.maDonHang.toString().includes(search)
    );

    // Số liệu tổng quan
    const summary = useMemo(() => {
        const pending = orders.filter((o) => normalizeStatus(o.trangThaiAI) === 'Chờ xác nhận').length;
        const revenue = orders
            .filter((o) => normalizeStatus(o.trangThaiAI) === 'Đã giao hàng')
            .reduce((sum, o) => sum + (o.tongTien || 0), 0);
        return { total: orders.length, pending, revenue };
    }, [orders]);

    return (
        <div className="om-page">
            {/* Banner */}
            <div className="om-hero">
              <div className="om-container">
            <header className="om-header">
                <div>
                    <h2 className="om-title">Quản lý đơn hàng</h2>
                    <p className="om-subtitle">Theo dõi, cập nhật và xuất danh sách đơn hàng của cửa hàng</p>
                </div>

                <div className="om-export">
                    <button onClick={exportToExcel} className="om-btn om-btn--excel">
                        📊 Xuất Excel
                    </button>
                    <button onClick={exportToPDF} className="om-btn om-btn--pdf">
                        📄 Xuất PDF
                    </button>
                </div>
            </header>
              </div>
            </div>

            <main className="om-container om-main">

            {/* Tổng quan */}
            <section className="om-summary">
                <div className="om-summary-item">
                    <span className="om-summary-icon" data-tone="ok">📦</span>
                    <div>
                        <p className="om-summary-label">Tổng đơn hàng</p>
                        <p className="om-summary-value">{summary.total}</p>
                    </div>
                </div>
                <div className="om-summary-item">
                    <span className="om-summary-icon" data-tone="wait">⏳</span>
                    <div>
                        <p className="om-summary-label">Chờ xác nhận</p>
                        <p className="om-summary-value">{summary.pending}</p>
                    </div>
                </div>
                <div className="om-summary-item">
                    <span className="om-summary-icon" data-tone="done">💰</span>
                    <div>
                        <p className="om-summary-label">Doanh thu đã giao</p>
                        <p className="om-summary-value">{formatMoney(summary.revenue)}</p>
                    </div>
                </div>
            </section>

            {/* Bảng đơn hàng */}
            <section className="om-panel">
                <div className="om-toolbar">
                    <input
                        type="text"
                        placeholder="Tìm mã đơn hàng, tên hoặc email khách hàng..."
                        className="om-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="om-table-wrap">
                    <table className="om-table">
                        <thead>
                            <tr>
                                <th>Mã ĐH</th>
                                <th>Ngày đặt</th>
                                <th>Khách hàng</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th className="om-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((o) => {
                                const currentStatus = normalizeStatus(o.trangThaiAI);

                                return (
                                    <tr key={o.maDonHang}>
                                        <td className="om-order-id">#{o.maDonHang}</td>
                                        <td className="om-date">{new Date(o.ngayDat).toLocaleString('vi-VN')}</td>
                                        <td>
                                            <div className="om-customer">
                                                <span className="om-avatar">
                                                    {(o.tenNguoiDung || '?').trim().charAt(0).toUpperCase()}
                                                </span>
                                                <div>
                                                    <p className="om-customer-name">{o.tenNguoiDung}</p>
                                                    <p className="om-customer-email">{o.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="om-money">{formatMoney(o.tongTien)}</td>
                                        <td>
                                            <select
                                                className="om-status-select"
                                                data-tone={statusTone[currentStatus] || 'ok'}
                                                value={currentStatus}
                                                onChange={(e) => handleUpdateStatus(o.maDonHang, e.target.value)}
                                                aria-label={`Trạng thái đơn hàng #${o.maDonHang}`}
                                            >
                                                {orderStatuses.map((stt) => (
                                                    <option key={stt} value={stt}>
                                                        {stt}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="om-center">
                                            <button onClick={() => handleViewDetails(o)} className="om-btn-detail">
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="om-empty">
                                        <p className="om-empty-title">Không tìm thấy đơn hàng nào</p>
                                        <p className="om-empty-hint">Thử tìm bằng mã đơn, tên hoặc email khác.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            {selectedOrder && (
                <div
                    className="om-overlay"
                    onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}
                >
                    <div className="om-modal" role="dialog" aria-modal="true" aria-labelledby="om-modal-title">
                        <div className="om-modal-head">
                            <h3 className="om-modal-title" id="om-modal-title">
                                Chi tiết đơn hàng #{selectedOrder.maDonHang}
                            </h3>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="om-close"
                                aria-label="Đóng"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="om-modal-body">
                            {loadingDetails ? (
                                <p className="om-loading">Đang tải chi tiết sản phẩm...</p>
                            ) : (
                                <>
                                    <div className="om-info">
                                        <div>
                                            <p className="om-info-label">Khách hàng</p>
                                            <p className="om-info-main">{selectedOrder.tenNguoiDung}</p>
                                            <p className="om-info-sub">{selectedOrder.email}</p>
                                        </div>
                                        <div className="om-info-right">
                                            <p className="om-info-label">Tổng cộng</p>
                                            <p className="om-info-total">{formatMoney(selectedOrder.tongTien)}</p>
                                            <span
                                                className="om-badge"
                                                data-tone={statusTone[normalizeStatus(selectedOrder.trangThaiAI)] || 'ok'}
                                            >
                                                {normalizeStatus(selectedOrder.trangThaiAI)}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className="om-items-title">Sản phẩm đã mua ({orderDetails.length})</h4>
                                    <ul className="om-items">
                                        {orderDetails.map((item) => (
                                            <li key={item.maChiTiet} className="om-item">
                                                <img
                                                    className="om-item-img"
                                                    src={item.hinhAnh ? `${API}${item.hinhAnh}` : 'https://via.placeholder.com/60x80'}
                                                    alt={item.tenSach}
                                                />
                                                <div className="om-item-info">
                                                    <p className="om-item-name">{item.tenSach}</p>
                                                    <p className="om-item-price">Đơn giá: {formatMoney(item.donGia)}</p>
                                                </div>
                                                <div className="om-item-side">
                                                    <p className="om-item-qty">SL: x{item.soLuong}</p>
                                                    <p className="om-item-sum">{formatMoney(item.donGia * item.soLuong)}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            </main>
        </div>
    );
};

export default OrderManager;
