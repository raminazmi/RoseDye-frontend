import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdEmail } from 'react-icons/md';
import { FiLock } from 'react-icons/fi';
import Logo from '../../../public/logo.jpg';
import Signin from '../../../public/signin.png';

const SignIn: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        if (!email) {
            setErrors((prev) => ({ ...prev, email: 'البريد الإلكتروني مطلوب' }));
            setLoading(false);
            return;
        }
        if (!password) {
            setErrors((prev) => ({ ...prev, password: 'كلمة المرور مطلوبة' }));
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://api.36rwrd.online/api/v1/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.errors) {
                    setErrors(errorData.errors);
                } else {
                    setErrors({ general: errorData.message || 'خطأ في تسجيل الدخول' });
                }
                setLoading(false);
                return;
            }

            const data = await response.json();
            login(data.access_token, data.user);
            navigate('/');
        } catch (err) {
            setErrors({ general: 'حدث خطأ أثناء الاتصال بالخادم' });
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center">
            <div className="xsm:min-w-[420px] xl:min-w-[420px] ">
                <div className="w-full p-6 sm:p-12.5 xl:p-10">
                    <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                        تسجيل الدخول
                    </h2>

                    {errors.general && (
                        <div className="mb-4 text-red-500 text-center p-3 bg-red-50 rounded-lg">{errors.general}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="mb-2.5 block font-medium text-black dark:text-white">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="أدخل بريدك الإلكتروني"
                                    className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-stroke'
                                        } bg-transparent py-3 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <span className="absolute right-4 top-4">
                                    <MdEmail className="text-xl text-gray-400" />
                                </span>
                            </div>
                            {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email}</p>}
                        </div>

                        <div className="mb-6">
                            <label className="mb-2.5 block font-medium text-black dark:text-white">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="6+ أحرف، 1 حرف كبير"
                                    className={`w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-stroke'
                                        } bg-transparent py-3 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <span className="absolute right-4 top-4">
                                    <FiLock className="text-xl text-gray-400" />
                                </span>
                            </div>
                            {errors.password && <p className="mt-1 text-red-500 text-sm">{errors.password}</p>}
                        </div>

                        <div className="mb-5">
                            <input
                                type="submit"
                                value={loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
                                className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
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