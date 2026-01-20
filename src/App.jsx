import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/auth/Login";
import Register from "./Components/auth/Register";
import ForgotPassword from "./Components/auth/ForgotPassword";
import ProtectedRoute from "./Components/common/ProtectedRoute";
import DashboardLayout from "./Components/dashboard/DashboardLayout";


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
          <Route path="profile" element={<h2>Profile Page</h2>} />
          <Route path="inbox" element={<h2>Inbox Page</h2>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
