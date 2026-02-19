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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
