import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  RefreshCw,
  Archive,
  KeyRound,
  ClipboardList,
  TrendingUp,
  Home,
  User,
  Moon,
  Sun,
  LogOut,
  FolderArchive,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import api from "../../api/axios";

const adminNav = [
  { to: "/admin/dashboard",      icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users",          icon: Users,           label: "Pengguna", roles: ["admin"] },
  { to: "/admin/items",          icon: Package,         label: "Barang" },
  { to: "/admin/borrowings",     icon: RefreshCw,       label: "Peminjaman" },
  { to: "/admin/archives",       icon: Archive,         label: "Arsip" },
  { to: "/admin/access-requests",icon: KeyRound,        label: "Permintaan Akses" },
  { to: "/admin/activity-logs",  icon: ClipboardList,   label: "Log Aktivitas" },
  { to: "/admin/reports",        icon: TrendingUp,      label: "Laporan" },
];

const memberNav = [
  { to: "/dashboard",            icon: Home,            label: "Dashboard" },
  { to: "/items",                icon: Package,         label: "Barang" },
  { to: "/borrowings/my",        icon: RefreshCw,       label: "Peminjaman Saya" },
  { to: "/archives",             icon: Archive,         label: "Arsip" },
  { to: "/access-requests/my",   icon: KeyRound,        label: "Permintaan Akses" },
  { to: "/profile",              icon: User,            label: "Profil" },
];

const roleLabels = {
  admin: "Administrator", ketua: "Ketua UKM", sekretaris: "Sekretaris",
  bendahara: "Bendahara", koordinator: "Koordinator", anggota: "Anggota", alumni: "Alumni",
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [badges, setBadges] = useState({});
  const isAdmin = ["admin", "ketua", "sekretaris"].includes(user?.role);
  const navItems = (isAdmin ? adminNav : memberNav).filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  useEffect(() => {
    if (!user) return;
    fetchBadges();
  }, [user, location.pathname]);

  const fetchBadges = async () => {
    try {
      const res = await api.get("/dashboard/badges");
      setBadges(res.data || {});
    } catch (err) {
      // Diamkan kegagalan badge agar navigasi tidak terganggu
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden cursor-pointer"
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Tutup menu navigasi"
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        flex flex-col z-30 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0284c7] text-white shadow-sm shadow-[#0284c7]/30 rounded-lg flex items-center justify-center" aria-hidden="true">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 leading-tight">SIMPAR UKM</div>
              <div className="text-xs text-slate-500 dark:text-slate-500">v1.0.0</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0284c7]/15 border border-[#0284c7]/30 rounded-full flex items-center justify-center text-sm font-bold text-[#0284c7] dark:text-[#38bdf8]" aria-hidden="true">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-500">{roleLabels[user?.role] || user?.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            {isAdmin ? "Administrasi" : "Menu"}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const count = badges[item.to] || 0;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 mb-1 cursor-pointer ${
                    isActive
                      ? "bg-[#0284c7]/10 dark:bg-[#0284c7]/20 text-[#0284c7] dark:text-[#38bdf8] border border-[#0284c7]/20 dark:border-[#38bdf8]/30 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="flex-1 truncate">{item.label}</span>
                {count > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-[#0284c7] text-white shadow-xs shrink-0"
                    title={`${count} item memerlukan perhatian`}
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-150"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Tema {isDarkMode ? "Gelap" : "Terang"}</span>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
