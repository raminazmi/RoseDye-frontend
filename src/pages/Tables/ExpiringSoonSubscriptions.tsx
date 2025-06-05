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
    total_due: number;
    client: {
        subscription_number: string;
        renewal_balance: number;
        additional_gift: number;
        phone: string;
    };
}

const ExpiringSoonSubscriptions: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingStatus, setSendingStatus] = useState<{ [key: number]: boolean }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchExpiringSoonSubscriptions();
    }, [currentPage, itemsPerPage]);

    const fetchExpiringSoonSubscriptions = async () => {
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

            const response = await fetch(`https://api.36rwrd.online/api/v1/subscriptions/expiring-soon?page=${currentPage}&per_page=${itemsPerPage}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            const data = await response.json();
            if (data.status) {
                setSubscriptions(data.data);
                setTotalItems(data.total || 0);
            } else {
                toast.error(data.message || 'فشل في جلب البيانات');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('خطأ في جلب بيانات الاشتراكات المشارفة على الانتهاء');
        } finally {
            setLoading(false);
        }
    };

    const sendNotification = async (subscriptionId: number) => {
        try {
            setSendingStatus((prev) => ({ ...prev, [subscriptionId]: true }));
            const subscription = subscriptions.find((sub) => sub.id === subscriptionId);
            if (!subscription) {
                toast.error('الاشتراك غير موجود');
                return;
            }

            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                toast.error('يرجى تسجيل الدخول أولاً');
                navigate('/login');
                return;
            }

            const message = `تنبيه: اشتراكك رقم ${subscription.client.subscription_number} على وشك الانتهاء بتاريخ ${formatDate(subscription.end_date)} المتبقي ${subscription.client.renewal_balance} + ${subscription.client.additional_gift} هدية الرجاء استخدامه قبل الانتهاء`;
            const response = await fetch(`https://api.36rwrd.online/api/v1/subscriptions/${subscriptionId}/notify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({ message }),
            });
            const data = await response.json();
            if (data.status) {
                toast.success(data.message || 'تم إرسال التنبيه بنجاح');
            } else {
                toast.error(data.message || 'فشل في إرسال التنبيه');
            }
        } catch (error) {
            console.error('Notification error:', error);
            toast.error('حدث خطأ أثناء إرسال التنبيه');
        } finally {
            setSendingStatus((prev) => ({ ...prev, [subscriptionId]: false }));
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
        <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 transition-all duration-300">
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
                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">الاشتراكات المشارفة على الانتهاء</h3>
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
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-center">إرسال تنبيه</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((subscription) => (
                                <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150">
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                                        <Link
                                            to={`/subscribers/${subscription.id}`}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors duration-200"
                                        >
                                            {subscription.client.subscription_number}
                                        </Link>
                                    </td>
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                                        {formatDate(subscription.end_date)}
                                    </td>
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                                        {subscription.client.phone}
                                    </td>
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                                        {subscription.status === 'active' ? 'نشط' : subscription.status}
                                    </td>
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                                        <button
                                            className={`bg-meta-3 text-white rounded-lg py-2 px-4 ${sendingStatus[subscription.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => sendNotification(subscription.id)}
                                            disabled={sendingStatus[subscription.id]}
                                        >
                                            {sendingStatus[subscription.id] ? 'جاري الإرسال...' : 'إرسال تنبيه'}
                                        </button>
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
        </div>
    );
};

export default ExpiringSoonSubscriptions;