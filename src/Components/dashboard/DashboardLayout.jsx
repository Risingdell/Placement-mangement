import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import CompactKPIBar from "./CompactKPIBar";

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#181818] text-[#f4f4f5]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {/* Placeholder for 3D Background */}
        <div id="canvas-container" className="absolute inset-0 z-0 pointer-events-none"></div>

        {/* Top Navbar */}
        <TopNavbar />

        {/* Compact KPI Bar */}
        <CompactKPIBar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-5 md:p-6 relative z-10 bg-[radial-gradient(circle_at_top_right,_rgba(255,161,22,0.08),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.06),_transparent_35%)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
