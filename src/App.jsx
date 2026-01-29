import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/auth/Login";
import Register from "./Components/auth/Register";
import ForgotPassword from "./Components/auth/ForgotPassword";
import ProtectedRoute from "./Components/common/ProtectedRoute";
import DashboardLayout from "./Components/dashboard/DashboardLayout";
import ProfilePage from "./pages/ProfilePage";
import DrivesPage from "./pages/DrivesPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import InboxPage from "./pages/InboxPage";
import EventsPage from "./pages/EventsPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<h2>Dashboard Home</h2>} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="drives" element={<DrivesPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="events" element={<EventsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
