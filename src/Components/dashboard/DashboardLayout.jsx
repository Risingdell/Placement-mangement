import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import CompactKPIBar from "./CompactKPIBar";

function DashboardLayout() {
  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={styles.mainArea}>
        {/* Top Navbar */}
        <TopNavbar />

        {/* Compact KPI Bar */}
        <CompactKPIBar />

        {/* Page Content */}
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#f5f7fa',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
};

export default DashboardLayout;
