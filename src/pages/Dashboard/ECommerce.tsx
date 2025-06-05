import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaFileInvoice, FaUsers } from 'react-icons/fa';
import CardDataStats from '../../components/CardDataStats';
import ChartOne from '../../components/Charts/ChartOne';
import ChartTwo from '../../components/Charts/ChartTwo';
import Loader from '../../common/Loader';

interface Statistics {
  total_clients: number;
  total_revenue: number;
  total_invoices: number;
  recent_clients: any[];
  upcoming_renewals: any[];
  clients_rate: string;
  subscriptions_rate: string;
  revenue_rate: string;
  total_invoices_rate: string;
  active_subscriptions: number;
  expired_subscriptions: number;
  canceled_subscriptions: number;
}

const ECommerce: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('لم يتم العثور على رمز الوصول');
        }

        const response = await fetch('https://36rwrd.online/api/v1/statistics', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`خطأ في الاتصال: ${response.status} - ${errorData.message || 'غير معروف'}`);
        }

        const data = await response.json();

        const formattedData = {
          ...data,
          total_revenue: Number(data.total_revenue),
        };

        setStatistics(formattedData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-8">حدث خطأ: {error}</div>;
  if (!statistics) return <div className="text-center p-8">لا توجد بيانات متاحة</div>;

  const expectedRevenue = 100;
  const expectedInvoices = 100;
  const expectedSubscriptions = 100;

  const revenueRate = ((statistics.total_revenue / expectedRevenue) * 100).toFixed(2);
  const totalInvoicesRate = statistics.total_invoices_rate;
  const subscriptionsRate = ((statistics.active_subscriptions / expectedSubscriptions) * 100).toFixed(2);

  const revenueUp = statistics.total_revenue > expectedRevenue;
  const totalInvoicesUp = parseFloat(statistics.total_invoices_rate) > 0;
  const subscriptionsUp = statistics.active_subscriptions > expectedSubscriptions;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="قيمة الفواتير"
          total={`${statistics.total_revenue.toFixed(3)} د.ك`}
          rate={``}
        >
          <FaMoneyBillWave className="fill-primary dark:fill-white w-6 h-6" />
        </CardDataStats>

        <CardDataStats
          title="إجمالي الفواتير"
          total={`${statistics.total_invoices}`}
          rate={``}
        >
          <FaFileInvoice className="fill-primary dark:fill-white w-6 h-6" />
        </CardDataStats>

        <CardDataStats
          title="عدد المشتركين"
          total={statistics.active_subscriptions.toString()}
          rate={``}
        >
          <FaUsers className="fill-primary dark:fill-white w-6 h-6" />
        </CardDataStats>

        <CardDataStats
          title="المشتركين الفعالين"
          total={statistics.active_subscriptions.toString()}
          rate=""
          levelUp={false}
        >
          <FaUsers className="fill-primary dark:fill-white w-6 h-6" />
        </CardDataStats>

        <CardDataStats
          title="المشتركين المنتهيين"
          total={statistics.expired_subscriptions.toString()}
          rate=""
          levelUp={false}
        >
          <FaUsers className="fill-primary dark:fill-white w-6 h-6" />
        </CardDataStats>

        <CardDataStats
          title="المشتركين الموقوفين"
          total={statistics.canceled_subscriptions.toString()}
          rate=""
          levelUp={false}
        >
          <FaUsers className="fill-primary dark:fill-white w-6 h-6" />
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne />
        <ChartTwo />
      </div>
    </>
  );
};

export default ECommerce;