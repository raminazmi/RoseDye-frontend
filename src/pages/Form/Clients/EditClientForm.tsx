import React, { useState, useEffect } from 'react';
import { FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import countriesData from '../../../countries.json';

interface FormData {
    name: string;
    phone: string;
    current_balance: string;
    renewal_balance: string;
    start_date: string;
}

interface FormErrors {
    name?: string;
    phone?: string;
    current_balance?: string;
    renewal_balance?: string;
    start_date?: string;
}

interface Client {
    id: number;
    name: string;
    phone: string;
    current_balance: number;
    renewal_balance: number;
    subscription_number: string;
    start_date: string;
}

interface EditClientFormProps {
    client: Client;
    onClientUpdated: () => void;
    onClose: () => void;
}

const EditClientForm: React.FC<EditClientFormProps> = ({ client, onClientUpdated, onClose }) => {
    const [formData, setFormData] = useState<FormData>({
        name: client.name,
        phone: client.phone.replace(/^\+?/, ''),
        current_balance: client.current_balance.toString(),
        renewal_balance: client.renewal_balance.toString(),
        start_date: client.start_date,
    });

    const extractCountryCode = (phone: string, prefixes: string[]): string => {
        const matchedPrefix = prefixes.find((prefix: string) => phone.startsWith(prefix));
        return matchedPrefix || '+965';
    };

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countries, setCountries] = useState<{ code: string; name: string; flag: string; arabicName: string }[]>([]);
    const [countryCode, setCountryCode] = useState('+965');
    const [prefixes, setPrefixes] = useState<string[]>([]);

    useEffect(() => {
        setCountries(countriesData);
        const allPrefixes = countriesData.map((country) => country.code);
        setPrefixes(allPrefixes);

        const matchedPrefix = extractCountryCode(client.phone, allPrefixes);
        setCountryCode(matchedPrefix);

        setFormData((prev) => ({
            ...prev,
            phone: client.phone.replace(matchedPrefix, ''),
        }));
    }, [client.phone]);

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
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('يرجى تسجيل الدخول أولاً');
                return;
            }

            const response = await fetch(`https://rosedye-backend-production.up.railway.app/api/v1/clients/${client.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: `${countryCode}${formData.phone.startsWith('0') ? formData.phone.slice(1) : formData.phone}`,
                    current_balance: parseFloat(formData.current_balance),
                    renewal_balance: parseFloat(formData.renewal_balance),
                    start_date: formData.start_date,
                }),
            });

            const data = await response.json();
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
                <h3 className="font-bold text-2xl text-gray-900 dark:text-white">تعديل الاشتراك</h3>
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
                            className="w-1/3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-2 pl-3 pr-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
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
                        <span>حفظ التعديلات</span>
                    ) : (
                        <span className="flex items-center gap-2 py-1">
                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                            <p className="text-sm">جاري الحفظ</p>
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="relative flex w-1/2 justify-center rounded-lg bg-red-600 p-3 font-medium text-white transition-colors duration-200 hover:bg-red-700"
                >
                    <span>إلغاء</span>
                </button>
            </div>
        </form>
    );
};

export default EditClientForm;