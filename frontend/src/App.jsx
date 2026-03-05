import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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
import Profile from "./pages/Profile";
import EventDetails from "./pages/EventDetails";

import EventroDashboard from "./features/admin/EventroDashboard";
import UserManagement from "./features/admin/UserManagement";
import AdminEvents from "./features/admin/AdminEvents";
import AdminTickets from "./features/admin/AdminTickets";
import AdminCalendar from "./features/admin/AdminCalendar";
import AdminTasks from "./features/admin/AdminTasks";
import AdminMarketing from "./features/admin/AdminMarketing";
import AdminReports from "./features/admin/AdminReports";
import AdminSettings from "./features/admin/AdminSettings";
import AdminHelp from "./features/admin/AdminHelp";

import EventList from "./features/events/EventList";
import EventCreate from "./features/events/EventCreate";
import EventEdit from "./features/events/EventEdit";

import BookingHistory from "./features/tickets/BookingHistory";
import QRTicketDisplay from "./features/tickets/QRTicketDisplay";

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
  const isAdminAuthenticated =
    localStorage.getItem("eventro_admin_authenticated") === "true";

  return isAdminAuthenticated ? children : <Navigate to="/eventro-admin" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public pages (Navbar visible + full width allowed) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Auth Routes (usually no navbar) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/resend-verification" element={<ResendVerificationEmail />} />
        </Route>

        {/* Admin Login */}
        <Route path="/eventro-admin" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route
          element={
            <AdminProtectedRoute>
              <EventroDashboardLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="/admin" element={<EventroDashboard />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/admin/calendar" element={<AdminCalendar />} />
          <Route path="/admin/tasks" element={<AdminTasks />} />
          <Route path="/admin/marketing" element={<AdminMarketing />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/help" element={<AdminHelp />} />
        </Route>

        {/* User Dashboard Routes (Navbar + layout inside DashboardLayout) */}
        <Route element={<DashboardLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/create" element={<EventCreate />} />
          <Route path="/events/:id/edit" element={<EventEdit />} />
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