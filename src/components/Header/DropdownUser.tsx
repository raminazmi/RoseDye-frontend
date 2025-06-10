import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { logout, auth } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/api/v1/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
      } catch (error) {
        toast.error('فشل في جلب بيانات المستخدم');
        console.error(error);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("access_token");
    navigate("/");
  };

  const getInitial = () => {
    if (!user || !user.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  const avatarUrl = user?.avatar ? `http://localhost:8000/${user.avatar}` : null;

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        to="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {user?.name || "تحميل..."}
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            {user?.role || "..."}
          </span>
        </span>

        <span className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-600 text-white text-lg font-semibold shadow-md">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitial()
          )}
        </span>

        <FaChevronDown className="fill-current text-gray-600 dark:text-gray-300 sm:block" />
      </Link>

      {dropdownOpen && (
        <div className="absolute -left-3 mt-2 w-46 flex flex-col rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <ul className="flex flex-col gap-2 p-4">
            <li>
              <Link
                to="/profile"
                className="flex items-center gap-3 p-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400 transition duration-200"
              >
                <FaUser className="text-gray-500 dark:text-gray-400" />
                <span>ملفي الشخصي</span>
              </Link>
            </li>
            {(user?.role == 'admin')
              ?
              <li>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 p-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400 transition duration-200"
                >
                  <FaCog className="text-gray-500 dark:text-gray-400" />
                  <span>إعدادت الحساب</span>
                </Link>
              </li>
              : <li></li>
            }
          </ul>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-4 text-sm font-medium text-gray-700 border-t border-gray-200 hover:text-red-600 dark:text-gray-200 dark:border-gray-700 dark:hover:text-red-400 transition duration-200"
          >
            <FaSignOutAlt className="text-gray-500 dark:text-gray-400" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;