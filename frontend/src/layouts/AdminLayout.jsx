import { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('eventro_admin_authenticated');
    navigate('/eventro-admin', { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-indigo-600 to-purple-700 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-indigo-500">
          <div className="flex items-center justify-between">
            <h1 className={`${sidebarOpen ? 'text-2xl' : 'text-lg'} font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent`}>
              {sidebarOpen ? 'Eventro Admin' : 'EA'}
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-indigo-500 rounded-lg transition"
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/admin"
            label="Dashboard"
            icon="📊"
            sidebarOpen={sidebarOpen}
            onClick={() => navigate('/admin')}
          />
          <NavLink
            to="/admin/users"
            label="User Management"
            icon="👥"
            sidebarOpen={sidebarOpen}
            onClick={() => navigate('/admin/users')}
          />
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-indigo-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition duration-200 font-medium"
          >
            <span>🚪</span>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Logged in as <span className="font-semibold text-gray-900">EVENTRO</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const NavLink = ({ to, label, icon, sidebarOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-indigo-500 transition duration-200"
    >
      <span className="text-xl">{icon}</span>
      {sidebarOpen && <span>{label}</span>}
    </button>
  );
};

export default AdminLayout;
