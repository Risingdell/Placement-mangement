import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import CompactKPIBar from './CompactKPIBar';

function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#141416] text-[#e5e7eb]">
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <TopNavbar
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isCollapsed={isCollapsed}
        />

        <CompactKPIBar />

        <main className="flex-1 overflow-auto relative z-10 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.08),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.05),_transparent_30%)]">
          <div className="px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-8">
          <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
