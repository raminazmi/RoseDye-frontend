import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const NotFoundPage: React.FC = () => {
    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <FiAlertTriangle className="text-6xl text-red-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                        404 - الصفحة غير موجودة
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        عذرًا، الصفحة التي تبحث عنها غير موجودة. ربما تم إزالتها أو أنك أدخلت عنوانًا خاطئًا.
                    </p>
                    <Link
                        to="/"
                        className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        العودة إلى الصفحة الرئيسية
                    </Link>
                </div>
            </div>
        </>
    );
};

export default NotFoundPage;