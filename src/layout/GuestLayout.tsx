import React, { ReactNode } from 'react';

const GuestLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
            <main className="flex-grow container mx-auto p-4">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="rounded-3xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark md:mx-[80px] md:my-[80px]">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GuestLayout;
