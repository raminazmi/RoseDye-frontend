import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface FormData {
    name: string;
    phone: string;
    current_balance: string;
    renewal_balance: string;
    company_name?: string;
    address?: string;
}

interface FormErrors {
    name?: string;
    phone?: string;
    current_balance?: string;
    renewal_balance?: string;
    company_name?: string;
    address?: string;
}

interface Client {
    id: number;
    name: string;
    phone: string;
    current_balance: number;
    renewal_balance: number;
    company_name?: string;
    address?: string;
    subscription_number: string;
}

interface EditClientFormProps {
    client: Client;
    onClientUpdated: () => void;
    onClose: () => void;
}

const EditClientForm: React.FC<EditClientFormProps> = ({ client, onClientUpdated, onClose }) => {
    const [formData, setFormData] = useState<FormData>({
        name: client.name,
        phone: client.phone,
        current_balance: client.current_balance.toString(),
        renewal_balance: client.renewal_balance.toString(),
        company_name: client.company_name || '',
        address: client.address || '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false); // حالة لـ "حفظ التعديلات"

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
        if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
        if (!formData.current_balance.trim()) newErrors.current_balance = 'الرصيد الحالي مطلوب';
        if (!formData.renewal_balance.trim()) newErrors.renewal_balance = 'رصيد التجديد مطلوب';

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formErrors = validate();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('يرجى تسجيل الدخول أولاً');
                return;
            }

            const response = await fetch(`http://localhost:8000/api/v1/clients/${client.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    current_balance: parseFloat(formData.current_balance),
                    renewal_balance: parseFloat(formData.renewal_balance),
                    company_name: formData.company_name || null,
                    address: formData.address || null,
                }),
            });

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.status) {
                toast.success('تم تعديل العميل بنجاح');
                onClientUpdated();
            } else {
                toast.error(data.message || 'حدث خطأ أثناء التعديل');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('حدث خطأ أثناء الاتصال بالخادم');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100">تعديل العميل</h3>
                <button
                    type="button"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200 text-xl sm:text-2xl"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                    {errors.name && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.name}</span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الهاتف</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                    {errors.phone && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.phone}</span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الرصيد الحالي</label>
                    <input
                        type="number"
                        name="current_balance"
                        value={formData.current_balance}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                    {errors.current_balance && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.current_balance}</span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رصيد التجديد</label>
                    <input
                        type="number"
                        name="renewal_balance"
                        value={formData.renewal_balance}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                    {errors.renewal_balance && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.renewal_balance}</span>
                    )}
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم الشركة</label>
                    <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">العنوان</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <button
                    type="submit"
                    className={`relative flex w-full sm:w-1/2 justify-center rounded bg-blue-600 p-3 font-medium text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                >
                    {!isSubmitting ? (
                        <span className="">حفظ التعديلات</span>
                    ) : (
                            <span className="flex items-center gap-2 py-1">
                            <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                            <p className="text-xs">جاري الحفظ</p>
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className={`relative flex w-full sm:w-1/2 justify-center rounded bg-red-700 p-3 font-medium text-white`}
                >
                    <span className="">إلغاء</span>
                </button>
            </div>
        </form>
    );
};

export default EditClientForm;