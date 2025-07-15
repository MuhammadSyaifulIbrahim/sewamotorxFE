import { Routes, Route, Navigate } from "react-router-dom";
import LandingPages from "../pages/user/LandingPages";
import Dashboard from "../pages/admin/Dashboard";
import Penyewaan from "../pages/admin/Penyewaan";
import Kendaraan from "../pages/admin/Kendaraan";
import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing/Home */}
      <Route path="/" element={<LandingPages />} />

      {/* Redirect /login ke home, karena login via modal */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      {/* (Kalau ada /register juga, redirect ke home/landing) */}
      {/* <Route path="/register" element={<Navigate to="/" replace />} /> */}

      {/* Admin Section (diproteksi) */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/penyewaan"
        element={
          <PrivateRoute>
            <Penyewaan />
          </PrivateRoute>
        }
      />
      <Route
        path="/kendaraan"
        element={
          <PrivateRoute>
            <Kendaraan />
          </PrivateRoute>
        }
      />

      {/* Fallback jika akses route tidak dikenal */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
