import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPhone, FiSearch } from 'react-icons/fi';
import Logo from '../../../public/logo.jpg';
import Signin from '../../../public/signin.png';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<{ code: string; name: string; flag: string; arabicName: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
      } catch (error) {
        console.error('Error fetching countries:', error);
        setError('فشل في جلب قائمة الدول');
      }
    };

    fetchCountries();
  }, []);

  const getArabicCountryName = (englishName: string): string => {
    const translations: { [key: string]: string } = {
      'Afghanistan': 'أفغانستان',
      'Albania': 'ألبانيا',
      'Algeria': 'الجزائر',
      'Andorra': 'أندورا',
      'Angola': 'أنغولا',
      'Antigua and Barbuda': 'أنتيغوا وباربودا',
      'Argentina': 'الأرجنتين',
      'Armenia': 'أرمينيا',
      'Australia': 'أستراليا',
      'Austria': 'النمسا',
      'Azerbaijan': 'أذربيجان',
      'Bahamas': 'الباهamas',
      'Bahrain': 'البحرين',
      'Bangladesh': 'بنغلاديش',
      'Barbados': 'باربادوس',
      'Belarus': 'بيلاروس',
      'Belgium': 'بلجيكا',
      'Belize': 'بليز',
      'Benin': 'بنين',
      'Bhutan': 'بوتان',
      'Bolivia': 'بوليفيا',
      'Bosnia and Herzegovina': 'البوسنة والهرسك',
      'Botswana': 'بوتسوانا',
      'Brazil': 'البرازيل',
      'Brunei': 'بروناي',
      'Bulgaria': 'بلغاريا',
      'Burkina Faso': 'بوركينا فاسو',
      'Burundi': 'بوروندي',
      'Cabo Verde': 'الرأس الأخضر',
      'Cambodia': 'كمبوديا',
      'Cameroon': 'الكاميرون',
      'Canada': 'كندا',
      'Central African Republic': 'جمهورية أفريقيا الوسطى',
      'Chad': 'تشاد',
      'Chile': 'تشيلي',
      'China': 'الصين',
      'Colombia': 'كولومبيا',
      'Comoros': 'جزر القمر',
      'Congo (Congo-Brazzaville)': 'الكونغو',
      'Costa Rica': 'كوستا ريكا',
      'Croatia': 'كرواتيا',
      'Cuba': 'كوبا',
      'Cyprus': 'قبرص',
      'Czechia': 'التشيك',
      'Denmark': 'الدنمارك',
      'Djibouti': 'جيبوتي',
      'Dominica': 'دومينيكا',
      'Dominican Republic': 'جمهورية الدومينيكان',
      'Ecuador': 'الإكوادور',
      'Egypt': 'مصر',
      'El Salvador': 'السلفادور',
      'Equatorial Guinea': 'غينيا الاستوائية',
      'Eritrea': 'إريتريا',
      'Estonia': 'إستونيا',
      'Eswatini': 'إسواتيني',
      'Ethiopia': 'إثيوبيا',
      'Fiji': 'فيجي',
      'Finland': 'فنلندا',
      'France': 'فرنسا',
      'Gabon': 'الجابون',
      'Gambia': 'غامبيا',
      'Georgia': 'جورجيا',
      'Germany': 'ألمانيا',
      'Ghana': 'غانا',
      'Greece': 'اليونان',
      'Grenada': 'غرينادا',
      'Guatemala': 'غواتيمالا',
      'Guinea': 'غينيا',
      'Guinea-Bissau': 'غينيا بيساو',
      'Guyana': 'غيانا',
      'Haiti': 'هايتي',
      'Honduras': 'هوندوراس',
      'Hungary': 'المجر',
      'Iceland': 'آيسلندا',
      'India': 'الهند',
      'Indonesia': 'إندونيسيا',
      'Iran': 'إيران',
      'Iraq': 'العراق',
      'Ireland': 'أيرلندا',
      'Israel': 'إسرائيل',
      'Italy': 'إيطاليا',
      'Jamaica': 'جامايكا',
      'Japan': 'اليابان',
      'Jordan': 'الأردن',
      'Kazakhstan': 'كازاخستان',
      'Kenya': 'كينيا',
      'Kiribati': 'كيريباتي',
      'Kuwait': 'الكويت',
      'Kyrgyzstan': 'قيرغيزستان',
      'Laos': 'لاوس',
      'Latvia': 'لاتفيا',
      'Lebanon': 'لبنان',
      'Lesotho': 'ليسوتو',
      'Liberia': 'ليبيريا',
      'Libya': 'ليبيا',
      'Liechtenstein': 'ليختنشتاين',
      'Lithuania': 'ليتوانيا',
      'Luxembourg': 'لوكسمبورغ',
      'Madagascar': 'مدغشقر',
      'Malawi': 'مالاوي',
      'Malaysia': 'ماليزيا',
      'Maldives': 'جزر المالديف',
      'Mali': 'مالي',
      'Malta': 'مالطا',
      'Marshall Islands': 'جزر مارشال',
      'Mauritania': 'موريتانيا',
      'Mauritius': 'موريشيوس',
      'Mexico': 'المكسيك',
      'Micronesia': 'ميكرونيزيا',
      'Moldova': 'مولدوفا',
      'Monaco': 'موناكو',
      'Mongolia': 'منغوليا',
      'Montenegro': 'الجبل الأسود',
      'Morocco': 'المغرب',
      'Mozambique': 'موزمبيق',
      'Myanmar': 'ميانمار',
      'Namibia': 'ناميبيا',
      'Nauru': 'ناورو',
      'Nepal': 'نيبال',
      'Netherlands': 'هولندا',
      'New Zealand': 'نيوزيلندا',
      'Nicaragua': 'نيكاراغوا',
      'Niger': 'النيجر',
      'Nigeria': 'نيجيريا',
      'North Korea': 'كوريا الشمالية',
      'North Macedonia': 'مقدونيا الشمالية',
      'Norway': 'النرويج',
      'Oman': 'عمان',
      'Pakistan': 'باكستان',
      'Palau': 'بالاو',
      'Palestine': 'فلسطين',
      'Panama': 'بنما',
      'Papua New Guinea': 'بابوا غينيا الجديدة',
      'Paraguay': 'باراغواي',
      'Peru': 'بيرو',
      'Philippines': 'الفلبين',
      'Poland': 'بولندا',
      'Portugal': 'البرتغال',
      'Qatar': 'قطر',
      'Romania': 'رومانيا',
      'Russia': 'روسيا',
      'Rwanda': 'رواندا',
      'Saint Kitts and Nevis': 'سانت كيتس ونيفيس',
      'Saint Lucia': 'سانت لوسيا',
      'Saint Vincent and the Grenadines': 'سانت فينسنت وغرينادين',
      'Samoa': 'ساموا',
      'San Marino': 'سان مارينو',
      'Sao Tome and Principe': 'ساو تومي وبرينسيب',
      'Senegal': 'السنغال',
      'Serbia': 'صربيا',
      'Seychelles': 'سيشل',
      'Sierra Leone': 'سيراليون',
      'Singapore': 'سنغافورة',
      'Slovakia': 'سلوفاكيا',
      'Slovenia': 'سلوفينيا',
      'Solomon Islands': 'جزر سليمان',
      'Somalia': 'صومال',
      'South Africa': 'جنوب أفريقيا',
      'South Korea': 'كوريا الجنوبية',
      'South Sudan': 'جنوب السودان',
      'Spain': 'إسبانيا',
      'Sri Lanka': 'سريلانكا',
      'Sudan': 'السودان',
      'Suriname': 'سورينام',
      'Sweden': 'السويد',
      'Switzerland': 'سويسرا',
      'Syria': 'سوريا',
      'Taiwan': 'تايوان',
      'Tajikistan': 'طاجيكستان',
      'Tanzania': 'تنزانيا',
      'Thailand': 'تايلاند',
      'Timor-Leste': 'تيمور الشرقية',
      'Togo': 'توغو',
      'Tonga': 'تونغا',
      'Trinidad and Tobago': 'ترينيداد وتوباغو',
      'Tunisia': 'تونس',
      'Turkey': 'تركيا',
      'Turkmenistan': 'تركمانستان',
      'Tuvalu': 'توفالو',
      'Uganda': 'أوغندا',
      'Ukraine': 'أوكرانيا',
      'United Arab Emirates': 'الإمارات العربية المتحدة',
      'United Kingdom': 'المملكة المتحدة',
      'United States': 'الولايات المتحدة',
      'Uruguay': 'أوروغواي',
      'Uzbekistan': 'أوزبكستان',
      'Vanuatu': 'فانواتو',
      'Vatican City': 'الفاتيكان',
      'Venezuela': 'فنزويلا',
      'Vietnam': 'فيتنام',
      'Yemen': 'اليمن',
      'Zambia': 'زامبيا',
      'Zimbabwe': 'زيمبابوي',
      'Saudi Arabia': 'المملكة العربية السعودية',
    };
    return translations[englishName] || englishName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fullPhone = `${countryCode}${phone}`; // دمج المقدمة مع الرقم
    try {
      const response = await fetch('https://rosedye-backend-production.up.railway.app/api/v1/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'خطأ في تسجيل الدخول');
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem('temp_token', data.temp_token);
      localStorage.setItem('client', JSON.stringify(data.client));
      navigate('/auth/otp-form');
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم');
      console.error(err);
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter((country) =>
    country.arabicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-wrap items-center min-h-screen bg-gray-50 dark:bg-boxdark transition-colors duration-300">
      <div className="w-full xl:block xl:w-1/2">
        <div className="py-6 px-4 md:py-12 md:px-18 text-center">
          <Link to="/" className="mb-5.5 flex justify-center items-center gap-2">
            <img src={Logo} alt="Logo" className="w-8 h-8 rounded-md" />
            <h2 className="text-[#1C2434] dark:text-white text-xl font-bold">مصبغة عطر الورد</h2>
          </Link>
          <span className="mt-15 inline-block">
            <img src={Signin} alt="Illustration" className="md:w-[480px] md:h-[370px] object-contain" />
          </span>
        </div>
      </div>
      <div className="w-full xl:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-6 sm:p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-900 transition-all duration-300">
          <h2 className="mb-8 text-3xl font-extrabold text-gray-900 dark:text-white text-center">
            تسجيل الدخول
          </h2>
          {error && (
            <div className="mb-6 text-red-600 dark:text-red-400 text-center p-3 bg-red-50 dark:bg-red-900 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="mb-8">
              <label className="mb-3 block text-lg font-semibold text-gray-700 dark:text-gray-200">
                رقم الهاتف
              </label>
              <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-2 rounded-xl">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-1/3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-2 pl-3 pr-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 appearance-none transition-all duration-200"
                >
                  {filteredCountries.map((country) => (
                    <option
                      key={country.code}
                      value={country.code}
                      className="flex items-center p-2 hover:bg-gray-200 dark:bg-gray-600"
                    >
                      <img src={country.flag} alt={country.name} className="w-6 h-6 mr-3" />
                      {country.code} ({country.arabicName})
                    </option>
                  ))}
                </select>
                <div className="relative">
                <input
                  type="tel"
                  placeholder="123456789"
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-2 pl-3 pr-10 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                />
                <span className="absolute right-3 top-2.5">
                  <FiPhone className="text-xl text-gray-500 dark:text-gray-400" />
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                أدخل الرقم بدون رمز الدولة، سيتم إضافته تلقائيًا.
              </p>
            </div>
            <div className="mb-6">
              <input
                type="submit"
                value={loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
                className="w-full cursor-pointer rounded-xl border border-primary bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;