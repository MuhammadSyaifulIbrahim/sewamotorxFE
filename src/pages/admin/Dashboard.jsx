import React, { useEffect, useState, useCallback, useRef } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import API from "../../api/axios";
import {
  FaMotorcycle,
  FaUsers,
  FaClipboardList,
  FaMoneyBillWave,
  FaBell,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useDashboardRefresh } from "../../context/DashboardContext";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

// Short month helper
const shortMonth = (m) =>
  ({
    Januari: "Jan",
    Februari: "Feb",
    Maret: "Mar",
    April: "Apr",
    Mei: "Mei",
    Juni: "Jun",
    Juli: "Jul",
    Agustus: "Agu",
    September: "Sep",
    Oktober: "Okt",
    November: "Nov",
    Desember: "Des",
  }[m] || m);

// Card Statistik
const StatCard = ({ Icon, iconBg, color, label, value }) => (
  <div className="flex items-center gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-lg h-full transition-all group hover:shadow-2xl hover:scale-[1.03] min-w-[140px]">
    <div
      className={`p-3 sm:p-4 rounded-xl ${iconBg} flex items-center justify-center shadow-inner`}
    >
      <Icon className={`text-xl sm:text-2xl md:text-3xl ${color}`} />
    </div>
    <div>
      <p className="text-xs sm:text-sm text-gray-400 font-medium whitespace-nowrap">
        {label}
      </p>
      <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-700 group-hover:text-blue-700 transition">
        {value ?? 0}
      </h2>
    </div>
  </div>
);

