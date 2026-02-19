import { useAuth } from "../context/useAuth";
import { DashboardNavCard } from "../components/DashboardNavCard";
import { HasRole } from "../components/HasRole";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Welcome, <span className="text-slate-200">{user?.username}</span>{" "}
              — role: <span className="text-slate-200">{user?.role}</span>
            </p>
          </div>

          <button
            onClick={() => signOut()}
            className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <HasRole roles={["admin"]}>
            <DashboardNavCard
              to="/settings/permissions"
              title="User Permissions"
              description="Configure access per module"
            />
          </HasRole>
          <HasRole roles={["admin"]}>
            <DashboardNavCard
              to="/settings/modules"
              title="Modules"
              description="Configure system modules + actions"
            />
          </HasRole>
          <HasRole roles={["admin"]}>
            <DashboardNavCard
              to="/admin/users"
              title="User Management"
              description="Create users (admin only)"
            />
          </HasRole>

          <HasRole roles={["admin", "auditor"]}>
            <DashboardNavCard
              to="/audit"
              title="Audit Trail"
              description="View tracked activity"
            />
          </HasRole>
          <HasRole roles={["admin", "auditor"]}>
            <DashboardNavCard
              to="/employees"
              title="Employees"
              description="Manage employee directory"
            />
          </HasRole>
          <HasRole roles={["admin", "auditor", "staff"]}>
            <DashboardNavCard
              to="/assets"
              title="Assets"
              description="Manage inventory and assignments"
            />
          </HasRole>
        </div>
      </div>
    </div>
  );
}
