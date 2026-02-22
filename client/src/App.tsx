import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoutes } from "./context/ProtectedRoutes";
import { RoleRoute } from "./context/RoleRoute";

import Login from "./pages/Login";
import Permissions from "./pages/Permissions";
import Modules from "./pages/Modules";
import Dashboard from "./pages/Dashboard";
import AdminUsers from "./pages/AdminUsers";
import Audit from "./pages/Audit";
import Employees from "./pages/Employees";
import Assets from "./pages/Assets";
import AssetDetail from "./pages/AssetsDetail";
import AssetCreate from "./pages/AssetCreate";
import Licenses from "./pages/Licenses";
import LicenseCreate from "./pages/LicenseCreate";
import LicenseDetail from "./pages/LicenseDetails";
import Repairs from "./pages/Repairs";
import RepairUpsert from "./pages/RepairUpsert";
import RepairDetail from "./pages/RepairDetail";
import FingerprintEnrollmentDetail from "./pages/FingerprintEnrollmentDetail";
import FingerprintEnrollmentCreate from "./pages/FingerprintEnrollmentCreate";
import FingerprintEnrollments from "./pages/FingerprintEnrollments";
import FingerprintMachines from "./pages/FingerprintMachines";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoutes>
                <Dashboard />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/admin/users"
            element={
              <RoleRoute allow={["admin"]}>
                <AdminUsers />
              </RoleRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <RoleRoute allow={["admin", "auditor"]}>
                <Audit />
              </RoleRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <RoleRoute allow={["admin"]}>
                <Employees />
              </RoleRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <RoleRoute allow={["admin", "auditor", "staff"]}>
                <Assets />
              </RoleRoute>
            }
          />

          <Route
            path="/assets/:id"
            element={
              <RoleRoute allow={["admin", "auditor", "staff"]}>
                <AssetDetail />
              </RoleRoute>
            }
          />

          <Route
            path="/assets/new"
            element={
              <RoleRoute allow={["admin"]}>
                <AssetCreate />
              </RoleRoute>
            }
          />
          <Route
            path="/settings/permissions"
            element={
              <RoleRoute allow={["admin"]}>
                <Permissions />
              </RoleRoute>
            }
          />
          <Route
            path="/settings/modules"
            element={
              <RoleRoute allow={["admin"]}>
                <Modules />
              </RoleRoute>
            }
          />
          <Route
            path="/licenses"
            element={
              <RoleRoute allow={["admin", "auditor", "staff"]}>
                <Licenses />
              </RoleRoute>
            }
          />

          <Route
            path="/licenses/new"
            element={
              <RoleRoute allow={["admin"]}>
                <LicenseCreate />
              </RoleRoute>
            }
          />

          <Route
            path="/licenses/:id"
            element={
              <RoleRoute allow={["admin", "auditor", "staff"]}>
                <LicenseDetail />
              </RoleRoute>
            }
          />
          <Route
            path="/repairs"
            element={
              <RoleRoute allow={["admin", "auditor", "staff"]}>
                <Repairs />
              </RoleRoute>
            }
          />

          <Route
            path="/repairs/new"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <RepairUpsert />
              </RoleRoute>
            }
          />

          <Route
            path="/repairs/:id"
            element={
              <RoleRoute allow={["admin", "auditor", "staff"]}>
                <RepairDetail />
              </RoleRoute>
            }
          />

          <Route
            path="/repairs/:id/edit"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <RepairUpsert />
              </RoleRoute>
            }
          />

          <Route
            path="/fingerprints/machines"
            element={
              <RoleRoute allow={["admin", "auditor", "staff"]}>
                <FingerprintMachines />
              </RoleRoute>
            }
          />

          <Route
            path="/fingerprints/enrollments"
            element={
              <RoleRoute allow={["admin", "auditor", "staff"]}>
                <FingerprintEnrollments />
              </RoleRoute>
            }
          />

          <Route
            path="/fingerprints/enrollments/new"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <FingerprintEnrollmentCreate />
              </RoleRoute>
            }
          />

          <Route
            path="/fingerprints/enrollments/:id"
            element={
              <RoleRoute allow={["admin", "auditor", "staff"]}>
                <FingerprintEnrollmentDetail />
              </RoleRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
