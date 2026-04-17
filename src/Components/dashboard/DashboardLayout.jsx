import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import CompactKPIBar from './CompactKPIBar';

function DashboardLayout() {
  const location = useLocation();
  const isDashboardHome = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [studentTheme, setStudentTheme] = useState(() => {
    const saved = localStorage.getItem('student-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('student-theme', studentTheme);
  }, [studentTheme]);

  return (
    <div
      className={`flex h-screen overflow-hidden ${
        studentTheme === 'light'
          ? 'student-theme-light bg-[#f3f4f6] text-[#111827]'
          : 'bg-[#141416] text-[#e5e7eb]'
      }`}
    >
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        theme={studentTheme}
      />

      <div className="flex-1 flex flex-col overflow-y-auto relative min-w-0">
        <TopNavbar
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isCollapsed={isCollapsed}
          theme={studentTheme}
          onThemeChange={setStudentTheme}
        />

        {isDashboardHome && <CompactKPIBar theme={studentTheme} />}

        <main
          className={`flex-1 relative z-10 ${
            studentTheme === 'light'
              ? 'bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),_transparent_30%)]'
              : 'bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.08),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.05),_transparent_30%)]'
          }`}
        >
          <div className="px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-8">
            <Outlet context={{ theme: studentTheme }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
