import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute, RoleRoute } from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminItems from "./pages/admin/AdminItems";
import AdminBorrowings from "./pages/admin/AdminBorrowings";
import AdminArchives from "./pages/admin/AdminArchives";
import AdminAccessRequests from "./pages/admin/AdminAccessRequests";
import AdminActivityLogs from "./pages/admin/AdminActivityLogs";

// Member pages
import MemberDashboard from "./pages/member/MemberDashboard";
import ItemsPage from "./pages/member/ItemsPage";
import MyBorrowingsPage from "./pages/member/MyBorrowingsPage";
import ArchivesPage from "./pages/member/ArchivesPage";
import MyAccessRequestsPage from "./pages/member/MyAccessRequestsPage";
import ProfilePage from "./pages/member/ProfilePage";

const ADMIN_ROLES = ["admin", "ketua", "sekretaris", "bendahara", "koordinator"];

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes (all logged in users) */}
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>

              {/* Admin Routes */}
              <Route element={<RoleRoute roles={ADMIN_ROLES} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/items" element={<AdminItems />} />
                <Route path="/admin/borrowings" element={<AdminBorrowings />} />
                <Route path="/admin/archives" element={<AdminArchives />} />
                <Route path="/admin/access-requests" element={<AdminAccessRequests />} />
                <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
              </Route>
              <Route element={<RoleRoute roles={["admin"]} />}>
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>

              {/* Member Routes */}
              <Route path="/dashboard" element={<MemberDashboard />} />
              <Route path="/items" element={<ItemsPage />} />
              <Route path="/borrowings/my" element={<MyBorrowingsPage />} />
              <Route path="/archives" element={<ArchivesPage />} />
              <Route path="/access-requests/my" element={<MyAccessRequestsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
