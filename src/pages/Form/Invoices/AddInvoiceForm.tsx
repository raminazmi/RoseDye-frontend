import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';

interface FormData {
    client_id: string;
    date: string;
    amount: string;
}

interface FormErrors {
    client_id?: string[];
    date?: string[];
    amount?: string[];
    general?: string;
}

interface Client {
    id: number;
    subscription_number: string;
}

interface AddInvoiceFormProps {
    onInvoiceAdded: () => void;
    onClose: () => void;
}

const AddInvoiceForm: React.FC<AddInvoiceFormProps> = ({ onInvoiceAdded, onClose }) => {
    const [formData, setFormData] = useState<FormData>({
        client_id: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const [isLoadingInvoiceNumber, setIsLoadingInvoiceNumber] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await fetchClients();
            await fetchNextInvoiceNumber();
        };
        fetchData();
    }, []);

    const fetchClients = async () => {
        try {
            setIsLoadingClients(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('يرجى تسجيل الدخول أولاً');
                return;
            }
            const response = await fetch('https://api.36rwrd.online/api/v1/clients', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.status) setClients(data.data);
            else toast.error('فشل في جلب العملاء: ' + data.message);
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب بيانات العملاء');
            console.error(error);
        } finally {
            setIsLoadingClients(false);
        }
    };

    const fetchNextInvoiceNumber = async () => {
        try {
            setIsLoadingInvoiceNumber(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('يرجى تسجيل الدخول أولاً');
                return;
            }
            const response = await fetch('https://api.36rwrd.online/api/v1/invoices/next-number', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok && data.status) {
                setInvoiceNumber(data.next_invoice_number);
            } else {
                toast.error('فشل في جلب رقم الفاتورة: ' + (data.message || 'خطأ غير محدد'));
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب رقم الفاتورة التالي');
            console.error(error);
        } finally {
            setIsLoadingInvoiceNumber(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('https://api.36rwrd.online/api/v1/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    client_id: formData.client_id,
                    date: formData.date,
                    amount: formData.amount, // إرسال القيمة كما هي
                }),
            });

            const data = await response.json();
            if (response.ok && data.status) {
                toast.success('تم اعتماد الفاتورة بنجاح');
                setFormData({ client_id: '', date: new Date().toISOString().split('T')[0], amount: '' });
                await fetchNextInvoiceNumber();
                onInvoiceAdded();
            } else if (data.errors) {
                setErrors(data.errors);
            } else {
                setErrors({ general: data.message });
            }
        } catch (error) {
            setErrors({ general: 'حدث خطأ أثناء الاتصال بالخادم' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setFormData({ client_id: '', date: new Date().toISOString().split('T')[0], amount: '' });
        setErrors({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            // السماح فقط بالأرقام والنقطة العشرية، مع منع إدخال أكثر من نقطة واحدة
            if (value === '' || /^(\d*\.?\d*)$/.test(value)) {
                setFormData({ ...formData, [name]: value });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleClientSelect = (selectedOption: any) => {
        setFormData({ ...formData, client_id: selectedOption ? selectedOption.value : '' });
    };

    const clientOptions = clients.map(client => ({
        value: client.id.toString(),
        label: client.subscription_number,
    }));

    const filterOption = (option: any, inputValue: string) => {
        return option.label.toLowerCase().includes(inputValue.toLowerCase());
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

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الفاتورة</label>
                    {isLoadingInvoiceNumber ? (
                        <div className="w-full rounded-md border border-gray-300 bg-gray-100 dark:bg-gray-700 h-10 flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">جارٍ التحميل...</span>
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={invoiceNumber}
                            disabled
                            className="w-full rounded-md border border-gray-300 bg-gray-100 py-1.5 sm:py-2 px-3 text-sm text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-200"
                        />
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الاشتراك</label>
                    {isLoadingClients ? (
                        <div className="w-full rounded-md border border-gray-300 bg-gray-100 dark:bg-gray-700 h-10 flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">جارٍ التحميل...</span>
                        </div>
                    ) : (
                        <Select
                            options={clientOptions}
                            onChange={handleClientSelect}
                            placeholder="ابحث عن رقم الاشتراك..."
                            isClearable
                            isSearchable
                            filterOption={filterOption}
                            className="text-sm"
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    backgroundColor: 'white',
                                    borderColor: '#d1d5db',
                                    '&:hover': { borderColor: '#9ca3af' },
                                }),
                                menu: (provided) => ({
                                    ...provided,
                                    backgroundColor: 'white',
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#e5e7eb' : 'white',
                                    color: state.isSelected ? 'white' : 'black',
                                }),
                            }}
                        />
                    )}
                    {errors.client_id && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.client_id[0]}</span>}
                    {errors.general && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.general}</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التاريخ</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                    {errors.date && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.date[0]}</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">قيمة الفاتورة (د.ك)</label>
                    <input
                        type="text"
                        name="amount"
                        placeholder="مثال: 35.250"
                        value={formData.amount}
                        onChange={handleInputChange}
                        inputMode="decimal"
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                    {errors.amount && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.amount[0]}</span>}
                </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <button
                    type="submit"
                    className={`relative flex w-full sm:w-1/2 justify-center rounded bg-blue-600 p-3 font-medium text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                >
                    {!isSubmitting ? (
                        <span>اعتماد</span>
                    ) : (
                        <span className="flex items-center gap-2 py-1">
                            <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                            <p className="text-xs">جاري الاعتماد</p>
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

export default AddInvoiceForm;
