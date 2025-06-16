import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../common/Loader';
import Pagination from '../../components/Pagination';
import { useNavigate } from 'react-router-dom';
import AddSubscriptionNumberForm from '../Form/AddSubscriptionNumberForm';
import EditSubscriptionNumberForm from '../Form/EditSubscriptionNumberForm';
import { FiEdit, FiRefreshCw, FiTrash2 } from 'react-icons/fi';

interface ClientOption {
    value: number;
    label: string;
}

interface SubscriptionNumber {
    id: number;
    number: string;
    is_available: boolean;
    client?: {
        id: number;
        phone: string;
    };
}

const SubscriptionNumbers: React.FC = () => {
    const [subscriptionNumbers, setSubscriptionNumbers] = useState<SubscriptionNumber[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingStatus, setTogglingStatus] = useState<{ [key: number]: boolean }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false); // حالة جديدة لنافذة تأكيد الإتاحة
    const [selectedSubscriptionNumberId, setSelectedSubscriptionNumberId] = useState<number | null>(null);
    const [selectedToggleSubscriptionNumberId, setSelectedToggleSubscriptionNumberId] = useState<number | null>(null); // حالة جديدة لمعرف رقم الاشتراك
    const [selectedSubscriptionNumber, setSelectedSubscriptionNumber] = useState<SubscriptionNumber | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [clientsOptions, setClientsOptions] = useState<ClientOption[]>([]);
    const [selectedClientForEdit, setSelectedClientForEdit] = useState<ClientOption | null>(null);
    const [isUpdatingClient, setIsUpdatingClient] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubscriptionNumbers();
        fetchClientsForDropdown();
    }, [currentPage, itemsPerPage]);

    const fetchClientsForDropdown = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('يرجى تسجيل الدخول أولاً');
                navigate('/login');
                return;
            }

            const response = await fetch(`https://api.36rwrd.online/api/v1/clients?page=${currentPage}&per_page=${itemsPerPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.status) {
                const options = data.data.map((client: any) => ({
                    value: client.id,
                    label: `${client.phone}`
                }));
                setClientsOptions(options);
            } else {
                toast.error(data.message || 'فشل في جلب بيانات العملاء');
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error('حدث خطأ أثناء جلب العملاء.');
        }
    };

    const fetchSubscriptionNumbers = async () => {
        try {
            setLoading(true);
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                toast.error('يرجى تسجيل الدخول أولاً');
                navigate('/login');
                return;
            }

            const response = await fetch(`https://api.36rwrd.online/api/v1/clients/subscription-numbers?page=${currentPage}&per_page=${itemsPerPage}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('انتهت جلسة تسجيل الدخول، يرجى تسجيل الدخول مجددًا');
                    navigate('/login');
                } else {
                    const text = await response.text();
                    console.error('Non-JSON response:', text);
                    toast.error(`خطأ في جلب أرقام الاشتراك (HTTP ${response.status})`);
                }
                return;
            }

            const data = await response.json();
            if (data.status) {
                setSubscriptionNumbers(data.data);
                setTotalItems(data.total || 0);
            } else {
                toast.error(data.message || 'فشل في جلب أرقام الاشتراك');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error(`خطأ في جلب أرقام الاشتراك: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => setIsAddModalOpen(true);

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        fetchSubscriptionNumbers();
    };

    const openEditModal = (subNumber: SubscriptionNumber) => {
        setSelectedSubscriptionNumber(subNumber);
        setSelectedClientForEdit(subNumber.client ? { value: subNumber.client.id, label: `${subNumber.client.phone}` } : null);
        setIsEditModalOpen(true);
    };

    const handleClientChange = (selectedOption: ClientOption | null) => {
        setSelectedClientForEdit(selectedOption);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedSubscriptionNumber(null);
        fetchSubscriptionNumbers();
    };

    const openDeleteModal = (id: number) => {
        setSelectedSubscriptionNumberId(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedSubscriptionNumberId(null);
    };

    const openToggleModal = (id: number) => {
        setSelectedToggleSubscriptionNumberId(id);
        setIsToggleModalOpen(true);
    };

    const closeToggleModal = () => {
        setIsToggleModalOpen(false);
        setSelectedToggleSubscriptionNumberId(null);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedSubscriptionNumberId) return;

        setIsDeleting(true);
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch(
                `https://api.36rwrd.online/api/v1/subscription-numbers/${selectedSubscriptionNumberId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete subscription number');
            }

            toast.success('تم حذف رقم الاشتراك بنجاح');
            fetchSubscriptionNumbers();
            closeDeleteModal();
        } catch (error: any) {
            console.error('Error deleting subscription number:', error);
            toast.error(error.message || 'فشل حذف رقم الاشتراك');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleConfirm = async () => {
        if (!selectedToggleSubscriptionNumberId) return;

        try {
            setTogglingStatus((prev) => ({ ...prev, [selectedToggleSubscriptionNumberId]: true }));
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                toast.error('يرجى تسجيل الدخول أولاً');
                navigate('/login');
                return;
            }
            const response = await fetch(
                `https://api.36rwrd.online/api/v1/clients/subscription-numbers/${selectedToggleSubscriptionNumberId}/toggle-availability`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );

            const data = await response.json();
            if (response.ok && data.status) {
                toast.success(data.message || 'تم تغيير حالة توفر رقم الاشتراك بنجاح');
                fetchSubscriptionNumbers();
                closeToggleModal();
            } else {
                if (response.status === 404) {
                    toast.error('رقم الاشتراك غير موجود');
                } else if (response.status === 401) {
                    toast.error('انتهت جلسة تسجيل الدخول، يرجى تسجيل الدخول مجددًا');
                    navigate('/login');
                } else {
                    toast.error(data.message || 'فشل في تغيير حالة التوفر');
                }
            }
        } catch (error) {
            console.error('Toggle error:', error);
            toast.error('حدث خطأ أثناء تغيير حالة التوفر');
        } finally {
            setTogglingStatus((prev) => ({ ...prev, [selectedToggleSubscriptionNumberId]: false }));
            closeToggleModal();
        }
    };

    const toggleAvailability = (subscriptionNumberId: number) => {
        openToggleModal(subscriptionNumberId); // فتح نافذة التأكيد بدلاً من تنفيذ الطلب مباشرة
    };

    const handleUpdateClientForSubscriptionNumber = async () => {
        if (!selectedSubscriptionNumber) return;

        setIsUpdatingClient(true);
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                toast.error('يرجى تسجيل الدخول أولاً');
                navigate('/login');
                return;
            }

            const payload = {
                client_id: selectedClientForEdit ? selectedClientForEdit.value : null,
            };

            const response = await fetch(
                `https://api.36rwrd.online/api/v1/subscription-numbers/${selectedSubscriptionNumber.id}/assign-client`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );
            const data = await response.json();

            if (data.status) {
                toast.success(data.message);
                setIsEditModalOpen(false);
                fetchSubscriptionNumbers();
                fetchClientsForDropdown();
            } else {
                toast.error(data.message || 'فشل في تحديث العميل لرقم الاشتراك');
            }
        } catch (error) {
            console.error('Error updating client for subscription number:', error);
            toast.error('حدث خطأ أثناء تحديث العميل لرقم الاشتراك.');
        } finally {
            setIsUpdatingClient(false);
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
                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">إدارة أرقام الاشتراك</h3>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-4"
                >
                    إضافة أرقام اشتراكات جديدة
                </button>
            </div>

            <div className="p-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    هنا يمكنك إدارة أرقام الاشتراك وتغيير حالة توفرها.
                </p>
                <div className="overflow-x-auto">
                    <table className="table-auto w-full bg-white dark:bg-gray-800 rounded-md shadow-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">رقم الاشتراك</th>
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">الحالة</th>
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-start">العميل</th>
                                <th className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold text-sm text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptionNumbers.map((subNumber) => (
                                <tr
                                    key={subNumber.id}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 even:bg-gray-50 dark:even:bg-gray-800 group"
                                    role="row"
                                >
                                    <td
                                        className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200 text-sm font-medium truncate max-w-[150px]"
                                        title={subNumber.number}
                                    >
                                        {subNumber.number}
                                    </td>
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`w-2.5 h-2.5 rounded-full ${subNumber.is_available ? 'bg-green-500' : 'bg-red-500'}`}
                                                aria-hidden="true"
                                            ></span>
                                            <span
                                                className={`text-sm font-medium ${subNumber.is_available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                            >
                                                {subNumber.is_available ? 'متاح' : 'غير متاح'}
                                            </span>
                                        </div>
                                    </td>
                                    <td
                                        className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-800 dark:text-gray-200 text-sm truncate max-w-[200px]"
                                        title={subNumber.client ? subNumber.client.phone : 'غير مسجل بعد'}
                                    >
                                        {subNumber.client ? subNumber.client.phone : (
                                            <span className="text-gray-500 dark:text-gray-400 italic">غير مسجل بعد</span>
                                        )}
                                    </td>
                                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                                        <div className="flex justify-center items-center gap-3 sm:gap-4">
                                            <button
                                                className="relative group/edit text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-150"
                                                onClick={() => openEditModal(subNumber)}
                                                title="تعديل"
                                                aria-label={`تعديل رقم الاشتراك ${subNumber.number}`}
                                            >
                                                <FiEdit className="w-5 h-5" />
                                                <span className="absolute hidden group-hover/edit:block -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                                                    تعديل
                                                </span>
                                            </button>

                                            <button
                                                className={`relative group/toggle text-gray-500 ${togglingStatus[subNumber.id] ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600 dark:hover:text-blue-400'} transition-colors duration-150`}
                                                onClick={() => toggleAvailability(subNumber.id)}
                                                title={subNumber.is_available ? 'جعله غير متاح' : 'جعله متاح'}
                                                aria-label={`تبديل توفر رقم الاشتراك ${subNumber.number}`}
                                                disabled={togglingStatus[subNumber.id]}
                                            >
                                                {togglingStatus[subNumber.id] ? (
                                                    <span className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full inline-block"></span>
                                                ) : (
                                                    <FiRefreshCw className="w-5 h-5" />
                                                )}
                                                <span className="absolute hidden group-hover/toggle:block -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                                                    {subNumber.is_available ? 'جعله غير متاح' : 'جعله متاح'}
                                                </span>
                                            </button>

                                            <button
                                                className="relative group/delete text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                                                onClick={() => openDeleteModal(subNumber.id)}
                                                title="حذف"
                                                aria-label={`حذف رقم الاشتراك ${subNumber.number}`}
                                            >
                                                <FiTrash2 className="w-5 h-5" />
                                                <span className="absolute hidden group-hover/delete:block -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                                                    حذف
                                                </span>
                                            </button>
                                        </div>
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

            {isAddModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 z-50 pt-20 sm:top-0 lg:right-72.5 backdrop-blur-sm flex justify-center items-center"
                    onClick={() => setIsAddModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-lg sm:w-11/12 sm:max-w-md mx-4 shadow-xl overflow-y-auto max-h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AddSubscriptionNumberForm onSubscriptionNumbersAdded={closeAddModal} onClose={() => setIsAddModalOpen(false)} />
                    </div>
                </div>
            )}

            {isEditModalOpen && selectedSubscriptionNumber && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 z-50 pt-20 sm:top-0 lg:right-72.5 backdrop-blur-sm flex justify-center items-center"
                    onClick={() => setIsEditModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-lg sm:w-11/12 sm:max-w-md mx-4 shadow-xl overflow-y-auto max-h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <EditSubscriptionNumberForm
                            clientsOptions={clientsOptions}
                            selectedClientForEdit={selectedClientForEdit}
                            handleClientChange={handleClientChange}
                            subscriptionNumber={selectedSubscriptionNumber}
                            onSubscriptionNumberUpdated={closeEditModal}
                            onClose={() => setIsEditModalOpen(false)}
                        />
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
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

            {isToggleModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 z-50 pt-20 sm:top-0 lg:right-72.5 backdrop-blur-sm flex justify-center items-center"
                    onClick={closeToggleModal}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-sm sm:w-11/12 sm:max-w-md mx-4 shadow-xl overflow-y-auto max-h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-4">
                                تأكيد تغيير حالة الإتاحة
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                تغيير حالة الإتاحة سيؤدي إلى إلغاء ربط رقم الاشتراك بالعميل الحالي ، وسيصبح العميل بدون رقم اشتراك. هل أنت متأكد؟
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button
                                    onClick={handleToggleConfirm}
                                    className={`relative flex w-full sm:w-auto justify-center rounded bg-blue-600 p-3 font-medium text-white ${togglingStatus[selectedToggleSubscriptionNumberId || 0] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={togglingStatus[selectedToggleSubscriptionNumberId || 0]}
                                >
                                    {togglingStatus[selectedToggleSubscriptionNumberId || 0] ? (
                                        <span className="flex items-center gap-2 py-1">
                                            <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                                            <p className="text-xs">جاري التغيير</p>
                                        </span>
                                    ) : (
                                        <span>نعم، تغيير</span>
                                    )}
                                </button>
                                <button
                                    onClick={closeToggleModal}
                                    className="flex w-full sm:w-auto justify-center rounded bg-gray-500 p-3 font-medium text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm mt-2 sm:mt-0"
                                >
                                    <span>لا، إلغاء</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionNumbers;