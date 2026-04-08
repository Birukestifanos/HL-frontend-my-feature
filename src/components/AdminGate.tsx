import { Outlet } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";

export function AdminGate() {
  const { isAuthenticated } = useAdminAuth();
  return isAuthenticated ? <Outlet /> : <AdminLoginPage />;
}
