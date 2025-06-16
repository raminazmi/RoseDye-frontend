import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../common/Loader';
import Pagination from '../../components/Pagination';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ToggleSwitch from '../../components/ToggleSwitch';

interface Subscription {
  id: number;
  subscription_number: string;
  invoices_count: number;
  end_date: string;
  total_due: number;
  total_inv: number;
  client_phone: string;
  status: string;
  is_available: boolean;
  subscription_number_id: number;
}

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState<{ [key: number]: boolean }>({});
  const [sendingStatus, setSendingStatus] = useState<{ [key: number]: boolean }>({});
  const [renewingStatus, setRenewingStatus] = useState<{ [key: number]: boolean }>({});
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null);
  const [giftAmount, setGiftAmount] = useState<string>('');
  const [renewalCost, setRenewalCost] = useState<string>('');

  const tableRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptions();
  }, [currentPage, itemsPerPage]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('يرجى تسجيل الدخول أولاً');
        navigate('/login');
        return;
      }

      const response = await fetch(`https://api.36rwrd.online/api/v1/subscriptions?page=${currentPage}&per_page=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
          toast.error(`خطأ في جلب الاشتراكات (HTTP ${response.status})`);
        }
        return;
      }

      const data = await response.json();
      if (data.status) {
        const formattedData = data.data.map((sub: any) => ({
          ...sub,
          is_available: sub.client?.subscription_number_id
            ? sub.client.is_available !== undefined
              ? sub.client.is_available
              : true
            : true,
          subscription_number_id: sub.client?.subscription_number_id || null,
        }));
        setSubscriptions(formattedData);
        setTotalItems(data.total || 0);
      } else {
        toast.error(data.message || 'فشل في جلب الاشتراكات');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(`خطأ في جلب الاشتراكات: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    setExportLoading(true);
    try {
      const response = await axios.get('https://api.36rwrd.online/api/v1/subscriptions/export-pdf', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscriptions.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('تم تصدير PDF بنجاح');
    } catch (error) {
      toast.error('فشل تصدير PDF');
    } finally {
      setExportLoading(false);
    }
  };

  const handleStatusChange = async (subscriptionId: number, newStatus: string) => {
    try {
      const response = await fetch(`https://api.36rwrd.online/api/v1/subscriptions/${subscriptionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.status) {
        toast.success('تم تحديث حالة الاشتراك بنجاح');
        fetchSubscriptions();
      } else {
        toast.error(data.message || 'فشل في تحديث الحالة');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الحالة');
    } finally {
      setEditingStatusId(null);
    }
  };

  const sendNotification = async (subscriptionId: number) => {
    try {
      setSendingStatus((prev) => ({ ...prev, [subscriptionId]: true }));
      const subscription = subscriptions.find((sub) => sub.id === subscriptionId);
      if (subscription?.status === 'canceled') {
        toast.error('لا يمكن إرسال تنبيه لاشتراك موقوف');
        return;
      }
      const message = `تنبيه: اشتراكك رقم ${subscription?.subscription_number} على وشك الانتهاء بتاريخ ${subscription?.end_date}. المتبقي ${subscription?.total_due} د.ك. الرجاء استخدامه قبل الانتهاء.`;
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
      toast.error('حدث خطأ أثناء إرسال التنبيه');
    } finally {
      setSendingStatus((prev) => ({ ...prev, [subscriptionId]: false }));
    }
  };

  const openRenewModal = (subscriptionId: number) => {
    const subscription = subscriptions.find((sub) => sub.id === subscriptionId);
    if (subscription?.status === 'canceled') {
      toast.error('لا يمكن تجديد اشتراك موقوف');
      return;
    }
    setSelectedSubscriptionId(subscriptionId);
    setGiftAmount('');
    setRenewalCost('');
    setIsRenewModalOpen(true);
  };

  const closeRenewModal = () => {
    setIsRenewModalOpen(false);
    setSelectedSubscriptionId(null);
    setGiftAmount('');
    setRenewalCost('');
  };

  const renewSubscription = async () => {
    if (!selectedSubscriptionId) return;

    const gift = parseFloat(giftAmount) || 0;
    const renewal = parseFloat(renewalCost);

    if (isNaN(renewal) || renewal <= 0) {
      toast.error('يرجى إدخال قيمة تجديد صالحة (أكبر من 0)');
      return;
    }

    try {
      setRenewingStatus((prev) => ({ ...prev, [selectedSubscriptionId]: true }));
      const response = await fetch(`https://api.36rwrd.online/api/v1/subscriptions/${selectedSubscriptionId}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          renewal_cost: renewal,
          gift: gift,
        }),
      });
      const data = await response.json();
      if (data.status) {
        toast.success(data.message);
        fetchSubscriptions();
        closeRenewModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تجديد الاشتراك');
    } finally {
      setRenewingStatus((prev) => ({ ...prev, [selectedSubscriptionId]: false }));
    }
  };

  const getRowColor = (totalDue: number) => {
    if (totalDue <= 30) return 'text-green-500 dark:bg-green-900';
    if (totalDue >= 35 && totalDue <= 40) return 'text-orange-500 dark:bg-orange-900';
    if (totalDue > 40) return 'text-red-500 dark:bg-red-900';
    return 'text-white dark:bg-gray-800';
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + ' د.ك';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusDisplay = (subscription: Subscription) => {
    if (editingStatusId === subscription.id) {
      return (
        <select
          value={subscription.status}
          onChange={(e) => handleStatusChange(subscription.id, e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white py-1.5 px-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200"
        >
          <option value="active">نشط</option>
          <option value="canceled">موقوف</option>
        </select>
      );
    }
    switch (subscription.status.toLowerCase()) {
      case 'active':
        return (
          <span
            onClick={() => setEditingStatusId(subscription.id)}
            className="inline-block bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-md cursor-pointer hover:bg-green-600 transition-all duration-200 relative group dark:bg-green-600 dark:hover:bg-green-700"
          >
            نشط
            <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 shadow-md">
              انقر لتغيير الحالة
            </span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-block bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-md dark:bg-red-600 dark:hover:bg-red-700">
            منتهي
          </span>
        );
      case 'canceled':
        return (
          <span
            onClick={() => setEditingStatusId(subscription.id)}
            className="inline-block bg-gray-500 text-white text-sm font-medium px-3 py-1 rounded-md cursor-pointer hover:bg-gray-600 transition-all duration-200 relative group dark:bg-gray-600 dark:hover:bg-gray-700"
          >
            موقوف
            <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 shadow-md">
              انقر لتغيير الحالة
            </span>
          </span>
        );
      default:
        return (
          <span className="inline-block bg-gray-500 text-white px-2 py-1 rounded-sm dark:bg-gray-600">
            {subscription.status}
          </span>
        );
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
        <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">قائمة الاشتراكات</h3>
        <button
          onClick={exportPdf}
          disabled={exportLoading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200 shadow-md"
        >
          {exportLoading ? 'جاري التصدير...' : 'تصدير PDF'}
        </button>
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
          انقر على الحالة لتغييرها (نشط/موقوف) أو استخدم المفتاح لتغيير حالة توفر الرقم
        </p>
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="table-auto w-full bg-white dark:bg-gray-800 rounded-md shadow-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">رقم الاشتراك</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">عدد الفواتير</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">تاريخ الانتهاء</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">مجموع الفواتير</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">المجموع المستحق</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">رقم الهاتف</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-center">الحالة</th>
                < th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-center">إرسال تنبيه</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr
                  key={subscription.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150"
                >
                  <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                    {subscription.subscription_number ?
                      <Link to={`/subscribers/${subscription.id}`}>
                        <span className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors duration-200">
                          {subscription.subscription_number}
                        </span>
                      </Link>
                      :
                      <span className="transition-colors duration-200">
                        -
                      </span>
                    }
                  </td>
                  <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                    {subscription.invoices_count}
                  </td>
                  <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                    {formatDate(subscription.end_date)}
                  </td>
                  <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                    {formatAmount(subscription.total_inv)}
                  </td>
                  <td
                    className={`border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200 ${getRowColor(
                      subscription.total_due
                    )}`}
                  >
                    {formatAmount(subscription.total_due)}
                  </td>
                  <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                    {subscription.client_phone}
                  </td>
                  <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                    {getStatusDisplay(subscription)}
                  </td>

                  <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                    {subscription.status.toLowerCase() !== 'canceled' && (
                      <button
                        className={`bg-blue-600 text-white rounded-lg py-2 px-4 ${sendingStatus[subscription.id] ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        onClick={() => sendNotification(subscription.id)}
                        disabled={sendingStatus[subscription.id]}
                        title="إرسال تنبيه انتهاء الاشتراك إلى العميل"
                      >
                        {sendingStatus[subscription.id] ? 'جاري الإرسال...' : 'إرسال تنبيه'}
                      </button>
                    )}
                  </td>
                  <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                    {subscription.status.toLowerCase() !== 'canceled' && (
                      <button
                        className={`bg-green-600 text-white rounded-lg py-2 px-4 ${renewingStatus[subscription.id] ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        onClick={() => openRenewModal(subscription.id)}
                        disabled={renewingStatus[subscription.id]}
                      >
                        {renewingStatus[subscription.id] ? 'جاري التجديد...' : 'تجديد'}
                      </button>
                    )}
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
      {
        isRenewModalOpen && selectedSubscriptionId && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 pt-20 sm:top-0 lg:right-72.5 backdrop-blur-sm flex justify-center items-center"
            onClick={closeRenewModal}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-sm sm:w-11/12 sm:max-w-md mx-4 shadow-xl overflow-y-auto max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-4">تجديد الاشتراك</h3>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    سعر التجديد (د.ك)
                  </label>
                  <input
                    type="number"
                    value={renewalCost}
                    onChange={(e) => setRenewalCost(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-blue-600 focus-visible:shadow-md dark:focus:border-blue-400 transition-all duration-200"
                    placeholder="أدخل سعر التجديد"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    قيمة الهدية (د.ك)
                  </label>
                  <input
                    type="number"
                    value={giftAmount}
                    onChange={(e) => setGiftAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white outline-none focus:border-blue-600 focus-visible:shadow-md dark:focus:border-blue-400 transition-all duration-200"
                    placeholder="أدخل قيمة الهدية"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={renewSubscription}
                    className={`relative flex w-full sm:w-auto justify-center rounded bg-green-600 p-3 font-medium text-white ${renewingStatus[selectedSubscriptionId] ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    disabled={renewingStatus[selectedSubscriptionId]}
                  >
                    {!renewingStatus[selectedSubscriptionId] ? (
                      <span>تجديد</span>
                    ) : (
                      <span className="flex items-center gap-2 py-1">
                        <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                        <p className="text-xs">جاري التجديد</p>
                      </span>
                    )}
                  </button>
                  <button
                    onClick={closeRenewModal}
                    className="flex w-full sm:w-auto justify-center rounded bg-gray-500 p-3 font-medium text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm mt-2 sm:mt-0"
                  >
                    <span>خروج</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Subscriptions;