import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddClientForm from '../Form/Clients/AddClientForm';
import EditClientForm from '../Form/Clients/EditClientForm';
import Loader from '../../common/Loader';
import Pagination from '../../components/Pagination';

export interface Subscription {
  id: number;
  client_id: number;
  plan_name: string;
  price: number;
  start_date: string;
  end_date: string;
  duration_in_days: number;
  status: string;
}

export interface Client {
  id: number;
  phone: string;
  current_balance: number;
  renewal_balance: number;
  subscription_number: string;
  additional_gift: number;
  original_gift: number;
  subscriptions: Subscription[];
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClients();
  }, [currentPage, itemsPerPage]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        return;
      }
      setLoading(true);
      const response = await fetch(`https://api.36rwrd.online/api/v1/clients?page=${currentPage}&per_page=${itemsPerPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.status) {
        setClients(data.data);
        setTotalItems(data.total || 0);
      } else {
        toast.error(data.message || 'فشل في جلب بيانات العملاء');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('حدث خطأ أثناء جلب بيانات العملاء');
    } finally {
      setLoading(false);
    }
  };

  const handleClientAdded = () => {
    setCurrentPage(1);
    fetchClients();
    setIsAddModalOpen(false);
  };

  const handleClientUpdated = () => {
    fetchClients();
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedClientId === null) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch(`https://api.36rwrd.online/api/v1/clients/${selectedClientId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.status) {
        toast.success('تم حذف العميل بنجاح');
        fetchClients();
      } else {
        toast.error(data.message || 'حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedClientId(null);
    }
  };

  const getModalPosition = () => {
    if (tableRef.current) {
      const tableRect = tableRef.current.getBoundingClientRect();
      const modalWidth = 512;
      const modalHeight = 600;

      const left = tableRect.left + (tableRect.width - modalWidth) / 2;
      const top = tableRect.top + (tableRect.height - modalHeight) / 2;

      return {
        left: `${left}px`,
        top: `${top}px`,
        width: `${modalWidth}px`,
      };
    }
    return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
        <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">قائمة العملاء</h3>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200 shadow-md"
        >
          إضافة عميل
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="overflow-x-auto" ref={tableRef}>
              <table className="table-auto w-full bg-white dark:bg-gray-800 rounded-md shadow-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">رقم الاشتراك</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">الهاتف</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">تاريخ البداية</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">تاريخ النهاية</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">عدد الأيام</th> {/* عمود جديد */}
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">الرصيد الحالي</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">رصيد التجديد</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150"
                    >
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                        {client.subscription_number}
                      </td>
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                        {client.phone}
                      </td>
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                        {client.subscriptions[0]?.start_date || '-'}
                      </td>
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                        {client.subscriptions[0]?.end_date || '-'}
                      </td>
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                        {(client.subscriptions[0]?.duration_in_days - 1) || '-'} يوم
                      </td>
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                        <span className={client.current_balance < 0 ? 'text-red-500' : ''}>
                          {client.current_balance.toLocaleString()} د.ك
                        </span>
                      </td>
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                        {client.renewal_balance.toLocaleString()} د.ك
                        {client.additional_gift > 0 ? ` + ${client.additional_gift.toLocaleString()} هدية` : ''}
                      </td>
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-center flex justify-center items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setIsEditModalOpen(true);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 shadow-sm"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all duration-200 shadow-sm"
                        >
                          حذف
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
          </>
        )}
      </div>

      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 pt-20 sm:top-0 lg:right-72.5 backdrop-blur-sm flex justify-center items-center"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-lg sm:w-11/12 sm:max-w-md mx-4 shadow-xl overflow-y-auto max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <AddClientForm onClientAdded={handleClientAdded} onClose={() => setIsAddModalOpen(false)} />
          </div>
        </div>
      )}

      {isEditModalOpen && selectedClientId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 pt-20 sm:top-0 lg:right-72.5 backdrop-blur-sm flex justify-center items-center"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-lg sm:w-11/12 sm:max-w-md mx-4 shadow-xl overflow-y-auto max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <EditClientForm
              client={clients.find((c) => c.id === selectedClientId)!}
              onClientUpdated={handleClientUpdated}
              onClose={() => setIsEditModalOpen(false)}
            />
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedClientId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 pt-20 sm:top-0 lg:right-72.5 backdrop-blur-sm flex justify-center items-center"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-sm sm:w-11/12 sm:max-w-md mx-4 shadow-xl overflow-y-auto max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-4">
                هل أنت متأكد أنك تريد حذف هذا العميل؟
              </h3>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleDeleteConfirm}
                  className={`relative flex w-full sm:w-auto justify-center rounded bg-red-600 p-3 font-medium text-white ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isDeleting}
                >
                  {!isDeleting ? (
                    <span className="">نعم، حذف</span>
                  ) : (
                    <span className="flex items-center gap-2 py-1">
                      <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                      <p className="text-xs">جاري الحذف</p>
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex w-full sm:w-auto justify-center rounded bg-gray-500 p-3 font-medium text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm mt-2 sm:mt-0"
                >
                  <span className="">لا، إلغاء</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;