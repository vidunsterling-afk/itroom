import { useAuth } from "../context/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, LogOut, User, ChevronDown, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { Send as SendAnimated } from "./animate-ui/icons/send";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefreshCw,
  AlertCircle,
  Inbox,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";

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
  const [notiCount, setNotiCount] = useState<number | 0>(0);

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

      setNotiCount(data.total);
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

  // -------- motion variants (smooth open/close) --------
  const menuMotion = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.98 },
  } as const;

  const menuTransition = {
    duration: 0.18,
    ease: [0.2, 0.8, 0.2, 1],
  } as const;

  const backdropMotion = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  } as const;

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
                        if (next) loadEmailLogs(10);
                      }}
                      className="relative p-2 rounded-lg hover:bg-slate-800/70 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
                      aria-label="Notifications"
                      aria-expanded={showNotifMenu}
                    >
                      <SendAnimated className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" />

                      {/* Notification indicator - shows if there are failed emails OR unread count */}
                      {(notifItems.some((x) => x.status === "FAILED") ||
                        notiCount > 0) && (
                        <span className="absolute top-1.5 right-1.5 flex">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400/75 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 ring-2 ring-slate-950"></span>
                          </span>
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {showNotifMenu && (
                        <>
                          {/* Backdrop */}
                          <motion.div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowNotifMenu(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          />

                          {/* Menu */}
                          <motion.div
                            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-xl bg-slate-900 border border-slate-800/50 shadow-2xl overflow-hidden z-50 backdrop-blur-sm"
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            style={{ transformOrigin: "top right" }}
                          >
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/95">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-200">
                                  Email Logs
                                </p>
                                {notiCount > 0 && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {notiCount} new
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => loadEmailLogs(10)}
                                className="text-xs px-2 py-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors flex items-center gap-1"
                                disabled={notifLoading}
                              >
                                <RefreshCw
                                  className={`w-3 h-3 ${notifLoading ? "animate-spin" : ""}`}
                                />
                                Refresh
                              </button>
                            </div>

                            {/* Body */}
                            <div className="max-h-96 overflow-y-auto overscroll-contain">
                              {notifLoading ? (
                                <div className="flex flex-col items-center justify-center py-8 px-4">
                                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3" />
                                  <p className="text-sm text-slate-400">
                                    Loading logs...
                                  </p>
                                </div>
                              ) : notifErr ? (
                                <div className="p-4 text-center">
                                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 mb-3">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                  </div>
                                  <p className="text-sm text-red-400 mb-2">
                                    Failed to load
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {notifErr}
                                  </p>
                                  <button
                                    onClick={() => loadEmailLogs(10)}
                                    className="mt-3 text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2"
                                  >
                                    Try again
                                  </button>
                                </div>
                              ) : notifItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 px-4">
                                  <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                                    <Inbox className="w-5 h-5 text-slate-500" />
                                  </div>
                                  <p className="text-sm text-slate-400">
                                    No email logs yet
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Sent emails will appear here
                                  </p>
                                </div>
                              ) : (
                                <div className="divide-y divide-slate-800/50">
                                  {notifItems.map((n, index) => (
                                    <motion.div
                                      key={n._id}
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.03 }}
                                      className="p-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                                      onClick={() => {
                                        // Optional: handle click on individual log
                                        console.log("View log:", n._id);
                                      }}
                                    >
                                      <div className="flex items-start gap-3">
                                        {/* Status icon */}
                                        <div
                                          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                            n.status === "SENT"
                                              ? "bg-emerald-500/10"
                                              : "bg-red-500/10"
                                          }`}
                                        >
                                          {n.status === "SENT" ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                          ) : (
                                            <XCircle className="w-4 h-4 text-red-400" />
                                          )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium text-slate-200 truncate">
                                              {n.subject || "(No subject)"}
                                            </p>
                                            <span
                                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                                                n.status === "SENT"
                                                  ? "text-emerald-300 bg-emerald-500/10 border border-emerald-500/20"
                                                  : "text-red-300 bg-red-500/10 border border-red-500/20"
                                              }`}
                                            >
                                              {n.status}
                                            </span>
                                          </div>

                                          <p className="text-xs text-slate-500 truncate mt-0.5">
                                            To:{" "}
                                            {n.to?.join(", ") ||
                                              "No recipients"}
                                          </p>

                                          {n.status === "FAILED" && n.error && (
                                            <p className="text-xs text-red-400 line-clamp-2 mt-1.5 bg-red-500/5 p-1.5 rounded">
                                              {n.error}
                                            </p>
                                          )}

                                          <p className="text-[10px] text-slate-600 mt-1.5">
                                            {new Date(
                                              n.createdAt,
                                            ).toLocaleString(undefined, {
                                              month: "short",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Footer */}
                            {notifItems.length > 0 && (
                              <div className="px-3 py-2 border-t border-slate-800/50 bg-slate-900/95 flex justify-between items-center">
                                <span className="text-xs text-slate-500">
                                  {notifItems.length} log
                                  {notifItems.length !== 1 ? "s" : ""}
                                </span>
                                <button
                                  onClick={() => {
                                    // navigate to full email logs page
                                    setShowNotifMenu(false);
                                  }}
                                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
                                >
                                  View all
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
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

                    <AnimatePresence>
                      {showProfileMenu && (
                        <>
                          <motion.div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowProfileMenu(false)}
                            variants={backdropMotion}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.12, ease: "easeOut" }}
                          />

                          <motion.div
                            className="absolute right-0 mt-4 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden z-50"
                            variants={menuMotion}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={menuTransition}
                            style={{ transformOrigin: "top right" }}
                          >
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
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
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
