import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useParams, Navigate } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import AdminSignIn from './pages/Authentication/AdminSignIn';
import Chart from './pages/Chart';
import ECommerce from './pages/Dashboard/ECommerce';
import Home from './pages/Home';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import GuestLayout from './layout/GuestLayout';
import Clients from './pages/Tables/Clients';
import Invoices from './pages/Tables/Invoices';
import OTPForm from './pages/Form/OTPForm';
import SubscriptionTable from './pages/Tables/Subscriptions';
import SubscriptionDetails from './pages/Tables/SubscriptionDetails';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from './components/Breadcrumbs/Breadcrumb';
import NotFoundPage from './NotFoundPage';

// مكون حماية المسارات
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { auth } = useAuth();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// مكون حماية المسارات الإدارية
const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { auth, user } = useAuth();

  if (!auth || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { auth, user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const tempToken = localStorage.getItem('temp_token');
    if (tempToken && !pathname.includes('/auth/otp-form')) {
      const verifyToken = async () => {
        try {
          const response = await fetch('https://rosedye-backend-production.up.railway.app/api/v1/verify-temp-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ temp_token: tempToken }),
          });

          if (response.ok) {
            navigate('/auth/otp-form');
          }
        } catch (err) {
          console.error('Error verifying temp token:', err);
          navigate('/login');
        }
      };
      verifyToken();
    }
    if (auth && (pathname === '/login')) {
      navigate('/');
    }
  }, [auth, navigate, pathname]);

  const ProtectedSubscriptionDetails = () => {
    const { id } = useParams<{ id: string }>();
    const userId = localStorage.getItem('client_id');

    if (id !== userId?.toString()) {
      return <Navigate to="/" replace />;
    }

    return (
      <>
        <PageTitle title="تفاصيل الاشتراك | لوحة التحكم مصبغة الورد" />
        <Breadcrumb pageName="الاشتراكات" />
        <div className="flex flex-col gap-10">
          <SubscriptionDetails />
        </div>
      </>
    );
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      {auth ? (
        <DefaultLayout>
          <Routes>
            <Route
              index
              element={
                <AdminProtectedRoute>
                  <>
                    <PageTitle title="لوحة تحكم مصبغة الورد" />
                    <ECommerce />
                  </>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <>
                    <PageTitle title="الملف الشخصي | لوحة التحكم مصبغة الورد" />
                    <Profile />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <AdminProtectedRoute>
                  <>
                    <PageTitle title="اضافة عملاء | لوحة التحكم مصبغة الورد" />
                    <Clients />
                  </>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <AdminProtectedRoute>
                  <>
                    <PageTitle title="اضافة الفواتير | لوحة التحكم مصبغة الورد" />
                    <Invoices />
                  </>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/forms/form-elements"
              element={
                <AdminProtectedRoute>
                  <>
                    <PageTitle title="اضافة عملاء | لوحة التحكم مصبغة الورد" />
                    <FormElements />
                  </>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/forms/form-layout"
              element={
                <AdminProtectedRoute>
                  <>
                    <PageTitle title="Form Layout | لوحة التحكم مصبغة الورد" />
                    <FormLayout />
                  </>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/subscribers/:id"
              element={
                <ProtectedRoute>
                  <ProtectedSubscriptionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscribers"
              element={
                <AdminProtectedRoute>
                  <>
                    <PageTitle title="جدول الاشتراكات | لوحة التحكم مصبغة الورد" />
                    <Breadcrumb pageName="الاشتراكات" />
                    <div className="flex flex-col gap-10">
                      <SubscriptionTable />
                    </div>
                  </>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <>
                    <PageTitle title="الاعدادت | لوحة التحكم مصبغة الورد" />
                    <Settings />
                  </>
                </ProtectedRoute>
              } 
            />
            <Route
              path="/chart"
              element={
                <AdminProtectedRoute>
                  <>
                    <PageTitle title="Basic Chart | لوحة التحكم مصبغة الورد" />
                    <Chart />
                  </>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/ui/buttons"
              element={
                <AdminProtectedRoute>
                  <>
                    <PageTitle title="Buttons | لوحة التحكم مصبغة الورد" />
                    <Buttons />
                  </>
                </AdminProtectedRoute>
              }
            />
              <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DefaultLayout>
      ) : (
        <GuestLayout>
          <Routes>
            <Route
              index
              element={
                <>
                  <PageTitle title="لوحة تحكم مصبغة الورد" />
                  <Home />
                </>
              }
            />
            <Route
              path="/login"
              element={
                <>
                  <PageTitle title="Signin | لوحة التحكم مصبغة الورد" />
                  <SignIn />
                </>
              }
            />
            <Route
              path="admin/login"
              element={
                <>
                  <PageTitle title="AdminSignIn | لوحة التحكم مصبغة الورد" />
                  <AdminSignIn />
                </>
              }
            />
            <Route
              path="/auth/otp-form"
              element={
                <>
                  <PageTitle title="صفحة التحقق | لوحة التحكم مصبغة الورد" />
                  <OTPForm />
                </>
              }
            />
                <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </GuestLayout>
      )}
    </>
  );
}

export default App;