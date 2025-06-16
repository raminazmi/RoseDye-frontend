import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { GroupBase, OptionsOrGroups } from 'react-select';
import Select from 'react-select';

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

interface EditSubscriptionNumberFormProps {
    subscriptionNumber: SubscriptionNumber;
    clientsOptions: OptionsOrGroups<ClientOption, GroupBase<ClientOption>>;
    selectedClientForEdit: ClientOption | null;
    handleClientChange: (selectedOption: ClientOption | null) => void;
    onSubscriptionNumberUpdated: () => void;
    onClose: () => void;
}

const EditSubscriptionNumberForm: React.FC<EditSubscriptionNumberFormProps> = ({
    subscriptionNumber,
    clientsOptions,
    selectedClientForEdit,
    handleClientChange,
    onSubscriptionNumberUpdated,
    onClose,
}) => {
    const [number, setNumber] = useState(subscriptionNumber.number);
    const [isAvailable, setIsAvailable] = useState(subscriptionNumber.is_available);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setNumber(subscriptionNumber.number);
        setIsAvailable(subscriptionNumber.is_available);
    }, [subscriptionNumber]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                throw new Error('يرجى تسجيل الدخول أولاً');
            }

            // الخطوة 1: تحديث رقم الاشتراك وحالة التوفر
            const formData = {
                number,
                is_available: isAvailable,
            };

            const response = await fetch(`https://api.36rwrd.online/api/v1/subscription-numbers/${subscriptionNumber.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrors(errorData.errors || { general: ['حدث خطأ أثناء تعديل رقم الاشتراك.'] });
                toast.error(errorData.message || 'فشل تعديل رقم الاشتراك');
                return;
            }

            // الخطوة 2: تحديث العميل المرتبط (إذا تغير)
            if (selectedClientForEdit !== null || subscriptionNumber.client) {
                const clientPayload = {
                    client_id: selectedClientForEdit ? selectedClientForEdit.value : null,
                };
                const clientResponse = await fetch(
                    `https://api.36rwrd.online/api/v1/subscription-numbers/${subscriptionNumber.id}/assign-client`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify(clientPayload),
                    }
                );

                const clientData = await clientResponse.json();
                if (!clientResponse.ok) {
                    setErrors(clientData.errors || { general: [clientData.message || 'حدث خطأ أثناء تحديث العميل.'] });
                    toast.error(clientData.message || 'فشل تحديث العميل');
                    return;
                }
            }

            toast.success('تم تعديل رقم الاشتراك والعميل بنجاح!');
            onSubscriptionNumberUpdated();
            onClose();
        } catch (error: any) {
            console.error('Error updating subscription number or client:', error);
            setErrors({ general: [error.message || 'حدث خطأ غير متوقع.'] });
            toast.error(error.message || 'فشل تعديل رقم الاشتراك أو العميل');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setNumber(subscriptionNumber.number);
        setIsAvailable(subscriptionNumber.is_available);
        handleClientChange(null);
        setErrors({});
    };

    return (
        <form onSubmit={handleSubmit} className="p-2 sm:p-6.5">
            {errors.general && (
                <div className="mb-4">
                    {errors.general.map((msg, i) => (
                        <p key={i} className="text-red-500 text-sm">{msg}</p>
                    ))}
                </div>
            )}

            <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                    رقم الاشتراك <span className="text-meta-1">*</span>
                </label>
                <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="أدخل رقم الاشتراك"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                {errors.number && (
                    <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.number[0]}</span>
                )}
            </div>

            <div className="mb-4">
                <label htmlFor="clientSelect" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                    اختيار العميل:
                </label>
                <Select
                    id="clientSelect"
                    options={clientsOptions}
                    value={selectedClientForEdit}
                    onChange={handleClientChange}
                    placeholder="اختر عميلاً"
                    isClearable
                    isSearchable
                    classNamePrefix="react-select"
                />
                {errors.client_id && (
                    <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.client_id[0]}</span>
                )}
            </div>


            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button
                    type="submit"
                    className={`relative flex w-full sm:w-auto justify-center rounded bg-blue-600 p-3 font-medium text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                >
                    {!isSubmitting ? (
                        <span>حفظ التعديلات</span>
                    ) : (
                        <span className="flex items-center gap-2 py-1">
                            <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                            <p className="text-xs">جاري الحفظ</p>
                        </span>
                    )}
                </button>
                <button
                    onClick={onClose}
                    className="flex w-full sm:w-auto justify-center rounded bg-gray-500 p-3 font-medium text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm mt-2 sm:mt-0"
                >
                    <span className="">لا، إلغاء</span>
                </button>
            </div>
        </form>
    );
};

export default EditSubscriptionNumberForm;