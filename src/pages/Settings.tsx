import React, { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import userSix from '../images/user/user-06.png';
import Loader from '../common/Loader';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio?: string;
}

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    bio: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get('https://rosedye-backend-production.up.railway.app/api/v1/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = response.data.user;
        setUser(userData);
        setFormData({
          fullName: userData.name || '',
          phoneNumber: userData.phone || '',
          emailAddress: userData.email || '',
          bio: userData.bio || '',
          password: '',
          confirmPassword: '', 
        });
      } catch (error) {
        toast.error('فشل في جلب بيانات المستخدم');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error('يرجى اختيار ملف صورة أولاً');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('انتهت الجلسة، يرجى إعادة تسجيل الدخول');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      setIsUploading(true);
      const response = await axios.post('https://rosedye-backend-production.up.railway.app/api/v1/user/avatar', uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedUser = { ...user!, avatar: response.data.avatar_url };
      setUser(updatedUser);
      toast.success('تم تحديث الصورة بنجاح 🎉');
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message || 'حدث خطأ أثناء رفع الصورة');
      } else {
        toast.error('تعذر الاتصال بالخادم');
      }
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('انتهت الجلسة، يرجى إعادة تسجيل الدخول');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setPasswordError('كلمات المرور غير متطابقة');
      return;
    }
    setPasswordError(null);

    setIsSaving(true);
    try {
      const response = await axios.put(
        'https://rosedye-backend-production.up.railway.app/api/v1/user/profile',
        {
          name: formData.fullName,
          phone: formData.phoneNumber,
          email: formData.emailAddress,
          bio: formData.bio,
          password: formData.password || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data.user);
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message || 'حدث خطأ أثناء التحديث');
      } else {
        toast.error('تعذر الاتصال بالخادم');
      }
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const avatarUrl = user?.avatar ? `https://rosedye-backend-production.up.railway.app/${user.avatar}` : userSix;

  return (
    <>
      <ToastContainer position="top-center" autoClose={5000} rtl={true} />
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="الإعدادات" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">المعلومات الشخصية</h3>
              </div>
              <div className="p-7">
                {isLoading ? (
                  <Loader />
                ) : (
                  <form onSubmit={handleProfileUpdate}>
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="fullName"
                        >
                          الاسم الكامل
                        </label>
                        <div className="relative">
                          <span className="absolute left-4.5 top-4">
                            <svg
                              className="fill-current"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g opacity="0.8">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                  fill=""
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                  fill=""
                                />
                              </g>
                            </svg>
                          </span>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="text"
                            name="fullName"
                            id="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="الاسم الكامل"
                          />
                        </div>
                      </div>

                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="phoneNumber"
                        >
                          رقم الهاتف
                        </label>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="phoneNumber"
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="رقم الهاتف"
                        />
                      </div>
                    </div>

                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="emailAddress"
                      >
                        البريد الإلكتروني
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="email"
                          name="emailAddress"
                          id="emailAddress"
                          value={formData.emailAddress}
                          onChange={handleInputChange}
                          placeholder="البريد الإلكتروني"
                        />
                      </div>
                    </div>

                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="password"
                      >
                        كلمة المرور
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.99967 14.1666C11.8406 14.1666 13.333 12.6742 13.333 10.8333C13.333 8.99242 11.8406 7.5 9.99967 7.5C8.15877 7.5 6.66634 8.99242 6.66634 10.8333C6.66634 12.6742 8.15877 14.1666 9.99967 14.1666Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M5.83301 5.83329C4.72685 5.83329 3.82687 6.48625 3.39131 7.45179L0.833008 12.5V15.8333C0.833008 16.6065 1.46018 17.2337 2.23334 17.2337H17.7663C18.5395 17.2337 19.1663 16.6065 19.1663 15.8333V12.5L16.608 7.45179C16.1724 6.48625 15.2725 5.83329 14.1663 5.83329H5.83301ZM1.66634 15.8333V12.9706L4.22465 7.92185C4.66021 6.95631 5.56019 6.30335 6.66634 6.30335H13.333C14.4392 6.30335 15.3392 6.95631 15.7747 7.92185L18.333 12.9706V15.8333H1.66634Z"
                              fill=""
                            />
                          </svg>
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="password"
                          name="password"
                          id="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="كلمة المرور"
                        />
                      </div>
                      {passwordError && <span className="text-red-500 text-sm mt-1 block">{passwordError}</span>}
                    </div>

                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="confirmPassword"
                      >
                        تأكيد كلمة المرور
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.99967 14.1666C11.8406 14.1666 13.333 12.6742 13.333 10.8333C13.333 8.99242 11.8406 7.5 9.99967 7.5C8.15877 7.5 6.66634 8.99242 6.66634 10.8333C6.66634 12.6742 8.15877 14.1666 9.99967 14.1666Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M5.83301 5.83329C4.72685 5.83329 3.82687 6.48625 3.39131 7.45179L0.833008 12.5V15.8333C0.833008 16.6065 1.46018 17.2337 2.23334 17.2337H17.7663C18.5395 17.2337 19.1663 16.6065 19.1663 15.8333V12.5L16.608 7.45179C16.1724 6.48625 15.2725 5.83329 14.1663 5.83329H5.83301ZM1.66634 15.8333V12.9706L4.22465 7.92185C4.66021 6.95631 5.56019 6.30335 6.66634 6.30335H13.333C14.4392 6.30335 15.3392 6.95631 15.7747 7.92185L18.333 12.9706V15.8333H1.66634Z"
                              fill=""
                            />
                          </svg>
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="تأكيد كلمة المرور"
                        />
                      </div>
                      {passwordError && <span className="text-red-500 text-sm mt-1 block">{passwordError}</span>}
                    </div>

                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="bio"
                      >
                        نبذة عني
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8" clipPath="url(#clip0_88_10224)">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M1.56524 3.23223C2.03408 2.76339 2.66997 2.5 3.33301 2.5H9.16634C9.62658 2.5 9.99967 2.8731 9.99967 3.33333C9.99967 3.79357 9.62658 4.16667 9.16634 4.16667H3.33301C3.11199 4.16667 2.90003 4.25446 2.74375 4.41074C2.58747 4.56702 2.49967 4.77899 2.49967 5V16.6667C2.49967 16.8877 2.58747 17.0996 2.74375 17.2559C2.90003 17.4122 3.11199 17.5 3.33301 17.5H14.9997C15.2207 17.5 15.4326 17.4122 15.5889 17.2559C15.7452 17.0996 15.833 16.8877 15.833 16.6667V10.8333C15.833 10.3731 16.2061 10 16.6663 10C17.1266 10 17.4997 10.3731 17.4997 10.8333V16.6667C17.4997 17.3297 17.2363 17.9656 16.7674 18.4344C16.2986 18.9033 15.6627 19.1667 14.9997 19.1667H3.33301C2.66997 19.1667 2.03408 18.9033 1.56524 18.4344C1.0964 17.9656 0.833008 17.3297 0.833008 16.6667V5C0.833008 4.33696 1.0964 3.70107 1.56524 3.23223Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M16.6664 2.39884C16.4185 2.39884 16.1809 2.49729 16.0056 2.67253L8.25216 10.426L7.81167 12.188L9.57365 11.7475L17.3271 3.99402C17.5023 3.81878 17.6008 3.5811 17.6008 3.33328C17.6008 3.08545 17.5023 2.84777 17.3271 2.67253C17.1519 2.49729 16.9142 2.39884 16.6664 2.39884ZM14.8271 1.49402C15.3149 1.00622 15.9765 0.732178 16.6664 0.732178C17.3562 0.732178 18.0178 1.00622 18.5056 1.49402C18.9934 1.98182 19.2675 2.64342 19.2675 3.33328C19.2675 4.02313 18.9934 4.68473 18.5056 5.17253L10.5889 13.0892C10.4821 13.196 10.3483 13.2718 10.2018 13.3084L6.86847 14.1417C6.58449 14.2127 6.28409 14.1295 6.0771 13.9225C5.87012 13.7156 5.78691 13.4151 5.85791 13.1312L6.69124 9.79783C6.72787 9.65131 6.80364 9.51749 6.91044 9.41069L14.8271 1.49402Z"
                                fill=""
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_88_10224">
                                <rect width="20" height="20" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                        </span>
                        <textarea
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          name="bio"
                          id="bio"
                          rows={6}
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="اكتب نبذة عن نفسك..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4.5">
                      <button
                        className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                        type="submit"
                        disabled={isSaving}
                      >
                        {isSaving ? 'جاري الحفظ' : 'حفظ'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">صورتي</h3>
              </div>
              {isLoading ? (
                <Loader />
              ) : (
                <div className="p-7">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full">
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="mb-1.5 text-black dark:text-white">تعديل الصورة</span>
                    </div>
                  </div>

                  <div className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                    <div className="flex flex-col items-center justify-center space-y-3">
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
                      ) : (
                        <>
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            </svg>
                          </span>
                          <p>
                            <span className="text-primary">انقر للتحميل</span> أو السحب والإفلات
                          </p>
                          <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                          <p>(max, 800 X 800px)</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;