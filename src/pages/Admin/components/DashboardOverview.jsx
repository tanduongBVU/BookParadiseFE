import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Đã import thư viện Link
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

const DashboardOverview = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('https://localhost:7010/api/dashboard/summary');
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-10 text-center font-bold text-gray-500">Đang tải thống kê...</div>;
    if (!data) return <div className="p-10 text-center text-red-500">Lỗi kết nối máy chủ!</div>;

    return (
        <div className="space-y-6">
            
            {/* Header đã khôi phục nút Về Cửa hàng */}
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Tổng Quan Kinh Doanh</h1>
                <Link to="/" className="text-blue-600 font-bold hover:underline transition">
                    Về Cửa hàng &rarr;
                </Link>
            </div>

            {/* 1. KHỐI DOANH THU */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow text-white">
                    <h3 className="text-blue-100 font-medium mb-1">Doanh thu 7 ngày qua</h3>
                    <p className="text-3xl font-bold">{data.doanhThu.ngay7.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow text-white">
                    <h3 className="text-green-100 font-medium mb-1">Doanh thu 14 ngày qua</h3>
                    <p className="text-3xl font-bold">{data.doanhThu.ngay14.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow text-white">
                    <h3 className="text-purple-100 font-medium mb-1">Doanh thu 30 ngày qua</h3>
                    <p className="text-3xl font-bold">{data.doanhThu.ngay30.toLocaleString('vi-VN')} đ</p>
                </div>
            </div>

            {/* 2. KHỐI BIỂU ĐỒ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Biểu đồ Doanh thu Danh Mục */}
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 text-center">Tỷ trọng Doanh Thu theo Danh Mục</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={data.doanhThuTheoDanhMuc} 
                                    dataKey="value" nameKey="name" 
                                    cx="50%" cy="50%" outerRadius={80} 
                                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {data.doanhThuTheoDanhMuc.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} đ`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biểu đồ Sách bán chạy */}
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 text-center">Top 5 Sản phẩm Bán Chạy (Số lượng)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.banChay} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <XAxis type="number" />
                                <YAxis dataKey="tenSach" type="category" width={100} tick={{fontSize: 12}} />
                                <Tooltip />
                                <Bar dataKey="daBan" fill="#FF8042" radius={[0, 4, 4, 0]} name="Đã bán" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. KHỐI DANH SÁCH CHI TIẾT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Đơn hàng gần nhất */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Đơn hàng mới nhất</h3>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-2 border-b">Mã ĐH</th>
                                <th className="p-2 border-b">Khách hàng</th>
                                <th className="p-2 border-b">Ngày đặt</th>
                                <th className="p-2 border-b">Tổng tiền</th>
                                <th className="p-2 border-b">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.donHangGanNhat.map(o => (
                                <tr key={o.maDonHang} className="hover:bg-gray-50 border-b">
                                    <td className="p-2 font-bold text-blue-600">#{o.maDonHang}</td>
                                    <td className="p-2">{o.tenKhachHang}</td>
                                    <td className="p-2">{new Date(o.ngayDat).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-2 font-bold text-red-600">{o.tongTien.toLocaleString('vi-VN')} đ</td>
                                    <td className="p-2 text-xs font-bold text-gray-600">
                                        {o.trangThai === 'Cho_Kiem_Duyet' ? 'Chờ xác nhận' : o.trangThai}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sắp hết hàng & Bán chậm */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow border border-red-100">
                        <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">⚠️ Sắp hết hàng</h3>
                        <ul className="space-y-3 text-sm">
                            {data.sapHetHang.map((s, i) => (
                                <li key={i} className="flex justify-between border-b pb-2">
                                    <span className="text-gray-700 truncate pr-2">{s.tenSach}</span>
                                    <span className="font-bold text-red-500 whitespace-nowrap">Còn {s.soLuong}</span>
                                </li>
                            ))}
                            {data.sapHetHang.length === 0 && <p className="text-green-600">Kho hàng đang dồi dào.</p>}
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                        <h3 className="font-bold text-gray-600 mb-4">📉 Sản phẩm bán chậm</h3>
                        <ul className="space-y-3 text-sm">
                            {data.banCham.map((s, i) => (
                                <li key={i} className="flex justify-between border-b pb-2">
                                    <span className="text-gray-700 truncate pr-2">{s.tenSach}</span>
                                    <span className="font-bold text-gray-500 whitespace-nowrap">Bán: {s.daBan}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardOverview;