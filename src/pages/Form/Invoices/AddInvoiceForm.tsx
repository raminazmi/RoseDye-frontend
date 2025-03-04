import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface FormData {
    client_id: string;
    issue_date: string;
    due_date: string;
    amount: string;
    description: string;
}

interface FormErrors {
    client_id?: string;
    issue_date?: string;
    due_date?: string;
    amount?: string;
    description?: string;
}

interface Client {
    id: number;
    name: string;
}

interface AddInvoiceFormProps {
    onInvoiceAdded: () => void;
    onClose: () => void;
}

const AddInvoiceForm: React.FC<AddInvoiceFormProps> = ({ onInvoiceAdded, onClose }) => {
    const [formData, setFormData] = useState<FormData>({
        client_id: '',
        issue_date: '',
        due_date: '',
        amount: '',
        description: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); // حالة لـ "حفظ"
    const [isClearing, setIsClearing] = useState(false); // حالة لـ "إفراغ"

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setIsLoadingClients(true);

            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('يرجى تسجيل الدخول أولاً');
                return;
            }
            const response = await fetch(`https://rosedye-backend-production.up.railway.app/api/v1/clients`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.status) {
                setClients(data.data);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error('حدث خطأ أثناء جلب بيانات العملاء');
        } finally {
            setIsLoadingClients(false);
        }
    };

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!formData.client_id) newErrors.client_id = 'العميل مطلوب';
        if (!formData.issue_date) newErrors.issue_date = 'تاريخ الإصدار مطلوب';
        if (!formData.due_date) newErrors.due_date = 'تاريخ الاستحقاق مطلوب';
        if (!formData.amount.trim()) newErrors.amount = 'المبلغ مطلوب';

        if (formData.issue_date && formData.due_date) {
            const issueDate = new Date(formData.issue_date);
            const dueDate = new Date(formData.due_date);
            if (issueDate > dueDate) {
                newErrors.issue_date = 'تاريخ الإصدار يجب أن يكون قبل تاريخ الاستحقاق';
            }
        }

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

            const response = await fetch('https://rosedye-backend-production.up.railway.app/api/v1/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                }),
            });

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.status) {
                toast.success('تم الحفظ بنجاح', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'colored',
                });
                setFormData({
                    client_id: '',
                    issue_date: '',
                    due_date: '',
                    amount: '',
                    description: '',
                });
                onInvoiceAdded();
            } else {
                toast.error(data.message || 'حدث خطأ أثناء الحفظ', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'colored',
                });
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('حدث خطأ أثناء الاتصال بالخادم', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'colored',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setIsClearing(true);
        setTimeout(() => {
            setFormData({
                client_id: '',
                issue_date: '',
                due_date: '',
                amount: '',
                description: '',
            });
            setIsClearing(false);
        }, 500); // محاكاة تأخير صغير لإظهار الـ Loader
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100">إضافة فاتورة جديدة</h3>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">العميل</label>
                    {isLoadingClients ? (
                        <div className="w-full rounded-md border border-gray-300 bg-gray-100 dark:bg-gray-700 h-10 flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">جارٍ التحميل...</span>
                        </div>
                    ) : (
                        <select
                            name="client_id"
                            value={formData.client_id}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 bg-white py-1 sm:py-[6px] px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                        >
                            <option value="">اختر العميل</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.client_id && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.client_id}</span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تاريخ الإصدار</label>
                    <input
                        type="date"
                        name="issue_date"
                        value={formData.issue_date}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                    {errors.issue_date && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.issue_date}</span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تاريخ الاستحقاق</label>
                    <input
                        type="date"
                        name="due_date"
                        value={formData.due_date}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                    {errors.due_date && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.due_date}</span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المبلغ</label>
                    <input
                        type="number"
                        name="amount"
                        placeholder="ادخل المبلغ"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                    {errors.amount && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.amount}</span>
                    )}
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الوصف</label>
                    <input
                        type="text"
                        name="description"
                        placeholder="ادخل الوصف"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                    {errors.description && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.description}</span>
                    )}
                </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <button
                    type="submit"
                    className={`relative flex w-full sm:w-1/2 justify-center rounded bg-blue-600 p-3 font-medium text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    className={`relative flex w-full sm:w-1/2 justify-center rounded bg-red-700 p-3 font-medium text-white ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
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

export default AddInvoiceForm;