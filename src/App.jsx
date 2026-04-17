import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./Components/auth/Login";
import Register from "./Components/auth/Register";
import ForgotPassword from "./Components/auth/ForgotPassword";
import ResetPassword from "./Components/auth/ResetPassword";
import AdminLogin from "./Components/auth/AdminLogin";
import ProtectedRoute from "./Components/common/ProtectedRoute";
import DashboardLayout from "./Components/dashboard/DashboardLayout";
import AdminDashboardLayout from "./Components/admin/AdminDashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import DrivesPage from "./pages/DrivesPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import InboxPage from "./pages/InboxPage";
import EventsPage from "./pages/EventsPage";
import AdminDashboardHome from "./pages/admin/AdminDashboardHome";
import CompaniesPage from "./pages/admin/CompaniesPage";
import StudentsPage from "./pages/admin/StudentsPage";
import PlacementDrivesPage from "./pages/admin/PlacementDrivesPage";
import AdminApplicationsPage from "./pages/admin/ApplicationsPage";
import MessagesPage from "./pages/admin/MessagesPage";
import AdminEventsPage from "./pages/admin/EventsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import AuthorizedEmailsPage from "./pages/admin/AuthorizedEmailsPage";
import DriveWallPage from "./pages/DriveWallPage";
import { SnackbarProvider } from "./context/SnackbarContext";


function App() {
  return (
    <BrowserRouter>
      <SnackbarProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Drive Access Wall — public, no auth */}
          <Route path="/drive-wall" element={<DriveWallPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Student Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="drives" element={<DrivesPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="inbox" element={<InboxPage />} />
            <Route path="events" element={<EventsPage />} />
          </Route>

          {/* Admin Protected Dashboard Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'tpo']}>
                <AdminDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardHome />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="drives" element={<PlacementDrivesPage />} />
            <Route path="applications" element={<AdminApplicationsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="authorized-emails" element={<AuthorizedEmailsPage />} />
            <Route path="settings" element={<h2>Settings - Coming Soon</h2>} />
          </Route>
        </Routes>
      </SnackbarProvider>
    </BrowserRouter>
  );
}

export default App;
