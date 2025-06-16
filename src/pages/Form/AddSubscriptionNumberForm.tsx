import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface AddSubscriptionNumberFormProps {
    onSubscriptionNumbersAdded: () => void;
    onClose: () => void;
}

const AddSubscriptionNumberForm: React.FC<AddSubscriptionNumberFormProps> = ({
    onSubscriptionNumbersAdded,
    onClose,
}) => {
    const [startNumber, setStartNumber] = useState('');
    const [endNumber, setEndNumber] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        const formData = {
            start_number: startNumber,
            end_number: endNumber,
        };

        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch('https://api.36rwrd.online/api/v1/subscription-numbers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrors(errorData.errors || { general: ['حدث خطأ أثناء إضافة أرقام الاشتراكات.'] });
                toast.error(errorData.message || 'فشل إضافة أرقام الاشتراكات');
                return;
            }

            toast.success('تمت إضافة أرقام الاشتراكات بنجاح!');
            onSubscriptionNumbersAdded(); // يؤدي إلى إغلاق النافذة وتحديث البيانات
            onClose();
        } catch (error: any) {
            console.error('Error adding subscription numbers:', error);
            setErrors({ general: [error.message || 'حدث خطأ غير متوقع.'] });
            toast.error(error.message || 'فشل إضافة أرقام الاشتراكات');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setStartNumber('');
        setEndNumber('');
        setErrors({});
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
                <div className="mb-4">
                    {errors.general.map((msg, i) => (
                        <p key={i} className="text-red-500 text-sm">{msg}</p>
                    ))}
                </div>
            )}
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-2xl text-gray-900 dark:text-white">إضافة اشتراكات جديدة</h3>
                <button type="button" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200 text-2xl" onClick={onClose}>
                    ×
                </button>
            </div>

            <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                    من رقم <span className="text-meta-1">*</span>
                </label>
                <input
                    type="number"
                    value={startNumber}
                    onChange={(e) => setStartNumber(e.target.value)}
                    placeholder="أدخل الرقم الأول"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                {errors.start_number && (
                    <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.start_number[0]}</span>
                )}
            </div>

            <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                    الى رقم<span className="text-meta-1">*</span>
                </label>
                <input
                    type="number"
                    value={endNumber}
                    onChange={(e) => setEndNumber(e.target.value)}
                    placeholder="أدخل الرقم الأخير"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                {errors.end_number && (
                    <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.end_number[0]}</span>
                )}
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <button
                    type="submit"
                    className={`relative flex w-full sm:w-1/2 justify-center rounded bg-blue-600 p-3 font-medium text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                >
                    {!isSubmitting ? (
                        <span>حفظ</span>
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
                    className="flex w-full sm:w-1/2 justify-center rounded bg-gray-500 p-3 font-medium text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
                >
                    <span>إفراغ</span>
                </button>
            </div>
        </form>
    );
};

export default AddSubscriptionNumberForm;