import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface FormData {
    phone: string;
    current_balance: string;
    renewal_balance: string;
    name: string;
    email: string;
    company_name: string;
    address: string;
}

interface FormErrors {
    phone?: string;
    current_balance?: string;
    renewal_balance?: string;
    name?: string;
    email?: string;
    company_name?: string;
    address?: string;
}

interface AddClientFormProps {
    onClientAdded: () => void;
    onClose: () => void;
}

const AddClientForm: React.FC<AddClientFormProps> = ({ onClientAdded, onClose }) => {
    const [formData, setFormData] = useState<FormData>({
        phone: '',
        current_balance: '',
        renewal_balance: '',
        name: '',
        email: '',
        company_name: '',
        address: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false); // حالة لـ "حفظ"
    const [isClearing, setIsClearing] = useState(false); // حالة لـ "إفراغ"

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
        if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
        if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
        if (!formData.company_name.trim()) newErrors.company_name = 'اسم الشركة مطلوب';
        if (!formData.address.trim()) newErrors.address = 'العنوان مطلوب';
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
            const response = await fetch('http://localhost:8000/api/v1/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({
                    ...formData,
                    current_balance: parseFloat(formData.current_balance),
                    renewal_balance: parseFloat(formData.renewal_balance),
                }),
            });

            const rawText = await response.text();
            console.log('Raw Response:', rawText);

            const data = JSON.parse(rawText);

            if (response.ok && data.status) {
                toast.success('تم الحفظ بنجاح');
                setFormData({
                    phone: '',
                    current_balance: '',
                    renewal_balance: '',
                    name: '',
                    email: '',
                    company_name: '',
                    address: '',
                });
                onClientAdded();
            } else {
                toast.error(data.message || 'حدث خطأ أثناء الحفظ');
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            toast.error('حدث خطأ أثناء الاتصال بالخادم');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setIsClearing(true);
        setTimeout(() => {
            setFormData({
                phone: '',
                current_balance: '',
                renewal_balance: '',
                name: '',
                email: '',
                company_name: '',
                address: '',
            });
            setIsClearing(false);
        }, 500); // محاكاة تأخير صغير لإظهار الـ Loader
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-black dark:text-white">إضافة عميل جديد</h3>
                <button
                    type="button"
                    className="text-black dark:text-white text-2xl"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">الاسم</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="ادخل الاسم"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                    {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                </div>

                <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">رقم الهاتف</label>
                    <input
                        type="text"
                        name="phone"
                        placeholder="ادخل رقم الهاتف"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                    {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
                </div>
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">البريد الإلكتروني</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="ادخل البريد الإلكتروني"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                    {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                </div>

                <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">اسم الشركة</label>
                    <input
                        type="text"
                        name="company_name"
                        placeholder="ادخل اسم الشركة"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                    {errors.company_name && (
                        <span className="text-red-500 text-sm">{errors.company_name}</span>
                    )}
                </div>
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">العنوان</label>
                    <input
                        type="text"
                        name="address"
                        placeholder="ادخل العنوان"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                    {errors.address && <span className="text-red-500 text-sm">{errors.address}</span>}
                </div>

                <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">الرصيد الحالي</label>
                    <input
                        type="number"
                        name="current_balance"
                        placeholder="ادخل الرصيد الحالي"
                        value={formData.current_balance}
                        onChange={handleInputChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                    {errors.current_balance && (
                        <span className="text-red-500 text-sm">{errors.current_balance}</span>
                    )}
                </div>
            </div>

            <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">رصيد التجديد</label>
                <input
                    type="number"
                    name="renewal_balance"
                    placeholder="ادخل رصيد التجديد"
                    value={formData.renewal_balance}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.renewal_balance && (
                    <span className="text-red-500 text-sm">{errors.renewal_balance}</span>
                )}
            </div>

            <div className="flex justify-center items-center gap-4">
                <button
                    type="submit"
                    className={`relative flex w-1/2 justify-center rounded bg-blue-600 p-3 font-medium text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                >
                    {!isSubmitting ? (
                        <span className="">حفظ</span>
                    ) : (
                            <span className="flex items-center gap-2 py-1">
                            <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                            <p className="text-xs">جاري الحفظ</p>
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={handleClear}
                    className={`relative flex w-1/2 justify-center rounded bg-red-700 p-3 font-medium text-white ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isClearing}
                >
                    {!isClearing ? (
                        <span className="">إفراغ</span>
                    ) : (
                            <span className="flex items-center gap-2 py-1">
                            <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                            <p className="text-xs">جاري الإفراغ</p>
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
};

export default AddClientForm;