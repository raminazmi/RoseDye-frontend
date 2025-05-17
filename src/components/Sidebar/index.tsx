import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../../../public/logo.jpg';
import {
  FiGrid,
  FiUser,
  FiSettings,
  FiUserPlus,
  FiDollarSign,
  FiList,
} from 'react-icons/fi';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const storedClientId = localStorage.getItem('client_id');
  const [clientId, setClientId] = useState<string | null>(storedClientId || null);
  const role = user?.role || 'user';

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  const adminLinks = [
    { to: '/', label: 'لوحة التحكم', icon: <FiGrid className="text-lg" /> },
    { to: '/profile', label: 'الملف الشخصي', icon: <FiUser className="text-lg" /> },
    { to: '/clients', label: 'إضافة عميل', icon: <FiUserPlus className="text-lg" /> },
    { to: '/invoices', label: 'إضافة فاتورة', icon: <FiDollarSign className="text-lg" /> },
    { to: '/subscribers', label: 'الاشتراكات', icon: <FiList className="text-lg" /> },
    { to: '/settings', label: 'الإعدادات', icon: <FiSettings className="text-lg" /> },
  ];

  const userLinks = [
    {
      to: `/subscribers/${clientId || ''}`,
      label: 'اشتراكي',
      icon: (
        <svg
          className="fill-current"
          width="18"
          height="19"
          viewBox="0 0 18 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_130_9756)">
            <path
              d="M15.7501 0.55835H2.2501C1.29385 0.55835 0.506348 1.34585 0.506348 2.3021V15.8021C0.506348 16.7584 1.29385 17.574 2.27822 17.574H15.7782C16.7345 17.574 17.5501 16.7865 17.5501 15.8021V2.3021C17.522 1.34585 16.7063 0.55835 15.7501 0.55835ZM6.69385 10.599V6.4646H11.3063V10.5709H6.69385V10.599ZM11.3063 11.8646V16.3083H6.69385V11.8646H11.3063ZM1.77197 6.4646H5.45635V10.5709H1.77197V6.4646ZM12.572 6.4646H16.2563V10.5709H12.572V6.4646ZM2.2501 1.82397H15.7501C16.0313 1.82397 16.2563 2.04897 16.2563 2.33022V5.2271H1.77197V2.3021C1.77197 2.02085 1.96885 1.82397 2.2501 1.82397ZM1.77197 15.8021V11.8646H5.45635V16.3083H2.2501C1.96885 16.3083 1.77197 16.0834 1.77197 15.8021ZM15.7501 16.3083H12.572V11.8646H16.2563V15.8021C16.2563 16.0834 16.0313 16.3083 15.7501 16.3083Z"
              fill=""
            />
          </g>
          <defs>
            <clipPath id="clip0_130_9756">
              <rect width="18" height="18" fill="white" transform="translate(0 0.052124)" />
            </clipPath>
          </defs>
        </svg>
      ),
    },
    { to: '/profile', label: 'الملف الشخصي', icon: <FiUser className="text-lg" /> },
  ];

  const links = role === 'admin' ? adminLinks : userLinks;

  return (
    <div>
      <aside
        ref={sidebar}
        className={`absolute right-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <NavLink to="/" className="flex justify-center items-center gap-2">
            <img src={Logo} alt="Logo" className="w-8 h-8 rounded-md" />
            <h2 className="text-white font-bold">مصبغة عطر الورد</h2>
          </NavLink>
          <button
            ref={trigger}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            className="block lg:hidden"
          >
            <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">القائمة</h3>
              <ul className="mb-6 flex flex-col gap-1.5">
                {links.map((link, index) => (
                  <li key={index}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${isActive ? 'bg-graydark dark:bg-meta-4' : ''}`
                      }
                    >
                      {link.icon}
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;