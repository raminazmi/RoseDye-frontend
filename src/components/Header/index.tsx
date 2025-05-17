import { Link, useNavigate, NavLink } from 'react-router-dom';
import DropdownUser from './DropdownUser';
import LogoIcon from '../../images/logo/logo-icon.svg';
import DarkModeSwitcher from './DarkModeSwitcher';
import Logo from '../../../public/logo.jpg';
import { useAuth } from '../../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const { logout, auth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("access_token");
    navigate("/");
  };
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            name="sidebar"
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && '!w-full delay-300'
                    }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && 'delay-400 !w-full'
                    }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && '!w-full delay-500'
                    }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && '!h-0 !delay-[0]'
                    }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && '!h-0 !delay-200'
                    }`}
                ></span>
              </span>
            </span>
          </button>
          <NavLink to="/" className="flex justify-center items-center gap-2">
            <img src={Logo} alt="Logo" className="w-8 h-8 rounded-md" />
          </NavLink>
        </div>

        <div className="hidden sm:block">
        </div>

        <div className="flex items-center gap-2 2xsm:gap-2">
          <ul className="flex items-center gap-1 2xsm:gap-1">
            <DarkModeSwitcher />
          </ul>
          <button
            onClick={handleLogout}
            className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full gap-2 py-2 px-4 text-sm font-medium text-gray-700 hover:text-red-600 dark:text-gray-100 dark:hover:text-red-400 transition duration-200"
          >
            <FaSignOutAlt className="text-gray-700 dark:text-gray-100" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
