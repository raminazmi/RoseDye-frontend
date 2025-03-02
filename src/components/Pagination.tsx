import React from 'react';

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
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4 sm:mb-0">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                    عناصر لكل صفحة:
                </label>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="rounded-md border border-stroke bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    السابق
                </button>
                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={`px-3 py-1 rounded-md ${currentPage === number
                                ? 'bg-blue-700 text-white dark:bg-blue-600'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            } transition duration-200`}
                    >
                        {number}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-500 dark:disabled:bg-gray-600 transition duration-200"
                >
                    التالي
                </button>
            </div>
        </div>
    );
};

export default Pagination;