import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            Eventro
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/events" className="text-gray-600 hover:text-primary">
              Events
            </Link>
            {user ? (
              <>
                <Link to="/bookings" className="text-gray-600 hover:text-primary">
                  My Bookings
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-primary">
                  Profile
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-primary">
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-primary">
                Login
              </Link>
            )}
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100">
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
