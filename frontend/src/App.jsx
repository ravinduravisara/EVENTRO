<<<<<<< HEAD
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import EventroDashboardLayout from "./layouts/EventroDashboardLayout";
import AuthLayout from "./layouts/AuthLayout";

// ✅ Add Navbar for Public pages
import Navbar from "./layouts/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerificationEmail from "./pages/ResendVerificationEmail";
import ForgotAccessOtp from "./pages/ForgotAccessOtp";
import Profile from "./pages/Profile";
import EventDetails from "./pages/EventDetails";
import Payment from "./pages/Payment";
import SubmitFeedback from "./pages/SubmitFeedback";
import BecomeSponsor from "./pages/BecomeSponsor";

import EventroDashboard from "./features/admin/EventroDashboard";
import UserManagement from "./features/admin/UserManagement";
import AdminEvents from "./features/admin/AdminEvents";
import AdminTickets from "./features/admin/AdminTickets";
import AdminCheckIn from "./features/admin/AdminCheckIn";
import AdminCalendar from "./features/admin/AdminCalendar";
import AdminTasks from "./features/admin/AdminTasks";
import AdminMarketing from "./features/admin/AdminMarketing";
import AdminRefunds from "./features/admin/AdminRefunds";
import AdminReports from "./features/admin/AdminReports";
import AdminSettings from "./features/admin/AdminSettings";
import AdminHelp from "./features/admin/AdminHelp";
import AdminFeedback from "./features/admin/AdminFeedback";
import AdminSponsorship from "./features/admin/AdminSponsorship";

import EventList from "./features/events/EventList";
import EventCreate from "./features/events/EventCreate";
import EventEdit from "./features/events/EventEdit";

import BookingHistory from "./features/tickets/BookingHistory";
import QRTicketDisplay from "./features/tickets/QRTicketDisplay";
import TransactionHistory from "./features/tickets/TransactionHistory";

import AnalyticsDashboard from "./features/analytics/AnalyticsDashboard";
import FeedbackList from "./features/analytics/FeedbackList";

import AdminLogin from "./pages/AdminLogin";
import { Outlet } from "react-router-dom";

// ✅ Public layout: shows Navbar and allows full-width pages like Home
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }
  const isRoleAllowed = user?.role === "admin" || user?.role === "organizer";
  const isAdminAuthenticated = Boolean(token) && isRoleAllowed;

  return isAdminAuthenticated ? (
    children
  ) : (
    <Navigate to="/eventro-admin" replace />
  );
};

const UserProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
=======
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
>>>>>>> parent of a197612 (Event management)
};

function App() {
  return (
    <Router>
      <Routes>
<<<<<<< HEAD
        {/* ✅ Public pages (Navbar visible + full width allowed) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/submit-feedback" element={<SubmitFeedback />} />
          <Route path="/become-sponsor" element={<BecomeSponsor />} />
        </Route>

        {/* Auth Routes (usually no navbar) */}
=======
        {/* Auth Routes */}
>>>>>>> parent of a197612 (Event management)
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/resend-verification"
            element={<ResendVerificationEmail />}
          />
          <Route path="/forgot-access" element={<ForgotAccessOtp />} />
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
<<<<<<< HEAD
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/admin/check-in" element={<AdminCheckIn />} />
          <Route path="/admin/calendar" element={<AdminCalendar />} />
          <Route path="/admin/tasks" element={<AdminTasks />} />
          <Route path="/admin/marketing" element={<AdminMarketing />} />
          <Route path="/admin/refunds" element={<AdminRefunds />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          <Route path="/admin/sponsorship" element={<AdminSponsorship />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/help" element={<AdminHelp />} />
=======
>>>>>>> parent of a197612 (Event management)
        </Route>

        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
<<<<<<< HEAD
          <Route
            path="/profile"
            element={
              <UserProtectedRoute>
                <Profile />
              </UserProtectedRoute>
            }
          />
          <Route path="/events" element={<EventList />} />
          <Route
            path="/events/create"
            element={
              <UserProtectedRoute>
                <EventCreate />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <UserProtectedRoute>
                <EventEdit />
              </UserProtectedRoute>
            }
          />
=======
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/create" element={<EventCreate />} />
>>>>>>> parent of a197612 (Event management)
          <Route path="/events/:id" element={<EventDetails />} />
          <Route
            path="/events/:id/payment"
            element={
              <UserProtectedRoute>
                <Payment />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <UserProtectedRoute>
                <BookingHistory />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <UserProtectedRoute>
                <TransactionHistory />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id/ticket"
            element={
              <UserProtectedRoute>
                <QRTicketDisplay />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/analytics/:eventId"
            element={
              <UserProtectedRoute>
                <AnalyticsDashboard />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/feedback/:eventId"
            element={
              <UserProtectedRoute>
                <FeedbackList />
              </UserProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
