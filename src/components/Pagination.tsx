import React from 'react';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (items: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
}) => {
    // توليد أرقام الصفحات (الصفحة الحالية ± 1) مع نقاط التوقف
    const getPageNumbers = () => {
        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(totalPages, currentPage + 1);
        const pages: (number | string)[] = [];

        // إضافة الصفحة الأولى ونقاط التوقف إذا لزم الأمر
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) {
                pages.push('...');
            }
        }

        // إضافة الصفحات في النطاق
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // إضافة نقاط التوقف والصفحة الأخيرة إذا لزم الأمر
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4 sm:mb-0">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                    عناصر لكل صفحة:
                </label>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="rounded-md border border-stroke bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 p-1 py-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-500 dark:disabled:bg-gray-600 transition duration-200"
                >
                    <FiChevronRight className="w-5 h-5" />
                </button>
                {pageNumbers.map((item, index) => (
                    typeof item === 'number' ? (
                        <button
                            key={item}
                            onClick={() => onPageChange(item)}
                            className={`px-3 py-1 rounded-md ${currentPage === item
                                ? 'bg-blue-700 text-white dark:bg-blue-600'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                } transition duration-200`}
                        >
                            {item}
                        </button>
                    ) : (
                        <span
                            key={`ellipsis-${index}`}
                            className="py-1 text-gray-700 dark:text-gray-300"
                        >
                            ...
                        </span>
                    )
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-500 dark:disabled:bg-gray-600 transition duration-200"
                >
                    <FiChevronLeft className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;