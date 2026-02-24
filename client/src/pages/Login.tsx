import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  Building2,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  User,
} from "lucide-react";

export default function Login() {
  const { signIn, loading } = useAuth();
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      await signIn(identifier.trim(), password);
      nav("/", { replace: true });
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr("Login failed. Please check your credentials.");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-800/25 [mask-image:linear-gradient(0deg,transparent,black)]" />

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

        <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-sm p-8 shadow-2xl">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <div className="relative p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-slate-700">
                  <Building2 className="w-10 h-10 text-blue-400" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              ITRoom
            </h1>
            <p className="text-slate-400 mt-2 flex items-center justify-center">
              <Shield className="w-4 h-4 mr-2 text-blue-400" />
              Secure access to your IT management suite
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Username/Email Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">
                Username or Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  className="w-full rounded-lg bg-slate-950/50 border border-slate-800 pl-10 pr-4 py-3 text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="john.doe@company.com"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-lg bg-slate-950/50 border border-slate-800 pl-10 pr-12 py-3 text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {err && (
              <div className="group relative overflow-hidden rounded-lg border border-red-800/50 bg-gradient-to-br from-red-950/30 to-slate-950/30 p-4">
                <div className="absolute inset-0 bg-red-500/5" />
                <div className="relative flex items-start space-x-3">
                  <div className="p-1 bg-red-500/10 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-300">{err}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-lg bg-slate-950/90 group-hover:bg-slate-950/70 transition-all">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-blue-400 font-medium">
                      Signing in...
                    </span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400 font-medium">Sign In</span>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="mt-4 text-center text-xs text-slate-600">
              Accounts are provisioned by system administrators.
              <br />
              Need access? Contact your IT department.
            </p>
          </div>

          {/* Version */}
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 rounded-md bg-slate-800/50 text-xs text-slate-500 border border-slate-700">
              v2.1.0
            </span>
          </div>
        </div>

        {/* Corporate Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-600">
            © 2024 ITRoom Enterprise. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
