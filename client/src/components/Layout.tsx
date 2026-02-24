import { useAuth } from "../context/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  LogOut,
  User,
  Bell,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardLocation = location.pathname === "/";
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

              {user && !dashboardLocation && (
                <nav className="hidden md:flex items-center">
                  <Link
                    to="/"
                    className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/80"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </nav>
              )}
            </div>

            {/* Right side - Corporate actions */}
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  {/* Notifications */}
                  <button className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors group">
                    <Bell className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-400 rounded-full ring-2 ring-slate-950" />
                  </button>

                  {/* Profile Dropdown */}
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

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowProfileMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden z-50">
                          <div className="p-2">
                            <div className="px-3 py-2 mb-1 border-b border-slate-800">
                              <p className="text-xs text-slate-500">
                                Signed in as
                              </p>
                              <p className="text-sm font-medium text-white truncate">
                                {user.username}
                              </p>
                            </div>

                            <div className="border-t border-slate-800 my-1" />

                            <button
                              onClick={() => {
                                signOut();
                                setShowProfileMenu(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
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
