import React from 'react';

interface SubscriptionBalanceProps {
    currentBalance: number;
    renewalBalance?: number;
}

const SubscriptionBalance: React.FC<SubscriptionBalanceProps> = ({ currentBalance, renewalBalance }) => {
    const getBalanceColor = (balance: number, threshold: number) => {
        if (balance >= threshold) return 'bg-green-500';
        if (balance >= threshold - 5) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="flex flex-col gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">الرصيد الحالي</span>
                <div className={`px-3 py-1 rounded-full text-white ${getBalanceColor(currentBalance, 35)}`}>
                    {currentBalance.toFixed(3)} د.ك
                </div>
            </div>
            {renewalBalance !== undefined && (
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">المتبقي للتجديد</span>
                    <div className={`px-3 py-1 rounded-full text-white ${getBalanceColor(renewalBalance, 35)}`}>
                        {renewalBalance.toFixed(3)} د.ك
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionBalance;