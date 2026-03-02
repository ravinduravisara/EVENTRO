import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerificationEmail from './pages/ResendVerificationEmail';
import Profile from './pages/Profile';
import EventDetails from './pages/EventDetails';
import AdminDashboard from './features/admin/AdminDashboard';
import UserManagement from './features/admin/UserManagement';
import EventList from './features/events/EventList';
import EventCreate from './features/events/EventCreate';
import BookingHistory from './features/tickets/BookingHistory';
import QRTicketDisplay from './features/tickets/QRTicketDisplay';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';
import FeedbackList from './features/analytics/FeedbackList';
import AdminLogin from './pages/AdminLogin';

const AdminProtectedRoute = ({ children }) => {
  const isAdminAuthenticated = localStorage.getItem('eventro_admin_authenticated') === 'true';
  return isAdminAuthenticated ? children : <Navigate to="/eventro-admin" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/resend-verification" element={<ResendVerificationEmail />} />
        </Route>

        <Route path="/eventro-admin" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>

        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/create" element={<EventCreate />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/bookings" element={<BookingHistory />} />
          <Route path="/bookings/:id/ticket" element={<QRTicketDisplay />} />
          <Route path="/analytics/:eventId" element={<AnalyticsDashboard />} />
          <Route path="/feedback/:eventId" element={<FeedbackList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
