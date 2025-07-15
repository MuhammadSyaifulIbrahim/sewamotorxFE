import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// USER
import LandingPages from "./pages/user/LandingPages";
import DashboardUser from "./pages/user/DashboardUser";
import HistoryUser from "./pages/user/HistoryUser";
import DetailPenyewaan from "./pages/user/DetailPenyewaan";
import Verify from "./pages/auth/Verify";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// ADMIN
import DashboardAdmin from "./pages/admin/Dashboard";
import KelolaProduk from "./pages/admin/KelolaProduk";
import KelolaPesanan from "./pages/admin/KelolaPesanan";
import KelolaUser from "./pages/admin/KelolaUser";
import AdminLogPage from "./pages/admin/AdminLogPage";
import PengirimanMotor from "./pages/admin/PengirimanMotor";
import TrackingPage from "./pages/admin/TrackingPage"; // ✅ Tambah ini

// ROUTE GUARDS
import AdminRoute from "./components/AdminRoute";
import UserRoute from "./components/UserRoute";

export default function App() {
  return (
    <Routes>
      {/* === PUBLIC ROUTES === */}
      <Route path="/" element={<LandingPages />} />

      {/* === ADMIN ROUTES === */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <DashboardAdmin />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/produk"
        element={
          <AdminRoute>
            <KelolaProduk />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/pesanan"
        element={
          <AdminRoute>
            <KelolaPesanan />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/kendaraan"
        element={<Navigate to="/admin/produk" replace />}
      />
      <Route
        path="/admin/user"
        element={
          <AdminRoute>
            <KelolaUser />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tracking"
        element={
          <AdminRoute>
            <TrackingPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/pengiriman"
        element={
          <AdminRoute>
            <PengirimanMotor />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/log-aktivitas"
        element={
          <AdminRoute>
            <AdminLogPage />
          </AdminRoute>
        }
      />

      {/* === USER ROUTES === */}
      <Route
        path="/dashboard"
        element={
          <UserRoute>
            <DashboardUser />
          </UserRoute>
        }
      />
      <Route path="/dashboard/history" element={<HistoryUser />} />
      <Route path="/dashboard/history/:id" element={<DetailPenyewaan />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* === 404 NOT FOUND === */}
      <Route
        path="*"
        element={
          <h1 className="text-center mt-40 text-xl font-bold text-red-600">
            404 – Halaman tidak ditemukan
          </h1>
        }
      />
    </Routes>
  );
}
