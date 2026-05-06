import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const adminNav = [
  { to: "/admin/dashboard",      icon: "📊", label: "Dashboard" },
  { to: "/admin/users",          icon: "👥", label: "Pengguna" },
  { to: "/admin/items",          icon: "📦", label: "Barang" },
  { to: "/admin/borrowings",     icon: "🔄", label: "Peminjaman" },
  { to: "/admin/archives",       icon: "🗂️",  label: "Arsip" },
  { to: "/admin/access-requests",icon: "🔐", label: "Permintaan Akses" },
  { to: "/admin/activity-logs",  icon: "📋", label: "Log Aktivitas" },
  { to: "/admin/reports",        icon: "📈", label: "Laporan" },
];

const memberNav = [
  { to: "/dashboard",            icon: "🏠", label: "Dashboard" },
  { to: "/items",                icon: "📦", label: "Barang" },
  { to: "/borrowings/my",        icon: "🔄", label: "Peminjaman Saya" },
  { to: "/archives",             icon: "🗂️",  label: "Arsip" },
  { to: "/access-requests/my",   icon: "🔐", label: "Permintaan Akses" },
  { to: "/profile",              icon: "👤", label: "Profil" },
];

const roleLabels = {
  admin: "Administrator", ketua: "Ketua UKM", sekretaris: "Sekretaris",
  bendahara: "Bendahara", koordinator: "Koordinator", anggota: "Anggota", alumni: "Alumni",
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = ["admin", "ketua", "sekretaris"].includes(user?.role);
  const navItems = isAdmin ? adminNav : memberNav;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800
        flex flex-col z-30 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-lg">📁</div>
            <div>
              <div className="font-bold text-slate-100 leading-tight">SIMPAR UKM</div>
              <div className="text-xs text-slate-500">v1.0.0</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600/30 border border-indigo-500/30 rounded-full flex items-center justify-center text-sm font-bold text-indigo-400">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-200 truncate">{user?.name}</div>
              <div className="text-xs text-slate-500">{roleLabels[user?.role] || user?.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            {isAdmin ? "Administrasi" : "Menu"}
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5 ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
