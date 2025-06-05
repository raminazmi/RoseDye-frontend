import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../common/Loader';
import Pagination from '../../components/Pagination';
import { Link, useNavigate } from 'react-router-dom';

interface Subscription {
    id: number;
    subscription_number: string;
    end_date: string;
    client_phone: string;
    status: string;
}

const AbandonedSubscriptions: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAbandonedSubscriptions();
    }, [currentPage, itemsPerPage]);

    const fetchAbandonedSubscriptions = async () => {
        try {
            setLoading(true);
            const accessToken = localStorage.getItem('access_token');
            if (process.env.NODE_ENV === 'development') {
                console.log('Access Token:', accessToken);
            }
            if (!accessToken) {
                toast.error('يرجى تسجيل الدخول أولاً');
                navigate('/login');
                return;
            }

            const response = await fetch(
                `https://36rwrd.online/api/v1/subscriptions/abandoned?page=${currentPage}&per_page=${itemsPerPage}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    toast.error('الخدمة غير متوفرة حالياً، تحقق من إعدادات الخادم');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return;
            }

            const data = await response.json();

            if (data.status) {
                setSubscriptions(data.data);
                setTotalItems(data.total);
            } else {
                toast.error(data.message || 'فشل في جلب البيانات');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('خطأ في جلب بيانات الاشتراكات المهجورة');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    if (loading) return <Loader />;

    return (
        <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:bg-gray-800 transition-all duration-300">
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={true}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <div className="border-b border-gray-200 py-4 px-6 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">الاشتراكات المهجورة</h3>
            </div>

            <div className="p-6">
                <div className="overflow-x-auto">
                    <table className="table-auto w-full bg-white dark:bg-gray-800 rounded-md shadow-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">رقم الاشتراك</th>
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">تاريخ الانتهاء</th>
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">رقم الهاتف</th>
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((subscription) => (
                                <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150">
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                                        <Link
                                            to={`/subscribers/${subscription.id}`}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors duration-200">
                                            {subscription.subscription_number}
                                        </Link>
                                    </td>
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-gray-200">
                                        {formatDate(subscription.end_date)}
                                    </td>
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                                        {subscription.client_phone}
                                    </td>
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 text-gray-dark:text-gray-200">
                                        {subscription.status === 'active' ? 'نشط' : subscription.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>
        </div >
    );
};

export default AbandonedSubscriptions;