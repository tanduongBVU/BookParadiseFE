import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState('');
    
    // State cho Modal chi tiết đơn hàng
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Danh sách trạng thái chuẩn nghiệp vụ
    const orderStatuses = [
        "Chờ xác nhận", 
        "Đã xác nhận", 
        "Đang chuẩn bị hàng", 
        "Đang giao hàng", 
        "Đã giao hàng", 
        "Đã hủy"
    ];

    const fetchOrders = async () => {
        const res = await fetch('https://localhost:7010/api/DonHang/admin/all');
        if (res.ok) setOrders(await res.json());
    };

    useEffect(() => { fetchOrders(); }, []);

    // 1. Hàm cập nhật trạng thái đơn hàng
    const handleUpdateStatus = async (id, newStatus) => {
        if (!window.confirm(`Xác nhận đổi đơn hàng #${id} sang: ${newStatus}?`)) return;
        
        await fetch(`https://localhost:7010/api/DonHang/admin/${id}/trangthai`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStatus)
        });
        fetchOrders();
    };

    // 2. Hàm xem chi tiết
    const handleViewDetails = async (order) => {
        setSelectedOrder(order);
        setLoadingDetails(true);
        const res = await fetch(`https://localhost:7010/api/DonHang/admin/${order.maDonHang}/chitiet`);
        if (res.ok) setOrderDetails(await res.json());
        setLoadingDetails(false);
    };

    // 3. Hàm Xuất EXCEL
    const exportToExcel = () => {
        if (orders.length === 0) return alert("Không có dữ liệu để xuất!");
        const dataToExport = orders.map(o => ({
            "Mã ĐH": o.maDonHang,
            "Khách Hàng": o.tenNguoiDung,
            "Email": o.email,
            "Ngày Đặt": new Date(o.ngayDat).toLocaleString('vi-VN'),
            "Tổng Tiền": o.tongTien,
            "Trạng Thái": o.trangThaiAI === 'Cho_Kiem_Duyet' ? 'Chờ xác nhận' : o.trangThaiAI
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DonHang");
        XLSX.writeFile(workbook, "DanhSachDonHang.xlsx");
    };

    // 4. Hàm Xuất PDF (Đã sửa lỗi cú pháp autoTable)
    const exportToPDF = () => {
        if (orders.length === 0) return alert("Không có dữ liệu để xuất!");
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text("DANH SACH DON HANG - BOOKPARADISE", 14, 15); 
        
        const tableColumn = ["Ma DH", "Khach Hang", "Ngay Dat", "Tong Tien (VND)", "Trang Thai"];
        const tableRows = [];

        orders.forEach(o => {
            const rowData = [
                o.maDonHang,
                o.tenNguoiDung,
                new Date(o.ngayDat).toLocaleDateString('vi-VN'),
                o.tongTien.toLocaleString('vi-VN'),
                o.trangThaiAI === 'Cho_Kiem_Duyet' ? 'Cho xac nhan' : o.trangThaiAI
            ];
            tableRows.push(rowData);
        });

        // Sử dụng cú pháp mới của thư viện
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
        });

        doc.save("DanhSachDonHang.pdf");
    };

    // Tìm kiếm theo tên khách, email hoặc mã đơn hàng
    const filteredOrders = orders.filter(o => 
        o.tenNguoiDung?.toLowerCase().includes(search.toLowerCase()) || 
        o.email?.toLowerCase().includes(search.toLowerCase()) ||
        o.maDonHang.toString().includes(search)
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Đơn Hàng</h2>
                
                <div className="flex gap-2">
                    <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-medium transition">
                        📊 Xuất Excel
                    </button>
                    <button onClick={exportToPDF} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow font-medium transition">
                        📄 Xuất PDF
                    </button>
                </div>
            </div>

            <input 
                type="text" 
                placeholder="Tìm mã đơn hàng, tên hoặc email khách hàng..." 
                className="w-full mb-6 p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="p-3 border-b font-bold">Mã ĐH</th>
                            <th className="p-3 border-b font-bold">Ngày Đặt</th>
                            <th className="p-3 border-b font-bold">Khách Hàng</th>
                            <th className="p-3 border-b font-bold">Tổng Tiền</th>
                            <th className="p-3 border-b font-bold">Trạng Thái</th>
                            <th className="p-3 border-b font-bold text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(o => {
                            // Chuyển đổi trạng thái mặc định của DB để hiển thị đẹp hơn
                            const currentStatus = o.trangThaiAI === 'Cho_Kiem_Duyet' ? 'Chờ xác nhận' : o.trangThaiAI;
                            
                            return (
                                <tr key={o.maDonHang} className="hover:bg-slate-50 border-b">
                                    <td className="p-3 font-bold text-blue-600">#{o.maDonHang}</td>
                                    <td className="p-3">{new Date(o.ngayDat).toLocaleString('vi-VN')}</td>
                                    <td className="p-3">
                                        <p className="font-bold text-gray-800">{o.tenNguoiDung}</p>
                                        <p className="text-xs text-gray-500">{o.email}</p>
                                    </td>
                                    <td className="p-3 font-bold text-red-600">{o.tongTien.toLocaleString('vi-VN')} đ</td>
                                    <td className="p-3">
                                        <select 
                                            className={`p-1.5 rounded text-sm font-medium border cursor-pointer outline-none ${
                                                currentStatus === 'Đã hủy' ? 'bg-red-50 text-red-700' :
                                                currentStatus === 'Đã giao hàng' ? 'bg-green-50 text-green-700' :
                                                currentStatus === 'Chờ xác nhận' ? 'bg-yellow-50 text-yellow-700' :
                                                'bg-blue-50 text-blue-700'
                                            }`}
                                            value={currentStatus}
                                            onChange={(e) => handleUpdateStatus(o.maDonHang, e.target.value)}
                                        >
                                            {orderStatuses.map(stt => (
                                                <option key={stt} value={stt}>{stt}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button 
                                            onClick={() => handleViewDetails(o)}
                                            className="bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700 text-xs font-bold shadow"
                                        >
                                            Xem Chi Tiết
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredOrders.length === 0 && (
                            <tr><td colSpan="6" className="text-center p-6 text-gray-500 font-medium">Không tìm thấy đơn hàng nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-5 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Chi Tiết Đơn Hàng #{selectedOrder.maDonHang}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
                        </div>
                        
                        <div className="p-5 overflow-y-auto flex-1">
                            {loadingDetails ? (
                                <p className="text-center text-gray-500 py-10">Đang tải chi tiết sản phẩm...</p>
                            ) : (
                                <div>
                                    <div className="flex justify-between mb-6 bg-slate-50 p-4 rounded-lg border">
                                        <div>
                                            <p className="text-sm text-gray-500">Khách hàng</p>
                                            <p className="font-bold text-gray-800">{selectedOrder.tenNguoiDung}</p>
                                            <p className="text-sm text-gray-600">{selectedOrder.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Tổng cộng</p>
                                            <p className="font-bold text-xl text-red-600">{selectedOrder.tongTien.toLocaleString('vi-VN')} đ</p>
                                            <p className="text-sm font-medium mt-1">
                                                Trạng thái: <span className="text-blue-600">{selectedOrder.trangThaiAI === 'Cho_Kiem_Duyet' ? 'Chờ xác nhận' : selectedOrder.trangThaiAI}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-gray-800 mb-3">Sản phẩm đã mua ({orderDetails.length})</h4>
                                    <div className="space-y-3">
                                        {orderDetails.map(item => (
                                            <div key={item.maChiTiet} className="flex gap-4 p-3 border rounded-lg items-center bg-white shadow-sm">
                                                <img src={item.hinhAnh ? `https://localhost:7010${item.hinhAnh}` : "https://via.placeholder.com/60x80"} alt={item.tenSach} className="w-12 h-16 object-cover rounded border" />
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-800 text-sm">{item.tenSach}</p>
                                                    <p className="text-gray-500 text-xs mt-1">Đơn giá: {item.donGia.toLocaleString('vi-VN')} đ</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-600">SL: x{item.soLuong}</p>
                                                    <p className="font-bold text-red-600 mt-1">{(item.donGia * item.soLuong).toLocaleString('vi-VN')} đ</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;