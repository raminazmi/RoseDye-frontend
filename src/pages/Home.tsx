import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../public/logo.jpg';

const Home: React.FC = () => {
    return (
        <div className="flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 border border-stroke bg-white shadow-lg dark:bg-boxdark dark:border-strokedark">
                <Link to="/" className="mb-5.5 flex justify-center items-center gap-2">
                    <img src={Logo} alt="Logo" className="w-8 h-8 rounded-md" />
                    <h2 className="text-[#1C2434] dark:text-white text-xl font-bold">مصبغة عطر الورد</h2>
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    مرحبًا بكم في موقع مصبغة الورد
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                    نحن هنا لخدمتك وتقديم أفضل خدمات.
                </p>

                <div className="mt-8 flex justify-center gap-4">
                    <Link
                        to="/login"
                        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                    >
                        تسجيل الدخول
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
