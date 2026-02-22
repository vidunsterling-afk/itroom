import { useAuth } from "../context/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  LogOut,
  User,
  Bell,
  Settings,
  ChevronDown,
  CircleArrowLeft,
} from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const dashboardLocation = location.pathname === "/";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Corporate Header */}
      <header className="border-b border-slate-800 bg-gradient-to-r from-slate-950 to-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and brand */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full group-hover:bg-blue-500/30 transition-all" />
                  <Building2 className="w-8 h-8 text-blue-400 relative" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    ITRoom
                  </span>
                  <span className="text-[10px] text-slate-500 -mt-1">
                    Enterprise Suite
                  </span>
                </div>
              </Link>

              {user && (
                <nav className="hidden md:flex items-center space-x-1">
                  {!dashboardLocation && (
                    <Link
                      to="/"
                      className="px-3 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all flex items-center space-x-2 border"
                    >
                      <CircleArrowLeft className="w-4 h-4" />
                    </Link>
                  )}
                </nav>
              )}
            </div>

            {/* Right side - Corporate actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors group">
                <Bell className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full ring-2 ring-slate-950" />
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-3 pl-3 pr-2 py-1.5 rounded-lg hover:bg-slate-800/80 transition-all border border-slate-800/50 hover:border-slate-700"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-slate-700">
                        <User className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-slate-200">
                          {user.username}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setShowProfileMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center space-x-2"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/settings");
                            setShowProfileMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center space-x-2"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        <div className="border-t border-slate-800 my-1" />
                        <button
                          onClick={() => {
                            signOut();
                            setShowProfileMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-800 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20 text-sm font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">{children}</main>
    </div>
  );
}
