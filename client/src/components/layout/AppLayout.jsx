import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, FolderArchive, Moon, Sun } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka navigasi menu"
              className="cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center -ml-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7]"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#0284c7] text-white rounded-lg flex items-center justify-center shadow-xs" aria-hidden="true">
                <FolderArchive className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">SIMPAR UKM</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label={`Ganti ke tema ${isDarkMode ? "terang" : "gelap"}`}
              className="cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isDarkMode ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
            {user?.name && (
              <div
                className="w-8 h-8 bg-[#0284c7]/15 border border-[#0284c7]/30 rounded-full flex items-center justify-center text-xs font-bold text-[#0284c7] dark:text-[#38bdf8] shrink-0"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