export default function AdminDashboard() {
  const token = localStorage.getItem("token");
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [recent, setRecent] = useState([]);
  const [late, setLate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NOTIFIKASI ADMIN STATE
  const [notifList, setNotifList] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);

  const socketRef = useRef(null);

  const { refreshKey, triggerRefresh } = useDashboardRefresh();

  // Load Dashboard Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [s, c, p, r, l] = await Promise.all([
        API.get("/dashboard/stats"),
        API.get("/dashboard/statistik-bulanan"),
        API.get("/dashboard/pendapatan-bulanan"),
        API.get("/dashboard/aktivitas"),
        API.get("/dashboard/terlambat").then((res) => res.data ?? []),
      ]);

      const mapLabel = (arr) =>
        Array.isArray(arr)
          ? arr.map((d) => ({ ...d, bulan: shortMonth(d.bulan) }))
          : [];

      setStats(s.data);
      setChartData(mapLabel(c.data));
      setIncomeData(mapLabel(p.data));
      setRecent(r.data || []);
      setLate(l);
      setError(null);
    } catch (e) {
      setError(e.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Notifikasi Admin dari backend
  const loadNotifikasiAdmin = useCallback(async () => {
    if (!token) return;
    try {
      const res = await API.get("/notifikasi-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      setNotifList(data);
      setNotifCount(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch admin notifications", err);
    }
  }, [token]);

  // Effect load dashboard & notif
  useEffect(() => {
    loadData();
    loadNotifikasiAdmin();
  }, [loadData, loadNotifikasiAdmin, refreshKey]);

  // Setup socket.io and listen notifikasi-admin event
  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("notifikasi-admin", (notif) => {
      setNotifList((prev) => [notif, ...prev]);
      setNotifCount((count) => count + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Handle buka/tutup notif dropdown
  const handleToggleNotif = () => {
    setShowNotif((open) => {
      // Jika membuka dropdown, tandai semua sudah dibaca di backend & update state
      if (!open && notifCount > 0) {
        API.post("/notifikasi-admin/mark-read-all", null, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(() => {
            setNotifList((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setNotifCount(0);
          })
          .catch(() => {
            // Jika error, biarkan notifCount tetap
          });
      }
      return !open;
    });
  };

  // Handle klik satu notif: mark as read dan redirect ke kelolapesanan
  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await API.put(`/notifikasi-admin/${notif.id}/read`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifList((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setNotifCount((count) => Math.max(count - 1, 0));
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }
    setShowNotif(false);
    window.location.href = "/admin/pesanan";
  };

  // Handle klik luar untuk menutup dropdown notif
  useEffect(() => {
    if (!showNotif) return;
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".notif-dropdown") &&
        !e.target.closest(".notif-bell")
      ) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotif]);

  // LOADING/ERROR UI
  if (loading)
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-lg text-blue-700 font-semibold">
            Memuat dashboard…
          </p>
        </div>
      </AdminLayout>
    );

  if (error || !stats)
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-red-600 font-semibold text-xl mb-3">
            Gagal memuat: {error}
          </p>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl font-bold shadow hover:from-blue-700 hover:to-blue-600"
            onClick={triggerRefresh}
          >
            <FiRefreshCw className="inline mr-1" /> Coba Lagi
          </button>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      {/* NOTIFIKASI BELL */}
      <div className="flex justify-end items-center w-full mb-4 relative">
        <button
          className="relative notif-bell"
          onClick={handleToggleNotif}
          aria-label="Lihat notifikasi admin"
          title="Notifikasi Admin"
        >
          <FaBell className="text-2xl text-blue-600 hover:text-blue-800 transition" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 animate-pulse z-10">
              {notifCount}
            </span>
          )}
        </button>

        {/* Dropdown Notifikasi */}
        {showNotif && (
          <div className="notif-dropdown absolute right-0 top-11 z-50 bg-white rounded-xl shadow-xl border w-80 max-w-[90vw] animate-fade-in-fast">
            <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b">
              <FaBell className="text-blue-500" />
              <span className="font-semibold text-blue-800">
                Notifikasi Admin
              </span>
            </div>
            {notifList.length === 0 ? (
              <div className="px-4 py-3 text-gray-400">
                Tidak ada notifikasi.
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto divide-y">
                {notifList.map((item) => (
                  <li
                    key={item.id}
                    className={`px-4 py-3 cursor-pointer flex flex-col ${
                      item.is_read ? "opacity-60" : "bg-blue-50"
                    } hover:bg-blue-100`}
                    onClick={() => handleNotifClick(item)}
                  >
                    <span className="text-blue-700 font-semibold truncate">
                      🔔 {item.title || item.pesan}
                    </span>
                    <span className="text-xs text-gray-400 mt-1 truncate">
                      {item.message || item.pesan}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-8 md:mb-10">
        <h1 className="text-2xl md:text-4xl font-extrabold text-blue-800 flex items-center gap-3 tracking-tight">
          <FaClipboardList className="text-blue-500 bg-blue-100 rounded-lg p-2 text-3xl md:text-5xl shadow" />
          Dashboard Admin
        </h1>
      </div>

      {/* CARD STATISTIK */}
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-12">
          <StatCard
            Icon={FaMotorcycle}
            iconBg="bg-blue-50"
            color="text-blue-500"
            label="Total Motor"
            value={stats.totalKendaraan}
          />
          <StatCard
            Icon={FaClipboardList}
            iconBg="bg-green-50"
            color="text-green-500"
            label="Total Sewa"
            value={stats.totalPenyewaan}
          />
          <StatCard
            Icon={FaUsers}
            iconBg="bg-purple-50"
            color="text-purple-500"
            label="Total Customer"
            value={stats.totalPelanggan}
          />
          <StatCard
            Icon={FaMoneyBillWave}
            iconBg="bg-yellow-50"
            color="text-yellow-500"
            label="Total Pendapatan"
            value={`Rp${(stats.totalPendapatan || 0).toLocaleString("id-ID")}`}
          />
        </div>
      </div>

      {/* CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mb-10 md:mb-14">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 flex flex-col">
          <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 text-center text-gray-700">
            Jumlah Penyewaan
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#60a5fa" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 flex flex-col">
          <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 text-center text-gray-700">
            Total Pendapatan
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="total_pendapatan"
                fill="#fbbf24"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AKTIVITAS TERBARU */}
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-lg mb-8 md:mb-12">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-700">
          Aktivitas Terbaru
        </h2>
        {recent.length === 0 ? (
          <p className="text-gray-400">Belum ada aktivitas terbaru.</p>
        ) : (
          <ul className="divide-y">
            {recent.map((x) => (
              <li key={x.id} className="py-3 flex justify-between">
                <span>
                  <b className="text-blue-700">{x.nama_penyewa}</b> menyewa{" "}
                  <b className="text-gray-700">{x.kendaraan}</b>
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(x.createdAt).toLocaleDateString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* NOTIFIKASI KETERLAMBATAN */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 md:p-8 rounded-2xl shadow-lg mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-red-700">
          Notifikasi Keterlambatan
        </h2>
        {late.length === 0 ? (
          <p className="text-gray-400">Tidak ada keterlambatan saat ini.</p>
        ) : (
          <ul className="divide-y">
            {late.map((x) => (
              <li
                key={x.id}
                className="py-3 flex flex-col md:flex-row justify-between text-red-700 font-semibold gap-2"
              >
                <span>
                  <span className="inline-block animate-pulse mr-2">⚠️</span>
                  <b>{x.nama_penyewa}</b> belum mengembalikan{" "}
                  <b>{x.kendaraan}</b>
                </span>
                <span className="text-xs text-gray-500">
                  Jadwal:{" "}
                  {x.jadwal_booking
                    ? new Date(x.jadwal_booking).toLocaleString("id-ID")
                    : "-"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}
