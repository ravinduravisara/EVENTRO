import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/analytics/:eventId" element={<AnalyticsDashboard />} />
          <Route path="/feedback/:eventId" element={<FeedbackList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
