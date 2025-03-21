import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../common/Loader';
import Pagination from '../../components/Pagination';
import axios from 'axios';
import { Link } from 'react-router-dom'; // استيراد Link من react-router-dom

interface Subscription {
  id: number;
  subscription_number: string;
  invoices_count: number;
  end_date: string;
  total_due: number;
  total_inv: number;
  client_phone: string;
  status: string;
}

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingStatus, setSendingStatus] = useState<{ [key: number]: boolean }>({});
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, [currentPage, itemsPerPage]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://rosedye-backend-production.up.railway.app/api/v1/subscriptions?page=${currentPage}&per_page=${itemsPerPage}`, {
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
      toast.error('حدث خطأ أثناء جلب بيانات الاشتراكات');
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    setExportLoading(true);
    try {
      const response = await axios.get('https://rosedye-backend-production.up.railway.app/api/v1/subscriptions/export-pdf', {
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
      const response = await fetch(`https://rosedye-backend-production.up.railway.app/api/v1/subscriptions/${subscriptionId}/status`, {
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
      console.error('Error updating subscription status:', error);
      toast.error('حدث خطأ أثناء تحديث الحالة');
    } finally {
      setEditingStatusId(null);
    }
  };

  const sendNotification = async (subscriptionId: number) => {
    try {
      setSendingStatus((prev) => ({ ...prev, [subscriptionId]: true }));
      const subscription = subscriptions.find((sub) => sub.id === subscriptionId);
      const message = `تنبيه: اشتراكك رقم ${subscription?.subscription_number} على وشك الانتهاء بتاريخ ${subscription?.end_date}.`;
      const response = await fetch(`https://rosedye-backend-production.up.railway.app/api/v1/subscriptions/${subscriptionId}/notify`, {
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

  const getRowColor = (totalDue: number) => {
    if (totalDue <= 30) return 'bg-green-100 dark:bg-green-900';
    if (totalDue >= 35 && totalDue <= 40) return 'bg-orange-100 dark:bg-orange-900';
    if (totalDue > 40) return 'bg-red-100 dark:bg-red-900';
    return 'bg-white dark:bg-gray-800';
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

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) return <Loader />;

  const getStatusDisplay = (subscription: Subscription) => {
    if (editingStatusId === subscription.id) {
      return (
        <select
          value={subscription.status}
          onChange={(e) => handleStatusChange(subscription.id, e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white py-1.5 px-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200"
        >
          <option value="active">نشط</option>
          <option value="expired">منتهي</option>
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
          <span
            onClick={() => setEditingStatusId(subscription.id)}
            className="inline-block bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-md cursor-pointer hover:bg-red-600 transition-all duration-200 relative group dark:bg-red-600 dark:hover:bg-red-700"
          >
            منتهي
            <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 shadow-md">
              انقر لتغيير الحالة
            </span>
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
        <div className="overflow-x-auto" ref={tableRef}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
            انقر على الحالة لتغييرها بسهولة (نشط/منتهي/موقوف)
          </p>
          <table className="table-auto w-full bg-white dark:bg-gray-800 rounded-md shadow-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">رقم الاشتراك</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">عدد الفواتير</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">تاريخ الانتهاء</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">مجموع الفواتير</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">المجموع المستحق</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm">الحالة</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm">إرسال تنبيه</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr
                  key={subscription.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150`}
                >
                  <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                    <Link
                      to={`/subscribers/${subscription.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors duration-200"
                    >
                      {subscription.subscription_number}
                    </Link>
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
                  <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                    <p className={`${getRowColor(subscription.total_due)} px-3 py-1 rounded-full w-fit`}>
                      {formatAmount(subscription.total_due)}
                    </p>
                  </td>
                  <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                    {getStatusDisplay(subscription)}
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
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  );
};

export default Subscriptions;