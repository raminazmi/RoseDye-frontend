import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../common/Loader';
import Pagination from '../../components/Pagination';
import * as XLSX from 'xlsx';

interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string;
}

interface SubscriptionDetails {
  id: number;
  plan_name: string;
  start_date: string;
  end_date: string;
  status: string;
  client: {
    id: number;
    name: string;
    subscription_number: string;
    phone: string;
    current_balance: number | string;
    renewal_balance?: number;
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
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, current_page: 1, last_page: 1 });

  useEffect(() => {
    fetchData();
  }, [id, currentPage, itemsPerPage]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('لم يتم العثور على رمز الوصول');

      const response = await fetch(`https://rosedye-backend-production.up.railway.app/api/v1/subscriptions/${id}?page=${currentPage}&per_page=${itemsPerPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`خطأ في الشبكة: ${response.status} - ${errorData.message || 'غير معروف'}`);
      }

      const data = await response.json();
      if (!data.status) throw new Error(data.message || 'فشل في جلب البيانات');

      const subscriptionData = {
        ...data.data.subscription,
        client: {
          ...data.data.subscription.client,
          current_balance: Number(data.data.subscription.client.current_balance),
        },
      };

      setSubscription(subscriptionData);
      setPagination(data.data.pagination || { total: 0, current_page: 1, last_page: 1 });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
      toast.error(error instanceof Error ? error.message : 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!subscription) return;

    const data = subscription.invoices.map(invoice => ({
      'رقم الفاتورة': invoice.invoice_number,
      'المبلغ (د.ك)': invoice.amount.toFixed(2),
    }));

    data.push({
      'رقم الفاتورة': 'المجموع',
      'المبلغ (د.ك)': subscription.invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2),
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'فواتير العميل');
    XLSX.writeFile(wb, `فواتير_${subscription.client.subscription_number}.xlsx`);
    toast.success('تم تصدير Excel بنجاح');
  };

  const getTotalColor = (total: number) => {
    if (total <= 30) return 'text-green-500';
    if (total <= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-8">حدث خطأ: {error}</div>;
  if (!subscription) return <div className="text-center p-8">لا توجد بيانات متاحة</div>;

  const totalAmount = subscription.invoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <ToastContainer />
      <div className="py-6 px-4 flex flex-col md:flex-row justify-between items-center md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white mb-4 md:mb-0">
          رقم الاشتراك: {subscription.client.subscription_number}
        </h4>
        <div className="flex gap-4">
          <button className={`bg-primary text-white rounded-lg py-2 px-4 ${getTotalColor(Number(subscription.client.current_balance))}`}>
            الرصيد الحالي: {Number(subscription.client.current_balance).toFixed(2)} د.ك
          </button>
          <button className="bg-green-600 text-white rounded-lg py-2 px-4">
            ينتهي في: {new Date(subscription.end_date).toLocaleDateString('ar-EG')}
          </button>
          <button
            onClick={exportToExcel}
            className="bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700"
          >
            تصدير Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-3"><p className="font-medium">رقم الفاتورة</p></div>
        <div className="col-span-1"><p className="font-medium">المبلغ</p></div>
        <div className="col-span-1"><p className="font-medium">الحالة</p></div>
        <div className="col-span-1"><p className="font-medium">تاريخ الاستحقاق</p></div>
      </div>

      {subscription.invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
        >
          <div className="col-span-3"><p className="text-sm dark:text-white">{invoice.invoice_number}</p></div>
          <div className="col-span-1"><p className="text-sm">{Number(invoice.amount).toFixed(2)} د.ك</p></div>
          <div className="col-span-1"><p className={`text-sm ${invoice.status === 'paid' ? 'text-meta-3' : 'text-meta-7'}`}>{invoice.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}</p></div>
          <div className="col-span-1"><p className="text-sm">{new Date(invoice.due_date).toLocaleDateString('ar-EG')}</p></div>
        </div>
      ))}

      <div className="py-4 px-4 md:px-6 2xl:px-7.5 flex justify-between items-center">
        <p className={`font-medium ${getTotalColor(totalAmount)}`}>المجموع: {totalAmount.toFixed(2)} د.ك</p>
        <p className="font-medium">عدد الفواتير: {subscription.invoices.length}</p>
      </div>

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