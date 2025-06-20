import React, { useState, useEffect } from 'react';
import { FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import countriesData from '../../../countries.json';

interface FormData {
    phone: string;
    current_balance: string;
    renewal_balance: string;
    start_date: string;
    end_date: string;
    subscription_number: string;
    original_gift: string;
    additional_gift: string;
}

interface FormErrors {
    phone?: string[];
    current_balance?: string[];
    renewal_balance?: string[];
    start_date?: string[];
    end_date?: string[];
    subscription_number?: string[];
    original_gift?: string[];
    additional_gift?: string[];
}

interface AddClientFormProps {
    onClientAdded: () => void;
    onClose: () => void;
}

const packages = [
    { durationDays: 60, gift: 15, current_balance: 20, renewal_balance: 35 },
    { durationDays: 120, gift: 30, current_balance: 40, renewal_balance: 70 },
    { durationDays: 180, gift: 45, current_balance: 60, renewal_balance: 105 },
];

const AddClientForm: React.FC<AddClientFormProps> = ({ onClientAdded, onClose }) => {
    const [formData, setFormData] = useState<FormData>({
        phone: '',
        current_balance: '',
        renewal_balance: '',
        start_date: '',
        end_date: '',
        subscription_number: '',
        original_gift: '',
        additional_gift: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [countries, setCountries] = useState<{ code: string; name: string; flag: string; arabicName: string }[]>([]);
    const [countryCode, setCountryCode] = useState('+965');
    const [selectedPackage, setSelectedPackage] = useState<typeof packages[number] | null>(null);

    useEffect(() => {
        setCountries(countriesData);
    }, []);

    const formatBalance = (value: string) => {
        const numericValue = value.replace(/[^0-9.-]/g, '');
        return numericValue;
    };

    const handlePackageSelect = (pkg: typeof packages[number]) => {
        const startDate = formData.start_date || new Date().toISOString().split('T')[0];
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + pkg.durationDays);

        const newAdditionalGift = formatBalance(pkg.gift.toString());
        const newCurrentBalance = formatBalance(pkg.current_balance.toString());
        const newRenewalBalance = formatBalance(pkg.renewal_balance.toString());

        setFormData(prev => ({
            ...prev,
            start_date: startDate,
            end_date: endDate.toISOString().split('T')[0],
            current_balance: newCurrentBalance,
            renewal_balance: newRenewalBalance,
            additional_gift: newAdditionalGift,
            original_gift: newAdditionalGift,
        }));
        setSelectedPackage(pkg);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'current_balance' || name === 'renewal_balance' || name === 'additional_gift') {
            const formattedValue = formatBalance(value);
            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else if (name === 'phone' || name === 'subscription_number') {
            setFormData({ ...formData, [name]: value.replace(/[^0-9]/g, '').replace(/^0/, '') });
        } else if (name === 'countryCode') {
            setCountryCode(value);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            const response = await fetch('https://api.36rwrd.online/api/v1/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({
                    ...formData,
                    phone: `${countryCode}${formData.phone.startsWith('0') ? formData.phone.slice(1) : formData.phone}`,
                    current_balance: formData.current_balance.replace(/,/g, '') || '0',
                    renewal_balance: formData.renewal_balance.replace(/,/g, '') || '0',
                    original_gift: formData.original_gift.replace(/,/g, '') || '0',
                    additional_gift: formData.additional_gift.replace(/,/g, '') || '0',
                }),
            });

            const data = await response.json();
            if (response.ok && data.status) {
                toast.success('تم الحفظ بنجاح');
                setFormData({
                    phone: '',
                    current_balance: '',
                    renewal_balance: '',
                    start_date: '',
                    end_date: '',
                    subscription_number: '',
                    original_gift: '',
                    additional_gift: '',
                });
                setCountryCode('+965');
                setSelectedPackage(null);
                onClientAdded();
            } else if (data.errors) {
                setErrors(data.errors);
            } else {
                toast.error(data.message || 'فشل في حفظ العميل');
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
                start_date: '',
                end_date: '',
                subscription_number: '',
                original_gift: '',
                additional_gift: '',
            });
            setCountryCode('+965');
            setSelectedPackage(null);
            setErrors({});
            setIsClearing(false);
        }, 500);
    };

    const filteredCountries = countries.filter((country) =>
        country.arabicName.toLowerCase().includes('') || country.code.toLowerCase().includes('')
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">إضافة أرقام اشتراكات جديدة</h3>
                <button type="button" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200 text-2xl" onClick={onClose}>
                    ×
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">رقم الاشتراك</label>
                    <input
                        type="tel"
                        name="subscription_number"
                        value={formData.subscription_number}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    />
                    {errors.subscription_number && <span className="text-red-500 text-sm mt-1 block">{errors.subscription_number[0]}</span>}
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
                                    {country.code}
                                </option>
                            ))}
                        </select>
                        <div className="w-2/3 relative">
                            <input
                                type="tel"
                                name="phone"
                                placeholder="123456789"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-2 pl-3 pr-10 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                            />
                            <span className="absolute right-3 top-2.5">
                                <FiPhone className="text-xl text-gray-500 dark:text-gray-400" />
                            </span>
                        </div>
                    </div>
                    {errors.phone && <span className="text-red-500 text-sm mt-1 block">{errors.phone[0]}</span>}
                </div>

                <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">الباقات المتاحة (اختياري)</label>
                    <div className="grid grid-cols-3 md:grid-cols-3 gap-2 gap-4">
                        {packages.map((pkg, index) => (
                            <button
                                type="button"
                                key={index}
                                onClick={() => handlePackageSelect(pkg)}
                                className={`p-3 md:p-4 rounded-lg border ${selectedPackage?.durationDays === pkg.durationDays ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'} transition - all duration - 200`}
                            >
                                <div className="text-md md:text-lg font-semibold mb-2 md:mb-0">{pkg.durationDays} يوم</div>
                                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">هدية {pkg.gift} دينار</div>
                            </button>
                        ))}
                    </div>
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
                    {errors.start_date && <span className="text-red-500 text-sm mt-1 block">{errors.start_date[0]}</span>}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">تاريخ النهاية</label>
                    <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    />
                    {errors.end_date && <span className="text-red-500 text-sm mt-1 block">{errors.end_date[0]}</span>}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">الرصيد الحالي</label>
                    <input
                        type="text"
                        name="current_balance"
                        placeholder="0"
                        value={formData.current_balance}
                        onChange={handleInputChange}
                        inputMode="numeric"
                        pattern="[0-9,-]*"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    />
                    {errors.current_balance && <span className="text-red-500 text-sm mt-1 block">{errors.current_balance[0]}</span>}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">رصيد التجديد</label>
                    <input
                        type="text"
                        name="renewal_balance"
                        placeholder="0"
                        value={formData.renewal_balance}
                        onChange={handleInputChange}
                        inputMode="numeric"
                        pattern="[0-9,-]*"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    />
                    {errors.renewal_balance && <span className="text-red-500 text-sm mt-1 block">{errors.renewal_balance[0]}</span>}
                </div>

                <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">هدية إضافية (اختياري)</label>
                    <input
                        type="text"
                        name="additional_gift"
                        placeholder="0"
                        value={formData.additional_gift}
                        onChange={handleInputChange}
                        inputMode="numeric"
                        pattern="[0-9,-]*"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    />
                    {errors.additional_gift && <span className="text-red-500 text-sm mt-1 block">{errors.additional_gift[0]}</span>}
                </div>
            </div>

            <div className="mt-6 flex justify-center items-center gap-4">
                <button
                    type="submit"
                    className={`relative flex w-1/2 justify-center rounded-lg bg-blue-600 p-3 font-medium text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                >
                    {!isSubmitting ? <span>حفظ</span> : (
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
                    {!isClearing ? <span>إفراغ</span> : (
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