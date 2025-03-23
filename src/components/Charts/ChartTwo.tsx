import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import Loader from '../../common/Loader';

interface ChartTwoState {
  series: {
    name: string;
    data: number[];
  }[];
}

const ChartTwo: React.FC = () => {
  const [options, setOptions] = useState<ApexOptions>({
    colors: ['#3C50E0', '#80CAEE'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      type: 'bar',
      height: 335,
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: '25%',
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0,
        columnWidth: '25%',
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'category',
      categories: [],
      labels: {
        style: {
          fontFamily: 'Satoshi, sans-serif',
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Satoshi',
      fontWeight: 500,
      fontSize: '14px',
      markers: {
        radius: 99,
      },
    },
    fill: {
      opacity: 1,
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

  const [series, setSeries] = useState<ChartTwoState['series']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<'this_week' | 'last_week'>('this_week');
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

        let endpoint = 'lastweek';
        const params = new URLSearchParams();
        if (timeFrame === 'last_week') {
          params.append('last_week', 'true');
        }

        const response = await fetch(`http://localhost:8000/api/v1/statistics/${endpoint}?${params.toString()}`, {
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

        const data = await response.json();
        console.log(`${timeFrame} Data:`, data);

        const apiData = data.data || data;
        const revenueData = apiData.revenue || apiData.income || [];
        const subscriptionsData = apiData.subscriptions || apiData.subscribers || [];

        if (!revenueData.length || !subscriptionsData.length) {
          console.warn('البيانات فارغة، يتم استخدام قيم افتراضية');
        }

        const categories = apiData.days || ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
        const today = new Date();
        const formatDate = (date: Date) => date.toLocaleDateString('ar', { day: '2-digit', month: '2-digit', year: 'numeric' });

        let dateStart: string = '';
        let dateEnd: string = '';
        if (timeFrame === 'this_week') {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay() + 1);
          dateStart = formatDate(startOfWeek);
          dateEnd = formatDate(new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000));
        } else if (timeFrame === 'last_week') {
          const startOfLastWeek = new Date(today);
          startOfLastWeek.setDate(today.getDate() - today.getDay() - 6);
          dateStart = formatDate(startOfLastWeek);
          dateEnd = formatDate(new Date(startOfLastWeek.getTime() + 6 * 24 * 60 * 60 * 1000));
        }

        setDateRange(`${dateStart} - ${dateEnd}`);

        const revenueNumbers = revenueData.length ? revenueData.map((num: any) => Number(num.toFixed(2)) || 0) : Array(7).fill(0);
        const subscriptionsNumbers = subscriptionsData.length ? subscriptionsData.map((num: any) => Number(num) || 0) : Array(7).fill(0);
        const maxValue = Math.max(...revenueNumbers, ...subscriptionsNumbers) * 1.1 || 100;

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
          { name: 'الأرباح', data: revenueNumbers },
          { name: 'المشتركين', data: subscriptionsNumbers },
        ]);

        console.log('Series Updated:', [
          { name: 'الأرباح', data: revenueNumbers },
          { name: 'المشتركين', data: subscriptionsNumbers },
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

  const handleTimeFrameChange = (frame: 'this_week' | 'last_week') => {
    setTimeFrame(frame);
  };

  if (error) {
    return <div className="text-center text-red-500 p-8">حدث خطأ: {error}</div>;
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4 flex-col justify-center items-center gap-4">
        <div className="flex mb-3 items-center justify-center rounded-md gap-2 bg-whiter p-1.5 dark:bg-meta-4">
          <button
            onClick={() => handleTimeFrameChange('this_week')}
            className={`rounded py-1 px-3 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${timeFrame === 'this_week' ? 'bg-white dark:bg-boxdark' : ''}`}
          >
            هذا الأسبوع
          </button>
          <button
            onClick={() => handleTimeFrameChange('last_week')}
            className={`rounded py-1 px-3 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${timeFrame === 'last_week' ? 'bg-white dark:bg-boxdark' : ''}`}
          >
            الأسبوع الماضي
          </button>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <p className="text-sm font-medium">{dateRange}</p>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div>
          <div id="chartTwo" className="-ml-5 -mb-9">
            <ReactApexChart options={options} series={series} type="bar" height={350} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartTwo;