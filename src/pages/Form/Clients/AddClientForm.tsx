import React, { useState, useEffect } from 'react';
import { FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import countriesData from '../../../countries.json';

interface FormData {
    phone: string;
    current_balance: string;
    renewal_balance: string;
    name: string;
    start_date: string; // تاريخ البداية فقط
}

interface FormErrors {
    phone?: string;
    current_balance?: string;
    renewal_balance?: string;
    name?: string;
    start_date?: string;
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
        start_date: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [countries, setCountries] = useState<{ code: string; name: string; flag: string; arabicName: string }[]>([]);
    const [countryCode, setCountryCode] = useState('+965');

    useEffect(() => {
        setCountries(countriesData);
    }, []);

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
        if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
        if (!formData.current_balance.trim()) newErrors.current_balance = 'الرصيد الحالي مطلوب';
        if (!formData.renewal_balance.trim()) newErrors.renewal_balance = 'رصيد التجديد مطلوب';
        if (!formData.start_date) newErrors.start_date = 'تاريخ البداية مطلوب';
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
            const response = await fetch('https://rosedye-backend-production.up.railway.app/api/v1/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({
                    ...formData,
                    phone: `${countryCode}${formData.phone.startsWith('0') ? formData.phone.slice(1) : formData.phone}`,
                    current_balance: parseFloat(formData.current_balance),
                    renewal_balance: parseFloat(formData.renewal_balance),
                }),
            });

            const data = await response.json();
            if (response.ok && data.status) {
                toast.success('تم الحفظ بنجاح');
                setFormData({
                    phone: '',
                    current_balance: '',
                    renewal_balance: '',
                    name: '',
                    start_date: '',
                });
                setCountryCode('+965');
                onClientAdded();
            } else {
                toast.error(data.message || 'حدث خطأ أثناء الحفظ');
            }
        } catch (error) {
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
                start_date: '',
            });
            setCountryCode('+965');
            setIsClearing(false);
        }, 500);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') setFormData({ ...formData, [name]: value.replace(/[^0-9]/g, '').replace(/^0/, '') });
        else if (name === 'countryCode') setCountryCode(value);
        else setFormData({ ...formData, [name]: value });
    };

    const filteredCountries = countries.filter((country) =>
        country.arabicName.toLowerCase().includes('') ||
        country.code.toLowerCase().includes('')
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-2xl text-gray-900 dark:text-white">إضافة إشتراك جديد</h3>
                <button
                    type="button"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200 text-2xl"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">الاسم</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    />
                    {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name}</span>}
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">تاريخ البداية</label>
                    <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    />
                    {errors.start_date && <span className="text-red-500 text-sm mt-1 block">{errors.start_date}</span>}
                </div>
                <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">رقم الهاتف</label>
                    <div className="relative flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <select
                            name="countryCode"
                            value={countryCode}
                            onChange={handleInputChange}
                            className="w-1/3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-600 py-1 pl-1 pr-2 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                        >
                            {filteredCountries.map((country) => (
                                <option key={country.code} value={country.code}>
                                    <img src={country.flag} alt={country.name} className="w-5 h-5 mr-2 inline" />
                                    {country.code} ({country.arabicName})
                                </option>
                            ))}
                        </select>
                        <div className="w-2/3 relative">
                            <input
                                type="tel"
                                name="phone"
                                placeholder="123456789"
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-2 pl-3 pr-10 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                            <span className="absolute right-3 top-2.5">
                                <FiPhone className="text-xl text-gray-500 dark:text-gray-400" />
                            </span>
                        </div>
                    </div>
                    {errors.phone && <span className="text-red-500 text-sm mt-1 block">{errors.phone}</span>}
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">الرصيد الحالي</label>
                    <input
                        type="number"
                        name="current_balance"
                        value={formData.current_balance}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    />
                    {errors.current_balance && <span className="text-red-500 text-sm mt-1 block">{errors.current_balance}</span>}
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">رصيد التجديد</label>
                    <input
                        type="number"
                        name="renewal_balance"
                        value={formData.renewal_balance}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    />
                    {errors.renewal_balance && <span className="text-red-500 text-sm mt-1 block">{errors.renewal_balance}</span>}
                </div>
            </div>

            <div className="mt-6 flex justify-center items-center gap-4">
                <button
                    type="submit"
                    className={`relative flex w-1/2 justify-center rounded-lg bg-blue-600 p-3 font-medium text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                >
                    {!isSubmitting ? (
                        <span>حفظ</span>
                    ) : (
                        <span className="flex items-center gap-2 py-1">
                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                            <p className="text-sm">جاري الحفظ</p>
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={handleClear}
                    className={`relative flex w-1/2 justify-center rounded-lg bg-red-600 p-3 font-medium text-white ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isClearing}
                >
                    {!isClearing ? (
                        <span>إفراغ</span>
                    ) : (
                        <span className="flex items-center gap-2 py-1">
                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                            <p className="text-sm">جاري الإفراغ</p>
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
};

export default AddClientForm;