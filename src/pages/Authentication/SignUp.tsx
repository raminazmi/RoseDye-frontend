// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import Logo from '../../../public/logo.jpg';
// import { useAuth } from '../../context/AuthContext';
// import Signin from '../../../public/signin.png';
// import { MdEmail } from 'react-icons/md';
// import { FiLock } from 'react-icons/fi';

// const SignUp: React.FC = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     if (password !== confirmPassword) {
//       setError('كلمتا المرور غير متطابقتين');
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch('https://36rwrd.online/api/v1/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ name, email, password, password_confirmation: confirmPassword })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         setError(errorData.message || 'حدث خطأ أثناء التسجيل');
//         setLoading(false);
//         return;
//       }

//       const data = await response.json();
//       login(data.access_token, data.user);
//       navigate('/');
//     } catch (err) {
//       setError('حدث خطأ أثناء الاتصال بالخادم');
//       console.error(err);
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className="flex flex-wrap items-center">
//         <div className="w-full xl:block xl:w-1/2">
//           <div className="py-6 px-4 md:py-12 md:px-18 text-center">
//             <Link to="/" className="mb-5.5 flex justify-center items-center gap-2">
//               <img src={Logo} alt="Logo" className="w-8 h-8 rounded-md" />
//               <h2 className="text-[#1C2434] dark:text-white text-xl font-bold">مصبغة عطر الورد</h2>
//             </Link>

//             <span className="mt-15 inline-block">
//               <img src={Signin} alt="Illustration" className="md:w-[480px] md:h-[370px]" />
//             </span>
//           </div>
//         </div>

//         <div className="w-full xl:w-1/2">
//           <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
//             <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
//               إنشاء حساب
//             </h2>
//             {error && <div className="mb-4 text-red-500">{error}</div>}
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label className="mb-2.5 block font-medium text-black dark:text-white">الاسم كامل</label>
//                 <input type="text" placeholder="أدخل اسمك الكامل" className="w-full rounded-lg border py-4 px-6" value={name} onChange={(e) => setName(e.target.value)} required />
//               </div>
//               <div className="mb-4">
//                 <label className="mb-2.5 block font-medium text-black dark:text-white">البريد الإلكتروني</label>
//                 <div className="relative">
//                   <input type="email" placeholder="أدخل بريدك الإلكتروني" className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" value={email} onChange={(e) => setEmail(e.target.value)} required />
//                   <span className="absolute right-4 top-4">
//                     <MdEmail className="text-xl text-gray-400" />
//                   </span>
//                 </div>
//               </div>
//               <div className="mb-4">
//                 <label className="mb-2.5 block font-medium text-black dark:text-white">كلمة المرور</label>
//                 <div className="relative">
//                   <input type="password" placeholder="أدخل كلمة المرور" className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" value={password} onChange={(e) => setPassword(e.target.value)} required />
//                   <span className="absolute right-4 top-4">
//                     <FiLock className="text-xl text-gray-400" />
//                   </span>
//                 </div>
//               </div>
//               <div className="mb-6">
//                 <label className="mb-2.5 block font-medium text-black dark:text-white">تأكيد كلمة المرور</label>
//                 <div className="relative">
//                   <input type="password" placeholder="أعد إدخال كلمة المرور" className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
//                   <span className="absolute right-4 top-4">
//                     <FiLock className="text-xl text-gray-400" />
//                   </span>
//                 </div>
//               </div>
//               <div className="mb-5">
//                 <input type="submit" value={loading ? "جاري التحميل..." : "إنشاء حساب"} className="w-full cursor-pointer rounded-lg border bg-primary p-4 text-white transition hover:bg-opacity-90" disabled={loading} />
//               </div>
//             </form>
//             <div className="mt-6 text-center">
//               <p>
//                 لديك حساب بالفعل؟ <Link to="/login" className="text-primary">تسجيل الدخول</Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default SignUp;
