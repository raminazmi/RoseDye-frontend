import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddInvoiceForm from '../Form/Invoices/AddInvoiceForm';
import EditInvoiceForm from '../Form/Invoices/EditInvoiceForm';
import Loader from '../../common/Loader';
import Pagination from '../../components/Pagination';

interface Invoice {
  id: number;
  invoice_number: string;
  date: string;
  amount: number;
  client: { subscription_number: string };
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, itemsPerPage]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.36rwrd.online/api/v1/invoices?page=${currentPage}&per_page=${itemsPerPage}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      if (data.status) {
        setInvoices(data.data);
        setTotalItems(data.total || 0);
      } else {
        toast.error(data.message || 'فشل في جلب TOOL بيانات الفواتير');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('حدث خطأ أثناء جلب بيانات الفواتير');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceAdded = () => {
    setCurrentPage(1);
    fetchInvoices();
    setIsAddModalOpen(false);
  };

  const handleInvoiceUpdated = () => {
    fetchInvoices();
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedInvoiceId === null) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`https://api.36rwrd.online/api/v1/invoices/${selectedInvoiceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.status) {
        toast.success('تم حذف الفاتورة بنجاح');
        fetchInvoices();
      } else {
        toast.error(data.message || 'حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedInvoiceId(null);
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 transition-all duration-300"
      ref={containerRef}
    >
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
        <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">قائمة الفواتير</h3>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200 shadow-md"
        >
          إضافة فاتورة
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
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">رقم الفاتورة</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">رقم الاشتراك</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">التاريخ</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">المبلغ</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150"
                    >
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                        {invoice.invoice_number}
                      </td>
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                        {invoice.client.subscription_number}
                      </td>
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200">
                        {formatAmount(invoice.amount)}  د.ك
                      </td>
                      <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-center flex justify-center items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoiceId(invoice.id);
                            setIsEditModalOpen(true);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 shadow-sm"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInvoiceId(invoice.id);
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
            <AddInvoiceForm onInvoiceAdded={handleInvoiceAdded} onClose={() => setIsAddModalOpen(false)} />
          </div>
        </div>
      )}

      {isEditModalOpen && selectedInvoiceId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 pt-20 sm:top-0 lg:right-72.5 backdrop-blur-sm flex justify-center items-center"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-lg sm:w-11/12 sm:max-w-md mx-4 shadow-xl overflow-y-auto max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <EditInvoiceForm
              invoiceId={selectedInvoiceId}
              onInvoiceUpdated={handleInvoiceUpdated}
              onClose={() => setIsEditModalOpen(false)}
            />
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedInvoiceId && (
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
                هل أنت متأكد أنك تريد حذف هذه الفاتورة؟
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

export default Invoices;