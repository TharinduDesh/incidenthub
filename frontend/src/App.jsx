import { useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/FloatingShape";
import Sidebar from "./components/Sidebar";
import LoadingSpinner from "./components/LoadingSpinner";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";

// Import pages
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TopNavbar from "./components/TopNavbar";
import ReportIncidentPage from "./pages/ReportIncidentPage";
import ViewIncidentsPage from "./pages/ViewIncident";
import IncidentDetailPage from "./pages/IncidentDetailPage";
import Calendar from "./pages/Calendar";
import AdminViewIncident from "./pages/AdminViewIncident";
import ManageUsersPage from "./pages/ManageUsersPage";
import UserDashboard from "./pages/UserDashboard";

// protect routes that require authentication
const ProtectedRouter = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

const AdminProtectedRouter = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified || user.userType !== "Admin") {
    return <Navigate to="/" replace />; // Redirect to a generic page if not admin
  }

  return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { isCheckingAuth, checkAuth, isAuthenticated, user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Render sidebar only if the user is authenticated and verified
  const renderSidebar = isAuthenticated && user && user.isVerified;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden">
      <FloatingShape
        color="bg-green-500"
        size="w-64 h-64"
        top="-5%"
        left="10%"
        delay={0}
      />
      <FloatingShape
        color="bg-emerald-500"
        size="w-48 h-48"
        top="70%"
        left="80%"
        delay={5}
      />
      <FloatingShape
        color="bg-lime-500"
        size="w-32 h-32"
        top="40%"
        left="-10%"
        delay={2}
      />

      {renderSidebar && (
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      <TopNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex items-center justify-center">
        {renderSidebar && (
          <Sidebar
            isOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        )}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRouter>
                <DashboardPage />
              </ProtectedRouter>
            }
          />

          {/* Dashboard Pages */}

          <Route
            path="/report-incident"
            element={
              <ProtectedRouter>
                <ReportIncidentPage />
              </ProtectedRouter>
            }
          />

          <Route
            path="/view-incidents"
            element={
              <ProtectedRouter>
                <ViewIncidentsPage />
              </ProtectedRouter>
            }
          />

          <Route
            path="/incident/:id"
            element={
              <ProtectedRouter>
                <IncidentDetailPage />
              </ProtectedRouter>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRouter>
                <Calendar />
              </ProtectedRouter>
            }
          />

          {/* Admin dashboard Pages */}
          <Route
            path="/admin/manage-incident"
            element={
              <AdminProtectedRouter>
                <AdminViewIncident />
              </AdminProtectedRouter>
            }
          />

          <Route
            path="/admin/manage-users"
            element={
              <AdminProtectedRouter>
                <ManageUsersPage />
              </AdminProtectedRouter>
            }
          />

          <Route
            path="/admin/user-dashboard"
            element={
              <AdminProtectedRouter>
                <UserDashboard />
              </AdminProtectedRouter>
            }
          />

          <Route
            path="/signup"
            element={
              <RedirectAuthenticatedUser>
                <SignUpPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectAuthenticatedUser>
                <LoginPage />
              </RedirectAuthenticatedUser>
            }
          />

          <Route path="/verify-email" element={<EmailVerificationPage />} />

          <Route
            path="/forgot-password"
            element={
              <RedirectAuthenticatedUser>
                <ForgotPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <RedirectAuthenticatedUser>
                <ResetPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />
        </Routes>
      </div>

      <Toaster />
    </div>
  );
}

export default App;
