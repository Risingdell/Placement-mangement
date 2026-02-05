import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import CompactKPIBar from "./CompactKPIBar";

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden neo-dashboard-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Compact KPI Bar */}
        <CompactKPIBar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
