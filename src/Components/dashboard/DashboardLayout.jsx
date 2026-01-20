import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div>
      {/* Navbar placeholder */}
      <header>
        <h3>Dashboard Navbar</h3>
      </header>

      <div style={{ display: "flex" }}>
        {/* Sidebar placeholder */}
        <aside style={{ width: "200px" }}>
          <p>Sidebar</p>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "20px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
