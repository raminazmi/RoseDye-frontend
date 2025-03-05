import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPhone } from 'react-icons/fi';

interface FormData {
    name: string;
    phone: string;
    current_balance: string;
    renewal_balance: string;
    email?: string;
    company_name?: string;
    address?: string;
}

interface FormErrors {
    name?: string;
    phone?: string;
    current_balance?: string;
    renewal_balance?: string;
    email?: string;
    company_name?: string;
    address?: string;
}

interface Client {
    id: number;
    name: string;
    phone: string;
    current_balance: number;
    renewal_balance: number;
    email: string;
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
        phone: client.phone.replace(/^\+?/, ''),
        current_balance: client.current_balance.toString(),
        renewal_balance: client.renewal_balance.toString(),
        company_name: client.company_name || '',
        email: client.email || '',
        address: client.address || '',
    });
    
    const extractCountryCode = (phone: string, prefixes: string[]): string => {
        const matchedPrefix = prefixes.find((prefix: string) => phone.startsWith(prefix));
        return matchedPrefix || '+966';
    };

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countries, setCountries] = useState<{ code: string; name: string; flag: string; arabicName: string }[]>([]);
    const [countryCode, setCountryCode] = useState('+966');
    const [searchTerm, setSearchTerm] = useState('');
    const [prefixes, setPrefixes] = useState<string[]>([]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('https://restcountries.com/v3.1/all');
                if (!response.ok) throw new Error('Failed to fetch countries');
                const data = await response.json();
                const countryList = data.map((country: any) => ({
                    code: country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : ''),
                    name: country.name.common,
                    flag: country.flags.svg,
                    arabicName: getArabicCountryName(country.name.common),
                })).sort((a: any, b: any) => a.arabicName.localeCompare(b.arabicName));
                setCountries(countryList);

                const allPrefixes = countryList.map((country: { code: string; name: string; flag: string; arabicName: string }) => country.code);
                setPrefixes(allPrefixes);

                const matchedPrefix = extractCountryCode(client.phone, allPrefixes);
                setCountryCode(matchedPrefix);

                setFormData((prev) => ({
                    ...prev,
                    phone: client.phone.replace(matchedPrefix, ''),
                }));
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };
        fetchCountries();
    }, [client.phone]);

    const getArabicCountryName = (englishName: string): string => {
        const translations: { [key: string]: string } = {
            'Afghanistan': 'أفغانستان', 'Albania': 'ألبانيا', 'Algeria': 'الجزائر', 'Andorra': 'أندورا',
            'Angola': 'أنغولا', 'Antigua and Barbuda': 'أنتيغوا وباربودا', 'Argentina': 'الأرجنتين',
            'Armenia': 'أرمينيا', 'Australia': 'أستراليا', 'Austria': 'النمسا', 'Azerbaijan': 'أذربيجان',
            'Bahamas': 'الباهamas', 'Bahrain': 'البحرين', 'Bangladesh': 'بنغلاديش', 'Barbados': 'باربادوس',
            'Belarus': 'بيلاروس', 'Belgium': 'بلجيكا', 'Belize': 'بليز', 'Benin': 'بنين', 'Bhutan': 'بوتان',
            'Bolivia': 'بوليفيا', 'Bosnia and Herzegovina': 'البوسنة والهرسك', 'Botswana': 'بوتسوانا',
            'Brazil': 'البرازيل', 'Brunei': 'بروناي', 'Bulgaria': 'بلغاريا', 'Burkina Faso': 'بوركينا فاسو',
            'Burundi': 'بوروندي', 'Cabo Verde': 'الرأس الأخضر', 'Cambodia': 'كمبوديا', 'Cameroon': 'الكاميرون',
            'Canada': 'كندا', 'Central African Republic': 'جمهورية أفريقيا الوسطى', 'Chad': 'تشاد',
            'Chile': 'تشيلي', 'China': 'الصين', 'Colombia': 'كولومبيا', 'Comoros': 'جزر القمر',
            'Congo (Congo-Brazzaville)': 'الكونغو', 'Costa Rica': 'كوستا ريكا', 'Croatia': 'كرواتيا',
            'Cuba': 'كوبا', 'Cyprus': 'قبرص', 'Czechia': 'التشيك', 'Denmark': 'الدنمارك', 'Djibouti': 'جيبوتي',
            'Dominica': 'دومينيكا', 'Dominican Republic': 'جمهورية الدومينيكان', 'Ecuador': 'الإكوادور',
            'Egypt': 'مصر', 'El Salvador': 'السلفادور', 'Equatorial Guinea': 'غينيا الاستوائية',
            'Eritrea': 'إريتريا', 'Estonia': 'إستونيا', 'Eswatini': 'إسواتيني', 'Ethiopia': 'إثيوبيا',
            'Fiji': 'فيجي', 'Finland': 'فنلندا', 'France': 'فرنسا', 'Gabon': 'الجابون', 'Gambia': 'غامبيا',
            'Georgia': 'جورجيا', 'Germany': 'ألمانيا', 'Ghana': 'غانا', 'Greece': 'اليونان',
            'Grenada': 'غرينادا', 'Guatemala': 'غواتيمالا', 'Guinea': 'غينيا', 'Guinea-Bissau': 'غينيا بيساو',
            'Guyana': 'غيانا', 'Haiti': 'هايتي', 'Honduras': 'هوندوراس', 'Hungary': 'المجر',
            'Iceland': 'آيسلندا', 'India': 'الهند', 'Indonesia': 'إندونيسيا', 'Iran': 'إيران',
            'Iraq': 'العراق', 'Ireland': 'أيرلندا', 'Israel': 'إسرائيل', 'Italy': 'إيطاليا',
            'Jamaica': 'جامايكا', 'Japan': 'اليابان', 'Jordan': 'الأردن', 'Kazakhstan': 'كازاخستان',
            'Kenya': 'كينيا', 'Kiribati': 'كيريباتي', 'Kuwait': 'الكويت', 'Kyrgyzstan': 'قيرغيزستان',
            'Laos': 'لاوس', 'Latvia': 'لاتفيا', 'Lebanon': 'لبنان', 'Lesotho': 'ليسوتو', 'Liberia': 'ليبيريا',
            'Libya': 'ليبيا', 'Liechtenstein': 'ليختنشتاين', 'Lithuania': 'ليتوانيا', 'Luxembourg': 'لوكسمبورغ',
            'Madagascar': 'مدغشقر', 'Malawi': 'مالاوي', 'Malaysia': 'ماليزيا', 'Maldives': 'جزر المالديف',
            'Mali': 'مالي', 'Malta': 'مالطا', 'Marshall Islands': 'جزر مارشال', 'Mauritania': 'موريتانيا',
            'Mauritius': 'موريشيوس', 'Mexico': 'المكسيك', 'Micronesia': 'ميكرونيزيا', 'Moldova': 'مولدوفا',
            'Monaco': 'موناكو', 'Mongolia': 'منغوليا', 'Montenegro': 'الجبل الأسود', 'Morocco': 'المغرب',
            'Mozambique': 'موزمبيق', 'Myanmar': 'ميانمار', 'Namibia': 'ناميبيا', 'Nauru': 'ناورو',
            'Nepal': 'نيبال', 'Netherlands': 'هولندا', 'New Zealand': 'نيوزيلندا', 'Nicaragua': 'نيكاراغوا',
            'Niger': 'النيجر', 'Nigeria': 'نيجيريا', 'North Korea': 'كوريا الشمالية',
            'North Macedonia': 'مقدونيا الشمالية', 'Norway': 'النرويج', 'Oman': 'عمان', 'Pakistan': 'باكستان',
            'Palau': 'بالاو', 'Palestine': 'فلسطين', 'Panama': 'بنما', 'Papua New Guinea': 'بابوا غينيا الجديدة',
            'Paraguay': 'باراغواي', 'Peru': 'بيرو', 'Philippines': 'الفلبين', 'Poland': 'بولندا',
            'Portugal': 'البرتغال', 'Qatar': 'قطر', 'Romania': 'رومانيا', 'Russia': 'روسيا', 'Rwanda': 'رواندا',
            'Saint Kitts and Nevis': 'سانت كيتس ونيفيس', 'Saint Lucia': 'سانت لوسيا',
            'Saint Vincent and the Grenadines': 'سانت فينسنت وغرينادين', 'Samoa': 'ساموا', 'San Marino': 'سان مارينو',
            'Sao Tome and Principe': 'ساو تومي وبرينسيب', 'Senegal': 'السنغال', 'Serbia': 'صربيا',
            'Seychelles': 'سيشل', 'Sierra Leone': 'سيراليون', 'Singapore': 'سنغافورة', 'Slovakia': 'سلوفاكيا',
            'Slovenia': 'سلوفينيا', 'Solomon Islands': 'جزر سليمان', 'Somalia': 'صومال',
            'South Africa': 'جنوب أفريقيا', 'South Korea': 'كوريا الجنوبية', 'South Sudan': 'جنوب السودان',
            'Spain': 'إسبانيا', 'Sri Lanka': 'سريلانكا', 'Sudan': 'السودان', 'Suriname': 'سورينام',
            'Sweden': 'السويد', 'Switzerland': 'سويسرا', 'Syria': 'سوريا', 'Taiwan': 'تايوان',
            'Tajikistan': 'طاجيكستان', 'Tanzania': 'تنزانيا', 'Thailand': 'تايلاند', 'Timor-Leste': 'تيمور الشرقية',
            'Togo': 'توغو', 'Tonga': 'تونغا', 'Trinidad and Tobago': 'ترينيداد وتوباغو', 'Tunisia': 'تونس',
            'Turkey': 'تركيا', 'Turkmenistan': 'تركمانستان', 'Tuvalu': 'توفالو', 'Uganda': 'أوغندا',
            'Ukraine': 'أوكرانيا', 'United Arab Emirates': 'الإمارات العربية المتحدة',
            'United Kingdom': 'المملكة المتحدة', 'United States': 'الولايات المتحدة', 'Uruguay': 'أوروغواي',
            'Uzbekistan': 'أوزبكستان', 'Vanuatu': 'فانواتو', 'Vatican City': 'الفاتيكان', 'Venezuela': 'فنزويلا',
            'Vietnam': 'فيتنام', 'Yemen': 'اليمن', 'Zambia': 'زامبيا', 'Zimbabwe': 'زيمبابوي',
            'Saudi Arabia': 'المملكة العربية السعودية',
        };
        return translations[englishName] || englishName;
    };

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') setFormData({ ...formData, [name]: value.replace(/[^0-9]/g, '').replace(/^0/, '') });        else if (name === 'countryCode') setCountryCode(value);
        else setFormData({ ...formData, [name]: value });
    };

    const filteredCountries = countries.filter((country) =>
        country.arabicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-2xl text-gray-900 dark:text-white">تعديل العميل</h3>
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
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">البريد الإلكتروني</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    />
                    {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>}
                </div>

                <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">رقم الهاتف</label>
                    <div className="relative flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <select
                            name="countryCode"
                            value={countryCode}
                            onChange={handleInputChange}
                            className="w-1/3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-2 pl-3 pr-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 appearance-none transition-all duration-200"
                        >
                            {filteredCountries.map((country) => (
                                <option
                                    key={country.code}
                                    value={country.code}
                                    className="flex items-center p-2 hover:bg-gray-200 dark:bg-gray-600"
                                >
                                    <img src={country.flag} alt={country.name} className="w-5 h-5 mr-2" />
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
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">اسم الشركة</label>
                    <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">العنوان</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    />
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

            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    type="submit"
                    className={`relative flex w-full sm:w-1/2 justify-center rounded-lg bg-blue-600 p-3 font-medium text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    className="relative flex w-full sm:w-1/2 justify-center rounded-lg bg-red-600 p-3 font-medium text-white transition-colors duration-200 hover:bg-red-700"
                >
                    <span>إلغاء</span>
                </button>
            </div>
        </form>
    );
};

export default EditClientForm;