import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPhone } from 'react-icons/fi';
import Logo from '../../../public/logo.jpg';
import Signin from '../../../public/signin.png';
import countriesData from '../../countries.json';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+965');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<{ code: string; name: string; flag: string; arabicName: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const uniqueCountries = Array.from(
      new Map(countriesData.map((country) => [country.code, country])).values()
    );
    setCountries(uniqueCountries);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanedPhone = phone.startsWith('0') ? phone.slice(1) : phone;
    const fullPhone = `${countryCode}${cleanedPhone}`;

    try {
      const response = await fetch('https://api.36rwrd.online/api/v1/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, remember_me: rememberMe }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setError(Object.values(data.errors).join(', '));
        } else {
          setError(data.message || 'خطأ في تسجيل الدخول');
        }
        setLoading(false);
        return;
      }

      localStorage.setItem('temp_token', data.temp_token);
      localStorage.setItem('client', JSON.stringify(data.client));
      localStorage.setItem('rememberMe', rememberMe.toString());
      navigate('/auth/otp-form');
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم: ');
      console.error(err);
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter((country) =>
    country.arabicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="transition-colors duration-300">
      <div className="w-full flex items-center justify-center">
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
            <div className="mb-6">
              <label className="mb-3 block text-lg font-semibold text-gray-700 dark:text-gray-200">
                رقم الهاتف
              </label>
              <div className="flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-700 p-2 rounded-xl">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-2/5 md:w-1/3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-2 pl-3 pr-3 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 appearance-none transition-all duration-200"
                >
                  {filteredCountries.map((country, index) => (
                    <option
                      key={`${country.code}-${index}`}
                      value={country.code}
                      className="flex items-center p-2 hover:bg-gray-200 dark:bg-gray-600"
                    >
                      <img src={country.flag} alt={country.name} className="w-6 h-6 mr-3" />
                      {country.code}
                    </option>
                  ))}
                </select>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="123456789"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-2 pl-3 pr-10 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').replace(/^0/, ''))}
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
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="rememberMeClient"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="ml-2 w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="rememberMeClient" className="text-sm text-gray-600 dark:text-gray-300">
                  تذكرني
                </label>
              </div>
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