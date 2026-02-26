import { useAuth } from "../context/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, LogOut, User, ChevronDown, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Bell } from "./animate-ui/icons/bell";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardLocation = location.pathname === "/";
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifErr, setNotifErr] = useState<string | null>(null);
  const [hasNot, setHasNot] = useState(false);

  type EmailLogItem = {
    _id: string;
    subject: string;
    status: "SENT" | "FAILED";
    to: string[];
    cc: string[];
    error?: string;
    createdAt: string;
  };

  const [notifItems, setNotifItems] = useState<EmailLogItem[]>([]);

  useEffect(() => {
    loadEmailLogCounts();
  }, []);

  async function loadEmailLogCounts() {
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token. Please login again.");

      const data = await apiFetch<{
        total: number;
        sent: number;
        failed: number;
      }>(`/api/email-logs/counts`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setHasNot(data.total > 0);
    } catch (e: unknown) {
      console.error(
        e instanceof Error ? e.message : "Failed to load email log counts",
      );
    }
  }

  async function loadEmailLogs(limit = 10) {
    setNotifLoading(true);
    setNotifErr(null);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token. Please login again.");

      const data = await apiFetch<{ items: EmailLogItem[] }>(
        `/api/email-logs?limit=${limit}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setNotifItems(data.items || []);
    } catch (e: unknown) {
      setNotifErr(
        e instanceof Error ? e.message : "Failed to load notifications",
      );
    } finally {
      setNotifLoading(false);
    }
  }

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
                  <div className="relative">
                    <button
                      onClick={() => {
                        const next = !showNotifMenu;
                        setShowNotifMenu(next);
                        if (next) loadEmailLogs(10); // fetch when opening
                      }}
                      className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors group"
                      aria-label="Notifications"
                    >
                      <Bell
                        className="w-5 h-5 text-slate-400 group-hover:text-slate-300"
                        animate
                        loop={hasNot}
                      />

                      {/* Optional: blue dot if any FAILED in last fetch */}
                      {notifItems.some((x) => x.status === "FAILED") && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-400 rounded-full ring-2 ring-slate-950" />
                      )}
                    </button>

                    {showNotifMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowNotifMenu(false)}
                        />

                        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden z-50">
                          {/* Header */}
                          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-200">
                              Email Logs
                            </p>
                            <button
                              onClick={() => loadEmailLogs(10)}
                              className="text-xs text-slate-400 hover:text-slate-200"
                            >
                              Refresh
                            </button>
                          </div>

                          {/* Body */}
                          <div className="max-h-80 overflow-auto">
                            {notifLoading ? (
                              <div className="p-3 text-sm text-slate-400">
                                Loading...
                              </div>
                            ) : notifErr ? (
                              <div className="p-3 text-sm text-red-400">
                                {notifErr}
                              </div>
                            ) : notifItems.length === 0 ? (
                              <div className="p-3 text-sm text-slate-400">
                                No logs yet.
                              </div>
                            ) : (
                              <div className="p-2 space-y-1">
                                {notifItems.map((n) => (
                                  <div
                                    key={n._id}
                                    className="rounded-lg border border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/30 transition-colors p-2"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="text-sm text-slate-200 truncate">
                                          {n.subject}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                          To: {n.to?.join(", ") || "-"}
                                        </p>
                                      </div>

                                      <span
                                        className={[
                                          "text-[11px] px-2 py-0.5 rounded-full border",
                                          n.status === "SENT"
                                            ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
                                            : "text-red-300 border-red-500/30 bg-red-500/10",
                                        ].join(" ")}
                                      >
                                        {n.status}
                                      </span>
                                    </div>

                                    {n.status === "FAILED" && n.error ? (
                                      <p className="mt-1 text-xs text-red-400 line-clamp-2">
                                        {n.error}
                                      </p>
                                    ) : null}

                                    <p className="mt-1 text-[11px] text-slate-500">
                                      {new Date(n.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="px-3 py-2 border-t border-slate-800 flex justify-end">
                            <button
                              onClick={() => {
                                // optional: navigate to a full email log page
                                // navigate("/email-logs");
                                setShowNotifMenu(false);
                              }}
                              className="text-xs text-slate-400 hover:text-slate-200"
                            >
                              View all
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

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
