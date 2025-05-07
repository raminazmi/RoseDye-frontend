import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import Loader from '../../common/Loader';

interface ChartOneState {
  series: {
    name: string;
    data: number[];
  }[];
}

const ChartOne: React.FC = () => {
  const [options, setOptions] = useState<ApexOptions>({
    legend: {
      show: false,
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#3C50E0', '#80CAEE'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 335,
      type: 'area',
      dropShadow: {
        enabled: true,
        color: '#623CEA14',
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: 'straight',
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: '#fff',
      strokeColors: ['#3056D3', '#80CAEE'],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: 'category',
      categories: [],
      labels: {
        style: {
          fontFamily: 'Satoshi, sans-serif',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: '0px',
        },
      },
      min: 0,
      max: undefined,
    },
  });

  const [series, setSeries] = useState<ChartOneState['series']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('month');
  const [dateRange, setDateRange] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('لم يتم العثور على رمز الوصول. الرجاء تسجيل الدخول.');
        }

        let endpoint = '';
        switch (timeFrame) {
          case 'day':
            endpoint = 'daily';
            break;
          case 'week':
            endpoint = 'weekly';
            break;
          case 'month':
            endpoint = 'monthly';
            break;
          default:
            endpoint = 'monthly';
        }

        const response = await fetch(`https://api.36rwrd.online/api/v1/statistics/${endpoint}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const responseText = await response.text();
          console.log('Raw Response:', responseText);
          throw new Error(`خطأ في الاتصال: ${response.status} - ${responseText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          throw new Error(`الاستجابة ليست JSON: ${responseText}`);
        }

        const data = await response.json();
        console.log(`${timeFrame} Data:`, data);

        if (!data || !data.revenue || !data.invoices) {
          throw new Error('البيانات المُرجعة غير كاملة أو غير صالحة');
        }

        let categories: string[] = [];
        let dateStart: string = '';
        let dateEnd: string = '';
        const today = new Date();
        const formatDate = (date: Date) => date.toLocaleDateString('ar', { day: '2-digit', month: '2-digit', year: 'numeric' });

        if (timeFrame === 'day') {
          categories = data.hours || Array.from({ length: 24 }, (_, i) => `${i}:00`);
          dateStart = formatDate(today);
          dateEnd = dateStart;
        } else if (timeFrame === 'week') {
          categories = data.days || ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay() + 1);
          dateStart = formatDate(startOfWeek);
          dateEnd = formatDate(new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000));
        } else if (timeFrame === 'month') {
          categories = data.months || [];
          const startOfYear = new Date(today.getFullYear(), 0, 1); // بداية السنة الحالية
          dateStart = formatDate(startOfYear);
          dateEnd = formatDate(new Date(today.getFullYear(), 11, 31)); // نهاية السنة الحالية
        }

        setDateRange(`${dateStart} - ${dateEnd}`);

        const revenueNumbers = data.revenue.map((num: any) => Number(num) || 0);
        const invoicesNumbers = data.invoices.map((num: any) => Number(num) || 0);
        const maxValue = Math.max(...revenueNumbers, ...invoicesNumbers) * 1.1 || 100;

        setOptions((prev) => ({
          ...prev,
          xaxis: {
            ...prev.xaxis,
            categories: categories,
          },
          yaxis: {
            ...prev.yaxis,
            max: maxValue,
          },
        }));

        setSeries([
          { name: 'مجموع الأرباح', data: revenueNumbers },
          { name: 'مجموع الفواتير', data: invoicesNumbers },
        ]);

        console.log('Series Updated:', [
          { name: 'مجموع الأرباح', data: revenueNumbers },
          { name: 'مجموع الفواتير', data: invoicesNumbers },
        ]);
      } catch (error) {
        console.error(`Error fetching ${timeFrame} data:`, error);
        setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFrame]);

  const handleTimeFrameChange = (frame: 'day' | 'week' | 'month') => {
    setTimeFrame(frame);
  };

  if (error) {
    return <div className="text-center text-red-500 p-8">حدث خطأ: {error}</div>;
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">مجموع الأرباح</p>
            </div>
          </div>
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-secondary">مجموع الفواتير</p>
            </div>
          </div>
          <p className="text-sm font-medium">{dateRange}</p>
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center gap-2 rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button
              onClick={() => handleTimeFrameChange('day')}
              className={`rounded py-1 px-3 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${timeFrame === 'day' ? 'bg-white dark:bg-boxdark' : ''}`}
            >
              اليوم
            </button>
            <button
              onClick={() => handleTimeFrameChange('week')}
              className={`rounded py-1 px-3 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${timeFrame === 'week' ? 'bg-white dark:bg-boxdark' : ''}`}
            >
              الأسبوع
            </button>
            <button
              onClick={() => handleTimeFrameChange('month')}
              className={`rounded py-1 px-3 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${timeFrame === 'month' ? 'bg-white dark:bg-boxdark' : ''}`}
            >
              الشهر
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div>
          <div id="chartOne" className="-ml-5">
            <ReactApexChart options={options} series={series} type="area" height={350} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOne;