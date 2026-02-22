import Layout from "../components/Layout";
import { DashboardNavCard } from "../components/DashboardNavCard";
import { HasRole } from "../components/HasRole";
import {
  Activity,
  Users,
  Package,
  CheckCircle,
  Shield,
  Settings,
  UserCog,
  ClipboardList,
  Building2,
  Laptop,
  Key,
  HardDrive,
  Wrench,
  Fingerprint,
  BarChart3,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const stats = {
    systemStatus: "Operational",
    activeUsers: 24,
    totalAssets: 156,
    assignedAssets: 142,
    availableAssets: 14,
    pendingActions: 3,
    expiringLicenses: 5,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header with Corporate Style */}
        <div className="mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Corporate Dashboard
              </h1>
              <p className="mt-2 text-slate-400 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-blue-400" />
                Enterprise Resource Overview & Module Access
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-lg">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards - Enhanced Corporate Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="group relative overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Live
                </span>
              </div>
              <div className="mt-3">
                <p className="text-sm text-slate-400">System Status</p>
                <p className="text-xl font-semibold text-white mt-1">
                  {stats.systemStatus}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  All systems operational
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800 rounded-xl p-5 hover:border-purple-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div className="mt-3">
                <p className="text-sm text-slate-400">Active Users</p>
                <div className="flex items-baseline mt-1">
                  <p className="text-xl font-semibold text-white">
                    {stats.activeUsers}
                  </p>
                  <span className="ml-2 text-xs text-green-400">+12%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Currently online</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800 rounded-xl p-5 hover:border-amber-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Package className="w-5 h-5 text-amber-400" />
              </div>
              <div className="mt-3">
                <p className="text-sm text-slate-400">Asset Inventory</p>
                <p className="text-xl font-semibold text-white mt-1">
                  {stats.totalAssets}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-green-400">
                    {stats.assignedAssets} assigned
                  </span>
                  <span className="text-xs text-slate-600">•</span>
                  <span className="text-xs text-yellow-400">
                    {stats.availableAssets} available
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800 rounded-xl p-5 hover:border-red-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="mt-3">
                <p className="text-sm text-slate-400">Action Required</p>
                <p className="text-xl font-semibold text-white mt-1">
                  {stats.pendingActions}
                </p>
                <p className="text-xs text-red-400 mt-1">
                  {stats.expiringLicenses} licenses expiring
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Module Access Sections */}
        <div className="space-y-8">
          {/* Administration Section */}
          <div>
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-blue-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">
                Administration & Security
              </h2>
              <div className="ml-4 flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <HasRole roles={["admin"]}>
                <DashboardNavCard
                  to="/settings/permissions"
                  title="User Permissions"
                  description="Configure access per module and manage role-based permissions"
                  icon={<Shield className="w-6 h-6 text-blue-400" />}
                  badge="Admin"
                />
              </HasRole>

              <HasRole roles={["admin"]}>
                <DashboardNavCard
                  to="/settings/modules"
                  title="Modules"
                  description="Configure system modules, features, and available actions"
                  icon={<Settings className="w-6 h-6 text-purple-400" />}
                  badge="Admin"
                />
              </HasRole>

              <HasRole roles={["admin"]}>
                <DashboardNavCard
                  to="/admin/users"
                  title="User Management"
                  description="Create, edit, and manage system users (admin only)"
                  icon={<UserCog className="w-6 h-6 text-amber-400" />}
                  badge="Admin"
                />
              </HasRole>
            </div>
          </div>

          {/* Monitoring & Directory Section */}
          <div>
            <div className="flex items-center mb-4">
              <Building2 className="w-5 h-5 text-purple-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">
                Monitoring & Directory
              </h2>
              <div className="ml-4 flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <HasRole roles={["admin", "auditor"]}>
                <DashboardNavCard
                  to="/audit"
                  title="Audit Trail"
                  description="View detailed system activity and user action logs"
                  icon={<ClipboardList className="w-6 h-6 text-green-400" />}
                  badge="Auditor"
                />
              </HasRole>

              <HasRole roles={["admin", "auditor"]}>
                <DashboardNavCard
                  to="/employees"
                  title="Employees"
                  description="Manage employee directory, departments, and positions"
                  icon={<Building2 className="w-6 h-6 text-indigo-400" />}
                  badge="Staff"
                />
              </HasRole>
            </div>
          </div>

          {/* Asset Management Section */}
          <div>
            <div className="flex items-center mb-4">
              <Laptop className="w-5 h-5 text-green-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">
                Asset & License Management
              </h2>
              <div className="ml-4 flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <HasRole roles={["admin", "auditor", "staff"]}>
                <DashboardNavCard
                  to="/assets"
                  title="Assets"
                  description="Manage inventory, track assignments, and monitor asset status"
                  icon={<Laptop className="w-6 h-6 text-blue-400" />}
                  badge="All"
                />
              </HasRole>

              <HasRole roles={["admin", "auditor", "staff"]}>
                <DashboardNavCard
                  to="/licenses"
                  title="Licenses"
                  description="Manage software licenses, seats, and expirations"
                  icon={<Key className="w-6 h-6 text-amber-400" />}
                  badge="All"
                />
              </HasRole>

              <HasRole roles={["admin", "auditor", "staff"]}>
                <DashboardNavCard
                  to="/repairs"
                  title="Repairs"
                  description="Track service requests, costs & warranty claims"
                  icon={<Wrench className="w-6 h-6 text-red-400" />}
                  badge="All"
                />
              </HasRole>
            </div>
          </div>

          {/* Biometrics Section */}
          <div>
            <div className="flex items-center mb-4">
              <Fingerprint className="w-5 h-5 text-cyan-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">
                Biometrics & Access Control
              </h2>
              <div className="ml-4 flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <HasRole roles={["admin", "auditor", "staff"]}>
                <DashboardNavCard
                  to="/fingerprints/enrollments"
                  title="Fingerprint Enrollments"
                  description="Assign personnel and manage biometric HR forms"
                  icon={<Fingerprint className="w-6 h-6 text-cyan-400" />}
                  badge="All"
                />
              </HasRole>

              <HasRole roles={["admin", "auditor", "staff"]}>
                <DashboardNavCard
                  to="/fingerprints/machines"
                  title="Fingerprint Machines"
                  description="Monitor device locations and system status"
                  icon={<HardDrive className="w-6 h-6 text-purple-400" />}
                  badge="All"
                />
              </HasRole>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-12 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-4">
              <span>© 2024 ITRoom Enterprise</span>
              <span>•</span>
              <span>v2.1.0</span>
              <span>•</span>
              <span>Last sync: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Connected</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
