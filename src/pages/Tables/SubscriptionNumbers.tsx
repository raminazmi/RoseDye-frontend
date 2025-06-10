import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../common/Loader';
import Pagination from '../../components/Pagination';
import { useNavigate } from 'react-router-dom';

interface SubscriptionNumber {
    id: number;
    number: string;
    is_available: boolean;
    client?: {
        id: number;
        phone: string;
    };
}

const SubscriptionNumbers: React.FC = () => {
    const [subscriptionNumbers, setSubscriptionNumbers] = useState<SubscriptionNumber[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingStatus, setTogglingStatus] = useState<{ [key: number]: boolean }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubscriptionNumbers();
    }, [currentPage, itemsPerPage]);

    const fetchSubscriptionNumbers = async () => {
        try {
            setLoading(true);
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                toast.error('يرجى تسجيل الدخول أولاً');
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:8000/api/v1/clients/subscription-numbers?page=${currentPage}&per_page=${itemsPerPage}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('انتهت جلسة تسجيل الدخول، يرجى تسجيل الدخول مجددًا');
                    navigate('/login');
                } else {
                    const text = await response.text();
                    console.error('Non-JSON response:', text);
                    toast.error(`خطأ في جلب أرقام الاشتراك (HTTP ${response.status})`);
                }
                return;
            }

            const data = await response.json();
            if (data.status) {
                setSubscriptionNumbers(data.data);
                setTotalItems(data.total || 0);
            } else {
                toast.error(data.message || 'فشل في جلب أرقام الاشتراك');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error(`خطأ في جلب أرقام الاشتراك: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async (subscriptionNumberId: number) => {
        try {
            setTogglingStatus((prev) => ({ ...prev, [subscriptionNumberId]: true }));
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                toast.error('يرجى تسجيل الدخول أولاً');
                navigate('/login');
                return;
            }
            const response = await fetch(
                `http://localhost:8000/api/v1/clients/subscription-numbers/${subscriptionNumberId}/toggle-availability`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );

            const data = await response.json();
            if (response.ok && data.status) {
                toast.success(data.message || 'تم تغيير حالة توفر رقم الاشتراك بنجاح');
                fetchSubscriptionNumbers();
            } else {
                if (response.status === 404) {
                    toast.error('رقم الاشتراك غير موجود');
                } else if (response.status === 401) {
                    toast.error('انتهت جلسة تسجيل الدخول، يرجى تسجيل الدخول مجددًا');
                    navigate('/login');
                } else {
                    toast.error(data.message || 'فشل في تغيير حالة التوفر');
                }
            }
        } catch (error) {
            console.error('Toggle error:', error);
            toast.error('حدث خطأ أثناء تغيير حالة التوفر');
        } finally {
            setTogglingStatus((prev) => ({ ...prev, [subscriptionNumberId]: false }));
        }
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
                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">إدارة أرقام الاشتراك</h3>
            </div>

            <div className="p-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    هنا يمكنك إدارة أرقام الاشتراك وتغيير حالة توفرها.
                </p>
                <div className="overflow-x-auto">
                    <table className="table-auto w-full bg-white dark:bg-gray-800 rounded-md shadow-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">رقم الاشتراك</th>
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">الحالة</th>
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">العميل</th>
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptionNumbers.map((subNumber) => (
                                <tr key={subNumber.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150">
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                                        {subNumber.number}
                                    </td>
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                                        {subNumber.is_available ? 'متاح' : 'غير متاح'}
                                    </td>
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                                        {subNumber.client ? subNumber.client.phone : 'غير معين'}
                                    </td>
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={subNumber.is_available}
                                            onChange={() => toggleAvailability(subNumber.id)}
                                            disabled={togglingStatus[subNumber.id]}
                                            className="toggle-checkbox"
                                        />
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

export default SubscriptionNumbers;