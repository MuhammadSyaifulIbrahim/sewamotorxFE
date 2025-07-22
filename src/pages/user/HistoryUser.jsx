// src/pages/user/HistoryUser.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../api/axios";
import {
  CheckCircle,
  Clock,
  XCircle,
  CarFront,
  Loader2,
  Menu,
  History,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LogoNoBG from "../../assets/LogoNoBG.png";
import { BsWhatsapp, BsStarFill } from "react-icons/bs";
import ReviewForm from "./ReviewForm"; // Pastikan path benar!

function HeaderResponsive({ navigate }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 640) setOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return (
    <header className="fixed top-0 z-50 w-full">
      <nav className="max-w-7xl mx-auto mt-3 sm:mt-4 rounded-full bg-white/90 shadow-lg px-2 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-center border border-blue-100 backdrop-blur-lg">
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate("/dashboard")}
        >
          <img
            src={LogoNoBG}
            alt="MotoRent Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-lg"
            draggable={false}
          />
          <span className="text-2xl sm:text-3xl font-black text-blue-800 tracking-widest logo-font leading-tight">
            MotoRent
          </span>
        </div>
        <div className="space-x-1 sm:space-x-2 gap-2 hidden sm:flex">
          <button
            onClick={() => navigate("/dashboard/history")}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-base shadow transition"
          >
            <History className="w-5 h-5" />
            Riwayat
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-pink-400 to-red-500 text-white font-bold text-base shadow hover:opacity-90 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
        <div className="flex sm:hidden">
          <MobileNavbar navigate={navigate} open={open} setOpen={setOpen} />
        </div>
      </nav>
    </header>
  );
}
function MobileNavbar({ navigate, open, setOpen }) {
  return (
    <>
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full border border-blue-100 bg-blue-50 hover:bg-blue-100 transition focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Buka menu navigasi"
        type="button"
      >
        <Menu className="w-6 h-6 text-blue-700" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            className="fixed top-0 right-0 w-64 h-full bg-white shadow-2xl z-[999] flex flex-col"
            style={{
              borderTopLeftRadius: "2rem",
              borderBottomLeftRadius: "2rem",
            }}
          >
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <span className="text-xl font-black text-blue-800">MotoRent</span>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center bg-blue-50 hover:bg-blue-100 rounded-full text-2xl text-blue-600"
                aria-label="Tutup menu"
              >
                ×
              </button>
            </div>
            <nav className="flex flex-col gap-3 px-6 py-6">
              <button
                onClick={() => {
                  navigate("/dashboard/history");
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-blue-800 bg-blue-100 hover:bg-blue-200 transition text-base"
              >
                <History className="w-5 h-5" />
                Riwayat
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white bg-gradient-to-r from-pink-400 to-red-500 hover:opacity-90 transition text-base"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function HistoryUser() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewMap, setReviewMap] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil penyewaan user
  const fetchRiwayat = async () => {
    setLoading(true);
    try {
      const res = await API.get("/penyewaan/user", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRiwayat(res.data);

      // Setelah dapat list penyewaan, fetch review-nya satu per satu
      res.data
        .filter((x) => x.status === "SELESAI")
        .forEach((item) => fetchReviewForPenyewaan(item.id));
    } catch (err) {
      alert("Gagal memuat riwayat.");
    } finally {
      setLoading(false);
    }
  };

  // Ambil review by penyewaanId (API tidak tersedia? bisa by kendaraanId + filter penyewaanId di FE)
  const fetchReviewForPenyewaan = async (penyewaanId) => {
    try {
      const res = await API.get(`/review/penyewaan/${penyewaanId}`);
      if (res.data && res.data.rating) {
        setReviewMap((prev) => ({ ...prev, [penyewaanId]: res.data }));
      }
    } catch {}
  };

  useEffect(() => {
    fetchRiwayat();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("justPaid") === "true") {
      fetchRiwayat();
      const timeout = setTimeout(() => {
        navigate(location.pathname, { replace: true });
      }, 3000);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [location.search, location.pathname, navigate]);

  const renderImage = (gambar) =>
    gambar || "https://via.placeholder.com/300x200?text=No+Image";

  const getStatusBadge = (status) => {
    let color, icon, label;
    switch (status) {
      case "SELESAI":
        color = "bg-green-100 text-green-700";
        icon = <CheckCircle size={16} className="inline mr-1" />;
        label = "Selesai";
        break;
      case "BERHASIL":
        color = "bg-green-100 text-green-700";
        icon = <CheckCircle size={16} className="inline mr-1" />;
        label = "Berhasil";
        break;
      case "MENUNGGU_PEMBAYARAN":
        color = "bg-yellow-100 text-yellow-700 animate-pulse";
        icon = <Clock size={16} className="inline mr-1" />;
        label = "Menunggu Pembayaran";
        break;
      case "DIBATALKAN":
      case "GAGAL":
        color = "bg-red-100 text-red-700";
        icon = <XCircle size={16} className="inline mr-1" />;
        label = status === "DIBATALKAN" ? "Dibatalkan" : "Gagal";
        break;
      default:
        color = "bg-gray-100 text-gray-600";
        icon = null;
        label = status;
    }
    return (
      <span
        className={`px-3 py-1 rounded-full font-bold text-xs shadow flex items-center gap-1 ${color}`}
      >
        {icon}
        {label}
      </span>
    );
  };

  const stats = [
    {
      label: "Total",
      count: riwayat.length,
      color: "bg-blue-50 text-blue-600",
      icon: <CarFront size={22} className="mx-auto" />,
    },
    {
      label: "Selesai",
      count: riwayat.filter((r) => r.status === "SELESAI").length,
      color: "bg-green-50 text-green-600",
      icon: <CheckCircle size={22} className="mx-auto" />,
    },
    {
      label: "Pending",
      count: riwayat.filter((r) => r.status === "MENUNGGU_PEMBAYARAN").length,
      color: "bg-yellow-50 text-yellow-600",
      icon: <Clock size={22} className="mx-auto" />,
    },
    {
      label: "Dibatalkan",
      count: riwayat.filter(
        (r) => r.status === "DIBATALKAN" || r.status === "GAGAL"
      ).length,
      color: "bg-red-50 text-red-600",
      icon: <XCircle size={22} className="mx-auto" />,
    },
  ];

  // Tampilkan semua history
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 font-sans">
      <HeaderResponsive navigate={navigate} />
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-28 sm:pt-32 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.09 }}
              className={`rounded-2xl p-5 flex flex-col items-center shadow ${stat.color}`}
            >
              {stat.icon}
              <div className="text-sm mt-2">{stat.label}</div>
              <div className="text-2xl font-black mt-1">{stat.count}</div>
            </motion.div>
          ))}
        </div>
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-600 mr-2" />
            <span className="font-semibold text-indigo-700">
              Memuat riwayat...
            </span>
          </div>
        ) : riwayat.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 text-lg py-20"
          >
            Belum ada riwayat penyewaan.
            <br />
            Yuk sewa motor favoritmu sekarang!
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence>
              {riwayat.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.18, delay: i * 0.04 }}
                >
                  <div className="bg-white group hover:bg-yellow-50 shadow-xl rounded-3xl overflow-hidden border border-blue-100 hover:border-yellow-300 transition-all duration-200">
                    {/* Bagian klik ke detail */}
                    <div
                      onClick={() => navigate(`/dashboard/history/${item.id}`)}
                      className="cursor-pointer"
                    >
                      <div className="relative aspect-video bg-gray-50 flex items-center justify-center">
                        <img
                          src={renderImage(item.kendaraan?.gambar)}
                          alt={item.kendaraan?.nama}
                          className="w-full h-full object-contain transition duration-150 scale-95 group-hover:scale-100"
                        />
                        <div className="absolute top-3 left-3">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                      <div className="p-5 space-y-1">
                        <div className="flex justify-between items-center">
                          <h2 className="text-lg font-bold text-indigo-700 group-hover:text-yellow-700 transition">
                            {item.kendaraan?.nama}
                          </h2>
                          <span className="text-xs text-blue-800 font-semibold">
                            {item.durasi_hari} hari
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          {item.kendaraan?.tipe} / {item.kendaraan?.transmisi}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Jadwal: </span>
                          {new Date(item.jadwal_booking).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Pengambilan: </span>
                          {item.metode_pengambilan === "Diantar"
                            ? `🚚 Diantar (${item.alamat_pengambilan || "-"})`
                            : "📍 Showroom"}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Pengembalian: </span>
                          {item.metode_pengembalian === "Diambil"
                            ? `🚚 Diambil (${item.alamat_pengembalian || "-"})`
                            : "📍 Showroom"}
                        </p>
                        <p className="text-sm text-green-700 font-bold mt-1">
                          Rp {Number(item.harga_total).toLocaleString("id-ID")}
                        </p>
                        {item.status === "MENUNGGU_PEMBAYARAN" && (
                          <motion.p
                            initial={{ scale: 0.92 }}
                            animate={{ scale: 1 }}
                            transition={{ yoyo: Infinity, duration: 0.8 }}
                            className="text-xs text-red-600 font-bold mt-2"
                          >
                            ⚠️ Selesaikan pembayaran segera!
                          </motion.p>
                        )}
                      </div>
                    </div>
                    {/* === Review Section (di bawah, tidak ikut ke detail) */}
                    {item.status === "SELESAI" && (
                      <div className="border-t px-5 pb-4 pt-3 bg-blue-50">
                        {reviewMap[item.id] ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-blue-800">
                                Ulasan Kamu:
                              </span>
                              {[...Array(5)].map((_, idx) => (
                                <BsStarFill
                                  key={idx}
                                  className={`text-xl ${
                                    idx < reviewMap[item.id].rating
                                      ? "text-yellow-400"
                                      : "text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-gray-700 text-sm italic border-l-4 border-yellow-200 pl-3">
                              {reviewMap[item.id].pesan}
                            </div>
                          </div>
                        ) : (
                          <ReviewForm
                            penyewaanId={item.id}
                            kendaraanId={item.kendaraanId}
                            onSukses={() => fetchReviewForPenyewaan(item.id)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* WhatsApp Floating */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
        className="fixed bottom-20 right-5 z-50 flex flex-col items-center space-y-1"
      >
        <span className="text-sm font-semibold text-green-700 select-none cursor-default flex items-center gap-1">
          Nomor CS <span className="text-lg">⬇️</span>
        </span>
        <a
          href={`https://wa.me/6285776828467?text=${encodeURIComponent(
            "Halo! saya butuh bantuan terkait pesanan saya, apakah bisa dibantu?"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition"
        >
          <BsWhatsapp size={28} />
        </a>
      </motion.div>
      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 sm:py-16 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h4 className="font-semibold text-white text-lg mb-4">
              Lokasi Kami
            </h4>
            <ul className="space-y-2 text-sm">
              <li>📍 Jakarta Selatan - Kemang Utara VII G</li>
            </ul>
            <div className="mt-6 space-y-1 text-sm">
              <p>📧 muhammadsyaifulibrahim352@gmail.com</p>
              <p>📞 085776828467 </p>
              <p>📸 Instagram: @motorent</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white text-lg mb-4">Layanan</h4>
            <ul className="text-sm space-y-2">
              <li>Sewa Motor 24 Jam</li>
              <li>Antar–Jemput Kendaraan</li>
              <li>Tanpa DP/Deposit</li>
              <li>Layanan Asuransi</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white text-lg mb-4">Support</h4>
            <ul className="text-sm space-y-2">
              <li>FAQ</li>
              <li>Testimoni</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 sm:mt-10 pt-6 sm:pt-8 text-center">
          <h5 className="font-semibold mb-3 sm:mb-4 text-white">
            MotoRent Mendukung Pembayaran
          </h5>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/80">
            <span>VISA</span>
            <span>JCB</span>
            <span>MasterCard</span>
            <span>AMEX</span>
            <span>BRI</span>
            <span>BNI</span>
            <span>BCA</span>
            <span>OVO</span>
            <span>Gopay</span>
            <span>Tokopedia</span>
            <span>Blibli</span>
          </div>
          <p className="text-xs text-white/60 mt-6">
            &copy; {new Date().getFullYear()} PT SEWAMOTOR INDONESIA - Powered
            by MotoRent
          </p>
        </div>
      </footer>
    </div>
  );
}
