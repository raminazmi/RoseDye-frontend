import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../common/Loader';
import Pagination from '../../components/Pagination';
import axios from 'axios';

interface Subscription {
  id: number;
  subscription_number: string;
  invoices_count: number;
  end_date: string;
  total_due: number;
  client_phone: string;
}

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingStatus, setSendingStatus] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, [currentPage, itemsPerPage]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/v1/subscriptions?page=${currentPage}&per_page=${itemsPerPage}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status) {
        setSubscriptions(data.data);
        setTotalItems(data.total || 0);
      } else {
        toast.error(data.message || 'فشل في جلب البيانات');
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('حدث خطأ أثناء جلب بيانات الاشتراكات');
    } finally {
      setLoading(false);
    }
  };
  const exportPdf = async () => {
    setExportLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/subscriptions/export-pdf', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        responseType: 'blob', // مهم لمعالجة الملفات
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscriptions-report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      toast.success(`تمت عملية التصدير بنجاح`);
    } finally {
      setExportLoading(false);
    }
  };

  const sendNotification = async (subscriptionId: number) => {
    try {
      setSendingStatus((prev) => ({ ...prev, [subscriptionId]: true }));

      const subscription = subscriptions.find((sub) => sub.id === subscriptionId);
      const message = `تنبيه: اشتراكك رقم ${subscription?.subscription_number} على وشك الانتهاء بتاريخ ${subscription?.end_date}.`;

      const response = await fetch(`http://localhost:8000/api/v1/subscriptions/${subscriptionId}/notify`, {
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
      console.error('Error sending notification:', error);
      toast.error('حدث خطأ أثناء إرسال التنبيه');
    } finally {
      setSendingStatus((prev) => ({ ...prev, [subscriptionId]: false }));
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="rounded-sm border border-strokes bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick rtl pauseOnHover />
      <div className="py-6 px-4 flex justify-between md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">الاشتراكات</h4>
        <button onClick={exportPdf} disabled={exportLoading} className="bg-primary p-2 text-white rounded-lg py-2 px-4">
          {exportLoading ? 'جاري التصدير...' : 'تصدير PDF'}
        </button>
      </div>

      <div className="grid grid-cols-6 border-t border-strokes py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-3 flex items-center">
          <p className="font-medium">رقم الاشتراك</p>
        </div>
        <div className="col-span-2 hidden items-center sm:flex">
          <p className="font-medium">عدد الفواتير</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">تاريخ الانتهاء</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">المجموع المستحق</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">إرسال تنبيهات</p>
        </div>
      </div>

      {subscriptions.map((subscription) => (
        <div
          className="grid grid-cols-6 border-t border-strokes py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
          key={subscription.id}
        >
          <div className="col-span-3 flex items-center">
            <p className="text-sm text-primary cursor-pointer dark:text-white underline">
              {subscription.subscription_number}
            </p>
          </div>
          <div className="col-span-2 hidden items-center sm:flex">
            <p className="text-sm text-black dark:text-white">{subscription.invoices_count}</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="text-sm text-black dark:text-white">{subscription.end_date}</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="text-sm text-meta-3">{subscription.total_due} د.ك</p>
          </div>
          <div className="col-span-1 flex items-center">
            <button
              className={`relative text-sm bg-meta-3 text-white rounded-lg flex flex-row-reverse gap-4 ${sendingStatus[subscription.id] ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              onClick={() => sendNotification(subscription.id)}
              disabled={sendingStatus[subscription.id]}
            >
              {!sendingStatus[subscription.id] ? (
                <div className="py-2 px-6 flex flex-row-reverse gap-4">
                  <p>تنبيه</p>
                  <img src="/whatsapp-svgrepo-com.svg" alt="whatsapp" className="w-6 h-6" />
                </div>
              ) : (
                <span className="flex items-center gap-2 py-3 px-4">
                  <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                  <p className="text-xs">جاري الإرسال</p>
                </span>
              )}
            </button>
          </div>
        </div>
      ))}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Subscriptions;