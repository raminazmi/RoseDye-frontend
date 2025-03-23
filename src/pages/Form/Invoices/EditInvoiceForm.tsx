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
}

interface Client {
    id: number;
    subscription_number: string;
}

interface EditInvoiceFormProps {
    invoiceId: number;
    onInvoiceUpdated: () => void;
    onClose: () => void;
}

const EditInvoiceForm: React.FC<EditInvoiceFormProps> = ({ invoiceId, onInvoiceUpdated, onClose }) => {
    const [formData, setFormData] = useState<FormData>({
        client_id: '',
        date: '',
        amount: '',
    });
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchClients();
        fetchInvoice();
    }, [invoiceId]);

    const fetchClients = async () => {
        try {
            setIsLoadingClients(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('يرجى تسجيل الدخول أولاً');
                return;
            }
            const response = await fetch(`http://localhost:8000/api/v1/clients`, {
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

    const fetchInvoice = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/invoices/${invoiceId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            const data = await response.json();
            if (data.status) {
                const invoice = data.data;
                setFormData({
                    client_id: invoice.client_id.toString(),
                    date: new Date(invoice.date).toISOString().split('T')[0],
                    amount: invoice.amount.toLocaleString(),
                });
                setInvoiceNumber(invoice.invoice_number);
            }
        } catch (error) {
            console.error('Error fetching invoice:', error);
            toast.error('حدث خطأ أثناء جلب بيانات الفاتورة');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('يرجى تسجيل الدخول أولاً');
                return;
            }

            const response = await fetch(`http://localhost:8000/api/v1/invoices/${invoiceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    client_id: formData.client_id,
                    date: formData.date,
                    amount: formData.amount.replace(/,/g, '') || '0',
                }),
            });

            const data = await response.json();
            if (response.ok && data.status) {
                toast.success('تم تعديل الفاتورة بنجاح');
                onInvoiceUpdated();
            } else if (data.errors) {
                setErrors(data.errors);
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

    const formatAmount = (value: string) => {
        const numericValue = value.replace(/[^0-9.]/g, '');
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            setFormData({ ...formData, [name]: formatAmount(value) });
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
        const searchValue = inputValue.toLowerCase();
        return option.label.toLowerCase().includes(searchValue);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100">تعديل الفاتورة</h3>
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
                    <input
                        type="text"
                        value={invoiceNumber}
                        disabled
                        className="w-full rounded-md border border-gray-300 bg-gray-100 py-1.5 sm:py-2 px-3 text-sm text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-200"
                    />
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
                            value={clientOptions.find(option => option.value === formData.client_id) || null}
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
                    {errors.client_id && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.client_id[0]}</span>
                    )}
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
                    {errors.date && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.date[0]}</span>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">قيمة الفاتورة</label>
                    <input
                        type="text"
                        name="amount"
                        placeholder="0"
                        value={formData.amount}
                        onChange={handleInputChange}
                        inputMode="numeric"
                        pattern="[0-9,]*"
                        className="w-full rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 transition-all duration-200"
                    />
                    {errors.amount && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.amount[0]}</span>
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
                        <span>حفظ التعديلات</span>
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
                    className="flex w-full sm:w-1/2 justify-center rounded bg-red-700 p-3 font-medium text-white hover:bg-opacity-90"
                >
                    <span>إلغاء</span>
                </button>
            </div>
        </form>
    );
};

export default EditInvoiceForm;