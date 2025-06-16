import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../common/Loader';
import Pagination from '../../components/Pagination';

interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  status: string;
  due_date?: string;
}

interface SubscriptionDetails {
  id: number;
  plan_name: string;
  start_date: string;
  end_date: string;
  status: string;
  client: {
    id: number;
    name?: string;
    subscription_number: string;
    phone: string;
    current_balance: number;
  };
  invoices: Invoice[];
}

interface PaginationData {
  total: number;
  current_page: number;
  last_page: number;
}

const SubscriptionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, current_page: 1, last_page: 1 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (!token) {
          throw new Error('يرجى تسجيل الدخول أولاً');
        }

        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        const clientId = localStorage.getItem('client_id');

        if (!clientId && user?.role !== 'admin') {
          throw new Error('لا يوجد معرف عميل مرتبط');
        }

        const response = await fetch(`https://api.36rwrd.online/api/v1/subscriptions/${id}?page=${currentPage}&per_page=${itemsPerPage}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON Response:', text);
          throw new Error('استجابة الخادم غير صالحة');
        }

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('access_token');
            sessionStorage.removeItem('access_token');
            localStorage.removeItem('client_id');
            localStorage.removeItem('user');
            navigate('/login');
            throw new Error('انتهت جلسة تسجيل الدخول، يرجى تسجيل الدخول مجددًا');
          } else if (response.status === 403) {
            navigate('/');
            throw new Error(data.message || 'غير مصرح لك بالوصول إلى هذا الاشتراك');
          } else if (response.status === 404) {
            throw new Error('الاشتراك غير موجود');
          }
          throw new Error(data.message || `خطأ في الشبكة: ${response.status}`);
        }

        if (!data.status) {
          throw new Error(data.message || 'فشل في جلب البيانات');
        }

        const subscriptionData = {
          ...data.data.subscription,
          client: {
            ...data.data.subscription.client,
            current_balance: Number(data.data.subscription.client.current_balance),
            name: data.data.subscription.client.name || 'غير محدد',
          },
        };

        setSubscription(subscriptionData);
        setPagination(data.data.pagination || { total: 0, current_page: 1, last_page: 1 });
      } catch (error) {
        console.error('Fetch Error:', error);
        setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
        toast.error(error instanceof Error ? error.message : 'فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentPage, itemsPerPage, navigate]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <p>حدث خطأ: {error}</p>
      </div>
    );
  }

  if (!subscription) {
    return <div className="text-center p-8">لا توجد بيانات متاحة</div>;
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return {
          text: 'نشط',
          className: 'bg-green-600 text-white rounded-lg py-2 px-4',
        };
      case 'expired':
        return {
          text: 'منتهي',
          className: 'bg-red-600 text-white rounded-lg py-2 px-4',
        };
      case 'canceled':
        return {
          text: 'موقوف',
          className: 'bg-gray-600 text-white rounded-lg py-2 px-4',
        };
      default:
        return {
          text: 'غير معروف',
          className: 'bg-gray-400 text-white rounded-lg py-2 px-4',
        };
    }
  };

  const statusStyles = getStatusStyles(subscription.status);
  const formatBalance = (balance: number) => {
    return balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <ToastContainer />
      <div className="py-6 px-4 flex flex-col md:flex-row justify-between items-center md:px-6 xl:px-7.5 gap-2">
        <h4 className="text-xl font-semibold text-black dark:text-white mb-4 md:mb-0">
          رقم الاشتراك: {subscription.client.subscription_number}
        </h4>
        <div className="flex gap-4 flex-wrap justify-center items-center">
          <button className="bg-primary text-white rounded-lg py-2 px-4 w-full xsm:w-fit">
            الرصيد الحالي: {formatBalance(subscription.client.current_balance)} دينار
          </button>
          <button className="bg-green-600 text-white rounded-lg py-2 px-4 w-full xsm:w-fit">
            ينتهي في: {new Date(subscription.end_date).toLocaleDateString('en-US')}
          </button>
          <button className={`${statusStyles.className} w-full xsm:w-fit`}>
            حالة الاشتراك: {statusStyles.text}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-3">
          <p className="font-medium">رقم الفاتورة</p>
        </div>
        <div className="col-span-1">
          <p className="font-medium">المبلغ</p>
        </div>
      </div>

      {subscription.invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
        >
          <div className="col-span-3">
            <p className="text-sm dark:text-white">{invoice.invoice_number}</p>
          </div>
          <div className="col-span-1">
            <p className="text-sm">{formatBalance(invoice.amount)} د.ك</p>
          </div>
        </div>
      ))}

      <Pagination
        currentPage={currentPage}
        totalPages={pagination.last_page}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default SubscriptionDetailsPage;