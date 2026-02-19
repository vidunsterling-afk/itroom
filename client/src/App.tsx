import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoutes } from "./context/ProtectedRoutes";
import { RoleRoute } from "./context/RoleRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminUsers from "./pages/AdminUsers";
import Audit from "./pages/Audit";

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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
