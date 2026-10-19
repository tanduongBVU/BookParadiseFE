import { useState } from 'react';

const ContactPage = () => {
    const [formData, setFormData] = useState({ hoTen: '', email: '', noiDung: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('https://localhost:7010/api/lienhe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Cảm ơn bạn đã liên hệ! BookParadise sẽ phản hồi bạn sớm nhất.");
                setFormData({ hoTen: '', email: '', noiDung: '' }); // Reset form
            }
        } catch (error) {
            alert("Có lỗi xảy ra, vui lòng thử lại sau.");
        }
        setIsSubmitting(false);
    };

    return (
        // ... (Giữ nguyên cấu trúc HTML bên ngoài của bạn)
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-lg p-3" 
                    value={formData.hoTen} onChange={e => setFormData({...formData, hoTen: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" required className="mt-1 block w-full border border-gray-300 rounded-lg p-3" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nội dung tin nhắn</label>
                <textarea rows="4" required className="mt-1 block w-full border border-gray-300 rounded-lg p-3" 
                    value={formData.noiDung} onChange={e => setFormData({...formData, noiDung: e.target.value})}></textarea>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
            </button>
        </form>
        // ...
    );
};
export default ContactPage;