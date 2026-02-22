// pages/AdminUsers.tsx
import React, { useState } from "react";
import { getAccessToken } from "../lib/auth";
import { apiFetch } from "../lib/api";
import Layout from "../components/Layout";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Eye,
  EyeOff,
  Briefcase,
  Key,
} from "lucide-react";

type Role = "admin" | "auditor" | "staff";
type UserDTO = {
  username: string;
  role: string;
};

export default function AdminUsers() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setIsSubmitting(true);

    const token = getAccessToken();
    if (!token) {
      setErr("No access token. Please login again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await apiFetch<{ user: UserDTO }>("/api/users", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username, email, password, role }),
      });

      setMsg(
        `User created successfully: ${data.user.username} (${data.user.role})`,
      );
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("staff");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  }

  const getRoleIcon = (selectedRole: Role) => {
    switch (selectedRole) {
      case "admin":
        return <Shield className="w-5 h-5 text-red-400" />;
      case "auditor":
        return <Eye className="w-5 h-5 text-blue-400" />;
      case "staff":
        return <Briefcase className="w-5 h-5 text-green-400" />;
    }
  };

  const getRoleDescription = (selectedRole: Role) => {
    switch (selectedRole) {
      case "admin":
        return "Full system access, user management, and configuration";
      case "auditor":
        return "Read-only access across all modules for compliance";
      case "staff":
        return "Standard access to assigned modules and features";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <UserPlus className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Create User
                    </h1>
                    <p className="mt-2 text-slate-400 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-amber-400" />
                      Admin-only user creation and role assignment
                    </p>
                  </div>
                </div>
              </div>

              {/* Role Summary */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-xs text-slate-500">Current role:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {getRoleIcon(role)}
                  <span className="ml-1 capitalize">{role}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Card */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
                {/* Card Header */}
                <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-semibold text-white">
                      New User Details
                    </h2>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={createUser} className="p-6 space-y-5">
                  {/* Username Field */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      Username <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="johndoe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="email"
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-12 py-2.5 text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
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
                    <p className="flex items-center text-xs text-slate-500 mt-1.5">
                      <Info className="w-3 h-3 mr-1 text-slate-600" />
                      Minimum 8 characters. Use a strong password with letters,
                      numbers, and symbols.
                    </p>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      User Role <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                      {(["staff", "auditor", "admin"] as Role[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`relative p-4 rounded-lg border transition-all ${
                            role === r
                              ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50 ring-1 ring-amber-500/50"
                              : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center space-y-2">
                            {r === "admin" && (
                              <Shield
                                className={`w-6 h-6 ${role === r ? "text-red-400" : "text-slate-500"}`}
                              />
                            )}
                            {r === "auditor" && (
                              <Eye
                                className={`w-6 h-6 ${role === r ? "text-blue-400" : "text-slate-500"}`}
                              />
                            )}
                            {r === "staff" && (
                              <Briefcase
                                className={`w-6 h-6 ${role === r ? "text-green-400" : "text-slate-500"}`}
                              />
                            )}
                            <span
                              className={`text-sm font-medium capitalize ${role === r ? "text-white" : "text-slate-400"}`}
                            >
                              {r}
                            </span>
                          </div>
                          {role === r && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="w-4 h-4 text-amber-400" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                      <div className="flex items-start space-x-2">
                        <div className="p-1 bg-slate-800 rounded-lg mt-0.5">
                          {getRoleIcon(role)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-300 capitalize">
                            {role} Access
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {getRoleDescription(role)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {msg && (
                    <div className="group relative overflow-hidden rounded-lg border border-emerald-800/50 bg-gradient-to-br from-emerald-950/30 to-slate-950/30 p-4">
                      <div className="absolute inset-0 bg-emerald-500/5" />
                      <div className="relative flex items-start space-x-3">
                        <div className="p-1 bg-emerald-500/10 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-emerald-300">{msg}</p>
                        </div>
                        <button
                          onClick={() => setMsg(null)}
                          className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  )}

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
                        <button
                          onClick={() => setErr(null)}
                          className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating User...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Create User</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar - Role Information */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden sticky top-24">
                <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Key className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Role Information
                    </h3>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Admin Role */}
                  <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-800 hover:border-red-500/30 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-1.5 bg-red-500/10 rounded-lg">
                        <Shield className="w-4 h-4 text-red-400" />
                      </div>
                      <span className="font-medium text-white">
                        Administrator
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Full system access including user management, module
                      configuration, and permission assignments. Can create,
                      edit, and delete any resource.
                    </p>
                  </div>

                  {/* Auditor Role */}
                  <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-800 hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        <Eye className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="font-medium text-white">Auditor</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Read-only access across all modules for compliance
                      monitoring and audit purposes. Cannot modify or create any
                      data.
                    </p>
                  </div>

                  {/* Staff Role */}
                  <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-800 hover:border-green-500/30 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-1.5 bg-green-500/10 rounded-lg">
                        <Briefcase className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="font-medium text-white">Staff</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Standard operational access to assigned modules. Can
                      perform actions based on role-specific permissions
                      (create, edit, view).
                    </p>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <h4 className="text-sm font-medium text-amber-300 mb-2 flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Security Requirements
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-400">
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                        Minimum 8 characters
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                        At least one uppercase letter
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                        At least one number
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                        At least one special character
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="font-medium text-amber-400">
                  Security Notice:
                </span>{" "}
                All user creation events are logged in the audit trail. Users
                will receive a welcome email with instructions to set up their
                account and change their password on first login.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
