import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBox,
  FiClipboard,
  FiUsers,
  FiLogOut,
  FiTruck,
  FiActivity,
  FiMenu,
  FiX,
  FiMap, // Ikon baru untuk Tracking Kendaraan
} from "react-icons/fi";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navs = [
    { to: "/admin/dashboard", icon: <FiHome />, label: "Dashboard" },
    { to: "/admin/produk", icon: <FiBox />, label: "Kelola Produk" },
    { to: "/admin/pesanan", icon: <FiClipboard />, label: "Kelola Pesanan" },
    { to: "/admin/user", icon: <FiUsers />, label: "Kelola User" },
    { to: "/admin/pengiriman", icon: <FiTruck />, label: "Pengiriman Motor" },
    { to: "/admin/tracking", icon: <FiMap />, label: "Tracking Kendaraan" }, // ✅ dipindah ke atas
    {
      to: "/admin/log-aktivitas",
      icon: <FiActivity />,
      label: "Log Aktivitas",
    },
  ];

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 text-base group
      ${
        isActive
          ? "bg-white shadow text-blue-700 font-bold"
          : "text-blue-100 hover:bg-blue-600/50 hover:text-white"
      }`;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Mobile Hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-700 text-white p-2 rounded-xl shadow-lg"
        onClick={() => setSidebarOpen(true)}
        aria-label="Buka Menu"
      >
        <FiMenu size={28} />
      </button>

      {/* Sidebar */}
      <div>
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup Sidebar"
          />
        )}
        <aside
          className={`
            fixed md:static z-50 top-0 left-0 h-full bg-gradient-to-b from-blue-800 to-blue-700
            shadow-2xl rounded-r-3xl flex flex-col px-7 py-8 space-y-10
            transition-transform duration-300
            w-[82vw] max-w-xs md:w-72
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }
          `}
        >
          {/* Close Button - mobile only */}
          <button
            className="md:hidden absolute top-3 right-3 bg-blue-700 text-white p-1.5 rounded-full"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup Menu"
          >
            <FiX size={28} />
          </button>

          {/* Brand */}
          <div className="flex items-center gap-3 mb-5 pl-2 mt-4 md:mt-0">
            <span className="text-3xl bg-white/30 p-2 rounded-xl shadow-lg">
              🛵
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-wide">
              MotoRent Admin
            </h2>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mt-2">
            {navs.map((nav) => (
              <NavLink
                key={nav.to}
                to={nav.to}
                className={navItemClass}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-xl group-hover:scale-110 transition">
                  {nav.icon}
                </span>
                <span>{nav.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="mt-auto space-y-5 pb-8 md:pb-0">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-red-500 to-pink-400 hover:from-red-600 hover:to-pink-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition"
            >
              <FiLogOut className="text-xl" /> Logout
            </button>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-3 rounded-xl shadow-inner text-white">
              <FiUsers className="text-lg" />
              <span className="text-sm">
                Halo Admin, semangat kerjanya{" "}
                <span className="animate-pulse">❤️</span>
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-2 md:p-10 transition-all min-w-0">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
