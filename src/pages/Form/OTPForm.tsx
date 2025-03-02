import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OTPForm: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const phone = JSON.parse(localStorage.getItem('client') || '{}').phone;
  const tempToken = localStorage.getItem('temp_token');

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const inputs = Array.from(form.querySelectorAll('input[type=text]')) as HTMLInputElement[];
    const submit = form.querySelector('button[type=submit]') as HTMLButtonElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !/^[0-9]{1}$/.test(e.key) &&
        e.key !== 'Backspace' &&
        e.key !== 'Delete' &&
        e.key !== 'Tab' &&
        !e.metaKey
      ) {
        e.preventDefault();
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        const index = inputs.indexOf(e.target as HTMLInputElement);
        if (index > 0) {
          setOtp((prev) => {
            const newOtp = [...prev];
            newOtp[index - 1] = '';
            return newOtp;
          });
          inputs[index - 1].focus();
        }
      }
    };

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const index = inputs.indexOf(target);
      if (target.value && /^[0-9]$/.test(target.value)) {
        setOtp((prev) => {
          const newOtp = [...prev];
          newOtp[index] = target.value;
          return newOtp;
        });

        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      }
    };

    const handleFocus = (e: Event) => {
      (e.target as HTMLInputElement).select();
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text') || '';
      if (!new RegExp(`^[0-9]{${inputs.length}}$`).test(text)) return;
      const digits = text.split('');
      setOtp(digits);
      submit.focus();
    };

    inputs.forEach((input) => {
      input.addEventListener('input', handleInput);
      input.addEventListener('keydown', handleKeyDown);
      input.addEventListener('focus', handleFocus);
      input.addEventListener('paste', handlePaste);
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener('input', handleInput);
        input.removeEventListener('keydown', handleKeyDown);
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('paste', handlePaste);
      });
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const code = otp.join('');
    if (!phone || !tempToken) {
      setError('بيانات التحقق غير موجودة');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: code, temp_token: tempToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'رمز التحقق غير صحيح');
        setLoading(false);
        return;
      }

      const data = await response.json();
      const client = JSON.parse(localStorage.getItem('client') || '{}');
      login(data.access_token, client);
      localStorage.setItem('client_id', data.client_id);
      localStorage.removeItem('temp_token');
      localStorage.removeItem('client');
      navigate(`/subscribers/${data.client_id}`);
    } catch (err) {
      setError('حدث خطأ أثناء التحقق');
      console.error(err);
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'فشل في إعادة إرسال الرمز');
        setResendLoading(false);
        return;
      }

      setError('تم إعادة إرسال الرمز بنجاح');
      setResendLoading(false);
    } catch (err) {
      setError('حدث خطأ أثناء إعادة إرسال الرمز');
      console.error(err);
      setResendLoading(false);
    }
  };

  return (
    <div className="relative font-inter antialiased">
      <main className="relative min-h-screen flex flex-col justify-center bg-gray-100 dark:bg-boxdark overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-24">
          <div className="flex justify-center">
            <div className="max-w-md mx-auto text-center bg-white dark:bg-gray-800 px-4 sm:px-8 py-10 rounded-xl shadow dark:shadow-gray-900">
              <header className="mb-8">
                <h1 className="text-2xl font-bold text-black dark:text-white mb-1">
                  رمز التحقق من الهاتف المحمول
                </h1>
                <p className="text-[12px] text-gray-500 dark:text-gray-400">
                  أدخل رمز التحقق المكون من 4 أرقام الذي تم إرساله إلى رقم هاتفك.
                </p>
              </header>
              {error && (
                <div className="mb-4 text-red-500 dark:text-red-400">{error}</div>
              )}
              <form
                id="otp-form"
                ref={formRef}
                onSubmit={handleSubmit}
                className="dark:text-white"
              >
                <div className="flex items-center justify-center gap-3" dir="ltr">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 dark:text-white bg-gray-100 dark:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const newOtp = [...otp];
                        newOtp[index] = e.target.value.replace(/[^0-9]/g, '');
                        setOtp(newOtp);
                      }}
                    />
                  ))}
                </div>
                <div className="max-w-[260px] mx-auto mt-4">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 dark:shadow-indigo-900/50 focus:outline-none focus:ring focus:ring-indigo-300 dark:focus:ring-indigo-500 transition-colors duration-150"
                    disabled={loading}
                  >
                    {loading ? 'جاري التحقق...' : 'تأكيد'}
                  </button>
                </div>
              </form>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                لم تستلم الرمز؟
                <button
                  className="font-medium text-indigo-500 dark:text-indigo-400 mr-2 hover:text-indigo-600 dark:hover:text-indigo-300"
                  onClick={handleResendCode}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'جاري الإرسال...' : 'أعد الإرسال'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OTPForm;