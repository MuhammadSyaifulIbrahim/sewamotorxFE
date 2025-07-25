import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { History, LogOut, Bell } from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../api/axios";
import LogoNoBG from "../../assets/LogoNoBG.png";
import Banner1 from "../../assets/Carousel1.png";
import Banner2 from "../../assets/Carousel2.png";
import Banner3 from "../../assets/Carousel3.png";
import { getDistanceGoogle } from "../../utils/getDistanceGoogle";
import { BsWhatsapp } from "react-icons/bs";
import { io } from "socket.io-client";
import axios from "axios";
import {
  FaCarSide,
  FaShuttleVan,
  FaHandshake,
  FaMoneyCheckAlt,
  FaStar,
} from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://sewamotorxbe-production.up.railway.app/api";
const HERO_BANNERS = [Banner1, Banner2, Banner3];
const SHOWROOM_ADDRESS =
  "Jl. Kemang Utara VII G No.2, RT 001/ RW04, Jakarta Selatan";

const getOngkir = (km) => (km ? Math.ceil(km) * 5000 : 0);
const getDefaultDatetimeLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
};

// Avatar generator untuk review
const randomAvatar = (nama = "") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nama
  )}&background=6E9EF8&color=fff&rounded=true&bold=true&size=128`;

// NOTIFIKASI DROPDOWN
function NotifDropdown({ notifs, unreadCount, open, onOpen, onClickNotif }) {
  if (typeof window === "undefined") return null; // SSR guard

  // -- Dropdown Portal Content
  const dropdown = open ? (
    <AnimatePresence>
      <motion.div
        key="notif-portal"
        initial={{ opacity: 0, y: -18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 0.99 }}
        transition={{ duration: 0.18 }}
        style={{
          position: "fixed",
          top: 78, // <= ini bisa adjust (header+margin bell)
          right: 36, // <= adjust biar pojok kanan, desktop/mobile
          zIndex: 9999,
          width: 330,
          maxWidth: "92vw",
          background: "white",
          borderRadius: "1.25rem",
          boxShadow: "0 12px 48px 0 rgba(74,105,255,.17)",
          border: "1px solid #dbeafe",
          overflow: "hidden",
        }}
        className="notif-dropdown"
      >
        <div className="px-5 py-3 border-b flex items-center gap-2 bg-blue-50">
          <Bell className="text-blue-700" size={20} />
          <span className="font-bold text-blue-900 text-base">Notifikasi</span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="px-6 py-7 text-gray-400 text-center text-base">
              Tidak ada notifikasi
            </div>
          ) : (
            notifs.map((notif) => (
              <button
                key={notif.id}
                onClick={() => onClickNotif(notif)}
                className={`flex text-left w-full gap-2 px-5 py-3 border-b last:border-0 hover:bg-blue-50 transition group ${
                  notif.sudah_dibaca ? "opacity-80" : "bg-blue-50/30"
                }`}
                style={{ alignItems: "flex-start" }}
              >
                <div className="mt-0.5">
                  {notif.tipe === "success" ? (
                    <span className="inline-block text-lg">💳</span>
                  ) : notif.tipe === "warning" ? (
                    <span className="inline-block text-lg">⚠️</span>
                  ) : (
                    <span className="inline-block text-lg">🛵</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold text-[15px] leading-tight ${
                      notif.tipe === "success"
                        ? "text-blue-800"
                        : notif.tipe === "warning"
                        ? "text-yellow-700"
                        : "text-pink-800"
                    } group-hover:underline truncate`}
                  >
                    {notif.pesan}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatWIB(notif.createdAt)}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  ) : null;

  // -- Main Bell Button
  return (
    <>
      <button
        onClick={onOpen}
        className="relative group p-2 rounded-full bg-white shadow-md hover:bg-blue-100 transition notif-bell"
        title="Notifikasi"
      >
        <Bell size={28} className="text-blue-800" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold animate-bounce z-20">
            {unreadCount}
          </span>
        )}
      </button>
      {createPortal(dropdown, document.body)}
    </>
  );
}

// Utility tanggal (WIB)
function formatWIB(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    .replace(".", ":");
}

// === MOBILE NAVBAR ===
function MobileNavbar({ navigate }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 640) setOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <>
      <button
        className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full border border-indigo-100 bg-indigo-50 hover:bg-indigo-200 transition focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Buka menu navigasi"
        type="button"
      >
        <span className="block w-6 h-0.5 bg-indigo-600 rounded mb-1" />
        <span className="block w-6 h-0.5 bg-indigo-600 rounded mb-1" />
        <span className="block w-6 h-0.5 bg-indigo-600 rounded" />
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
              <span className="text-xl font-black text-indigo-700">
                MotoRent
              </span>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 rounded-full text-2xl text-indigo-600"
                aria-label="Tutup menu"
              >
                ×
              </button>
            </div>
            <nav className="flex flex-col gap-2 px-6 py-6">
              <button
                onClick={() => {
                  navigate("/dashboard/history");
                  setOpen(false);
                }}
                className="flex items-center px-4 py-2 mb-2 rounded-full font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition text-base"
              >
                <History className="mr-2" /> Riwayat
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                  setOpen(false);
                }}
                className="flex items-center px-4 py-2 rounded-full font-bold text-white bg-gradient-to-r from-pink-400 to-red-500 hover:opacity-90 transition text-base"
              >
                <LogOut className="mr-2" /> Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// DASHBOARD USER
export default function DashboardUser() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const socketRef = useRef();

  // --- NOTIFIKASI ---
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  // --- MOTOR & FORM STATE ---
  const [kendaraanList, setKendaraanList] = useState([]);
  const [selectedMotor, setSelectedMotor] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterHarga, setFilterHarga] = useState({ min: 0, max: Infinity });
  const [filterTerlaris, setFilterTerlaris] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form
  const [pakaiAntar, setPakaiAntar] = useState(false);
  const [pakaiJemput, setPakaiJemput] = useState(false);
  const [jarakAntar, setJarakAntar] = useState(null);
  const [jarakJemput, setJarakJemput] = useState(null);
  const [loadingJarakAntar, setLoadingJarakAntar] = useState(false);
  const [loadingJarakJemput, setLoadingJarakJemput] = useState(false);
  const [errorJarakAntar, setErrorJarakAntar] = useState("");
  const [errorJarakJemput, setErrorJarakJemput] = useState("");
  const [formData, setFormData] = useState({
    nama_penyewa: "",
    nomor_telepon: "",
    tanggal_booking: getDefaultDatetimeLocal(),
    jam_booking: "09",
    menit_booking: "00",
    durasi_penyewaan: "1",
    lokasi_pengambilan: "Showroom",
    alamat_pengambilan: "",
    lokasi_pengembalian: "Showroom",
    alamat_pengembalian: "",
    keterangan: "",
    foto_ktp: null,
    foto_sim: null,
  });

  // --- REVIEW SECTION ---
  const [reviewList, setReviewList] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);

  // Fetch review dari API /review/public
  useEffect(() => {
    let isMounted = true;
    setReviewLoading(true);
    axios
      .get(`${API_BASE_URL}/review/public`)
      .then((res) => {
        if (isMounted) setReviewList(res.data || []);
      })
      .catch(() => setReviewList([]))
      .finally(() => setReviewLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  // --- PATCH: Reset unreadCount & mark all read pas dropdown notif dibuka
  useEffect(() => {
    if (notifOpen && unreadCount > 0) {
      setUnreadCount(0);
      setNotifs((prev) => prev.map((n) => ({ ...n, sudah_dibaca: true })));
      API.post("/notifikasi/mark-read-all", null, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  }, [notifOpen]);

  // PATCH: Close dropdown notif kalau klik di luar
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (
        !e.target.closest(".notif-dropdown") &&
        !e.target.closest(".notif-bell")
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  // Refresh list produk
  const refreshKendaraanList = () => {
    API.get("/kendaraan")
      .then((res) => setKendaraanList(res.data))
      .catch(() =>
        alert("Gagal update data kendaraan. Silakan refresh halaman.")
      );
  };

  // --- Notifikasi + Socket realtime produk ---
  useEffect(() => {
    if (!token) return;
    API.get("/notifikasi", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setNotifs(res.data || []);
        setUnreadCount((res.data || []).filter((n) => !n.sudah_dibaca).length);
      })
      .catch(() => {});
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;
    socket.on("notification:new", (notif) => {
      setNotifs((prev) => [notif, ...prev]);
      setUnreadCount((n) => n + 1);
    });
    socket.on("produk:created", refreshKendaraanList);
    socket.on("produk:updated", refreshKendaraanList);
    socket.on("produk:deleted", refreshKendaraanList);
    return () => {
      socket.off("notification:new");
      socket.off("produk:created", refreshKendaraanList);
      socket.off("produk:updated", refreshKendaraanList);
      socket.off("produk:deleted", refreshKendaraanList);
      socket.disconnect();
    };
  }, [token]);

  // Klik notif
  const handleNotifClick = (notif) => {
    setNotifOpen(false);
    API.post(`/notifikasi/${notif.id}/baca`, null, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    if (notif.orderId)
      navigate(`/dashboard/history?highlight=${notif.orderId}`);
    else navigate("/dashboard/history");
  };

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      lokasi_pengambilan: pakaiAntar ? "Diantar" : "Showroom",
      alamat_pengambilan: "",
    }));
    setJarakAntar(null);
    setErrorJarakAntar("");
  }, [pakaiAntar]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      lokasi_pengembalian: pakaiJemput ? "Diambil" : "Showroom",
      alamat_pengembalian: "",
    }));
    setJarakJemput(null);
    setErrorJarakJemput("");
  }, [pakaiJemput]);

  useEffect(() => {
    setLoading(true);
    API.get("/kendaraan")
      .then((res) => setKendaraanList(res.data))
      .catch(() =>
        alert("Gagal memuat data kendaraan. Silakan refresh halaman.")
      )
      .finally(() => setLoading(false));
  }, []);

  // ---- Kalkulasi harga breakdown ----
  const isCoord = (str) => /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(str.trim());
  const calculateTotalPriceWithBreakdown = () => {
    if (!selectedMotor?.harga_sewa || !formData.durasi_penyewaan) {
      return {
        total: 0,
        hargaAwal: 0,
        hargaSetelahDiskon: 0,
        breakdown: [],
        durasi: 0,
        biayaAntar: 0,
        biayaJemput: 0,
      };
    }
    const durasi = Number(formData.durasi_penyewaan);
    const hargaAwal = Number(selectedMotor.harga_sewa);
    const diskon = Number(selectedMotor.diskon || 0);
    const hargaSetelahDiskon = Math.round(hargaAwal * (1 - diskon / 100));
    let total = hargaSetelahDiskon * durasi;
    const breakdown = [];
    if (diskon > 0)
      breakdown.push(
        `Diskon Produk ${diskon}% = -Rp ${(
          hargaAwal *
          (diskon / 100)
        ).toLocaleString("id-ID")} / hari`
      );
    if (durasi >= 30) {
      const before = total;
      total *= 0.85;
      breakdown.push(
        `Diskon Long Rent 15% = -Rp ${(before - total).toLocaleString("id-ID")}`
      );
    } else if (durasi >= 7) {
      const before = total;
      total *= 0.9;
      breakdown.push(
        `Diskon Long Rent 10% = -Rp ${(before - total).toLocaleString("id-ID")}`
      );
    }
    const pickup = new Date(
      `${formData.tanggal_booking}T${formData.jam_booking}:${formData.menit_booking}`
    );
    const isWeekend = [0, 6].includes(pickup.getDay());
    if (isWeekend) {
      total += 15000;
      breakdown.push("Kenaikan Harga Weekend = +Rp 15.000");
    }
    const biayaAntar = getOngkir(jarakAntar);
    const biayaJemput = getOngkir(jarakJemput);
    if (biayaAntar > 0)
      breakdown.push(`Biaya Antar = +Rp ${biayaAntar.toLocaleString("id-ID")}`);
    if (biayaJemput > 0)
      breakdown.push(
        `Biaya Jemput = +Rp ${biayaJemput.toLocaleString("id-ID")}`
      );
    total += biayaAntar + biayaJemput;
    return {
      total: Math.round(total),
      hargaAwal,
      hargaSetelahDiskon,
      breakdown,
      durasi,
      biayaAntar,
      biayaJemput,
    };
  };

  // Submit form penyewaan (tidak diubah)
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (name === "alamat_pengambilan") {
      setJarakAntar(null);
      setErrorJarakAntar("");
    }
    if (name === "alamat_pengembalian") {
      setJarakJemput(null);
      setErrorJarakJemput("");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!selectedMotor?.id) {
      setLoading(false);
      return alert(
        "Motor belum dipilih. Silakan klik 'Sewa Sekarang' pada motor."
      );
    }
    if (!formData.foto_ktp || !formData.foto_sim) {
      setLoading(false);
      return alert("Mohon upload foto KTP dan SIM terlebih dahulu.");
    }
    if (
      formData.lokasi_pengambilan === "Diantar" &&
      !formData.alamat_pengambilan.trim()
    ) {
      setLoading(false);
      return alert("Mohon isi alamat pengambilan.");
    }
    if (
      formData.lokasi_pengambilan === "Diantar" &&
      (!jarakAntar || errorJarakAntar)
    ) {
      setLoading(false);
      return alert(
        "Mohon klik 'Cek Jarak & Ongkir' dan pastikan jarak ditemukan."
      );
    }
    if (
      formData.lokasi_pengambilan === "Diantar" &&
      isCoord(formData.alamat_pengambilan)
    ) {
      setLoading(false);
      return alert("Mohon masukkan alamat lengkap, bukan koordinat GPS.");
    }
    if (
      formData.lokasi_pengembalian === "Diambil" &&
      !formData.alamat_pengembalian.trim()
    ) {
      setLoading(false);
      return alert("Mohon isi alamat pengembalian.");
    }
    if (
      formData.lokasi_pengembalian === "Diambil" &&
      (!jarakJemput || errorJarakJemput)
    ) {
      setLoading(false);
      return alert(
        "Mohon klik 'Cek Jarak & Ongkir' dan pastikan jarak ditemukan."
      );
    }
    if (
      formData.lokasi_pengembalian === "Diambil" &&
      isCoord(formData.alamat_pengembalian)
    ) {
      setLoading(false);
      return alert("Mohon masukkan alamat lengkap, bukan koordinat GPS.");
    }
    const jadwalStr = `${formData.tanggal_booking}T${formData.jam_booking}:${formData.menit_booking}`;
    const jadwalBookingDate = new Date(jadwalStr);
    const data = new FormData();
    data.append("kendaraan_id", selectedMotor.id);
    data.append("nama_penyewa", formData.nama_penyewa);
    data.append("nomor_telepon", formData.nomor_telepon);
    data.append("jadwal_booking", jadwalBookingDate.toISOString());
    data.append(
      "jam_pengambilan",
      `${formData.jam_booking}:${formData.menit_booking}`
    );
    data.append("durasi_hari", formData.durasi_penyewaan);
    data.append("metode_pengambilan", formData.lokasi_pengambilan);
    data.append("metode_pengembalian", formData.lokasi_pengembalian);
    data.append("lokasi_pengambilan", formData.lokasi_pengambilan);
    data.append(
      "alamat_pengambilan",
      formData.lokasi_pengambilan === "Diantar"
        ? formData.alamat_pengambilan
        : SHOWROOM_ADDRESS
    );
    data.append("lokasi_pengembalian", formData.lokasi_pengembalian);
    data.append(
      "alamat_pengembalian",
      formData.lokasi_pengembalian === "Diambil"
        ? formData.alamat_pengembalian
        : SHOWROOM_ADDRESS
    );
    data.append("keterangan", formData.keterangan);
    data.append("foto_ktp", formData.foto_ktp);
    data.append("foto_sim", formData.foto_sim);
    data.append("ongkir_antar", getOngkir(jarakAntar));
    data.append("ongkir_jemput", getOngkir(jarakJemput));
    try {
      const res = await API.post("/penyewaan", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = res.data.payment_url;
      setSelectedMotor(null);
      if (url) window.location.href = url;
      else navigate("/dashboard/history");
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Terjadi kesalahan saat menyewa kendaraan."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---- Filter kendaraan ----
  const filteredKendaraan = kendaraanList
    .filter((motor) =>
      motor.nama?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(
      (motor) =>
        parseInt(motor.harga_sewa) >= filterHarga.min &&
        parseInt(motor.harga_sewa) <= filterHarga.max
    )
    .sort((a, b) => (filterTerlaris ? b.total_disewa - a.total_disewa : 0));

  const openGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(SHOWROOM_ADDRESS);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank"
    );
  };

  // ------ UI -------
  const cardVariants = {
    initial: { scale: 1, y: 0, boxShadow: "0 2px 16px 0 rgba(75,80,152,.07)" },
    hover: {
      scale: 1.05,
      y: -8,
      boxShadow: "0 8px 36px 0 rgba(74,105,255,.16)",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f8ff] via-white to-[#fff9ec] font-sans">
      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="font-semibold text-indigo-700">Memproses...</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="w-full">
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
          <div className="flex items-center gap-2">
            {/* Notifikasi Dropdown */}
            <NotifDropdown
              notifs={notifs}
              unreadCount={unreadCount}
              open={notifOpen}
              onOpen={() => setNotifOpen((o) => !o)}
              onClickNotif={handleNotifClick}
            />
            <button
              onClick={() => navigate("/dashboard/history")}
              className="hidden sm:flex items-center gap-2 px-6 py-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-base shadow transition"
            >
              <History className="w-5 h-5" />
              Riwayat
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
              className="hidden sm:flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-pink-400 to-red-500 text-white font-bold text-base shadow hover:opacity-90 transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
            <div className="flex sm:hidden">
              <MobileNavbar navigate={navigate} />
            </div>
          </div>
        </nav>
      </header>

      {/* HERO CAROUSEL */}
      <section className="mt-24 mb-6 max-w-5xl mx-auto w-full px-2">
        <div className="rounded-3xl shadow-2xl overflow-hidden w-full aspect-video bg-gray-100">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3900, disableOnInteraction: false }}
            slidesPerView={1}
            loop
            className="w-full h-full"
          >
            {HERO_BANNERS.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={img}
                  alt={`Banner ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* FILTER SEARCH */}
      <div className="max-w-5xl mx-auto py-4 px-4">
        <input
          type="text"
          placeholder="Cari motor favoritmu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-5 py-3 mb-4 rounded-2xl border-2 border-indigo-100 font-semibold focus:ring-2 focus:ring-indigo-400 bg-white shadow focus:outline-none"
        />
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val === "1") setFilterHarga({ min: 0, max: 100000 });
              else if (val === "2")
                setFilterHarga({ min: 100001, max: 200000 });
              else if (val === "3")
                setFilterHarga({ min: 200001, max: Infinity });
              else setFilterHarga({ min: 0, max: Infinity });
            }}
            className="px-4 py-2 rounded-xl border-2 border-indigo-100 font-semibold bg-white shadow"
          >
            <option value="">Semua Harga</option>
            <option value="1">Di bawah Rp100.000</option>
            <option value="2">Rp100.001 - Rp200.000</option>
            <option value="3">Di atas Rp200.000</option>
          </select>
          <label className="flex items-center space-x-2 font-semibold text-indigo-700">
            <input
              type="checkbox"
              checked={filterTerlaris}
              onChange={(e) => setFilterTerlaris(e.target.checked)}
              className="accent-yellow-400"
            />
            <span>Terlaris</span>
          </label>
        </div>
      </div>

      {/* LIST MOTOR (seperti dashboard awalmu, TIDAK DIUBAH) */}
      <section
        id="list-motor"
        className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 pb-16"
      >
        {filteredKendaraan.length === 0 && (
          <div className="col-span-full text-center text-lg text-gray-500 py-12 font-semibold">
            Tidak ada motor yang cocok. Coba keyword atau filter lain!
          </div>
        )}
        {filteredKendaraan.map((motor) => (
          <motion.article
            key={motor.id}
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            className="bg-white/90 rounded-3xl shadow-xl overflow-hidden relative p-5 pb-6 border-2 border-indigo-100 flex flex-col items-center transition-all cursor-pointer group"
            style={{
              minHeight: "350px",
              boxShadow: "0 4px 32px 0 rgba(31,67,183,0.07)",
            }}
          >
            <span
              className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full shadow border ${
                motor.stok > 0
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
              }`}
            >
              {motor.stok > 0 ? `${motor.stok} Unit Ready` : "Stok Habis"}
            </span>
            <motion.img
              src={
                motor.gambar ||
                "https://via.placeholder.com/300x200?text=No+Image"
              }
              alt={motor.nama}
              whileHover={{ scale: 1.1 }}
              className="w-40 h-36 sm:w-48 sm:h-44 object-contain mb-5 bg-white rounded-2xl shadow-md group-hover:drop-shadow-xl transition"
              onClick={() => setModalImage(motor.gambar)}
              style={{ background: "#f4f6ff" }}
              onError={(e) =>
                (e.target.src =
                  "https://via.placeholder.com/300x200?text=No+Image")
              }
            />
            <h3
              className="font-black text-xl text-indigo-800 mb-2 tracking-wide"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {motor.nama}
            </h3>
            <p className="text-xs text-gray-500 font-semibold mb-1">
              {motor.tipe} / {motor.transmisi}
            </p>
            {motor.diskon && motor.diskon > 0 ? (
              <div className="text-sm text-gray-700 space-y-1 mt-1">
                <div className="line-through text-red-400 font-semibold">
                  Rp {Number(motor.harga_sewa).toLocaleString("id-ID")} / hari
                </div>
                <div className="text-lg font-extrabold text-green-600 drop-shadow">
                  Rp{" "}
                  {Math.round(
                    motor.harga_sewa * (1 - motor.diskon / 100)
                  ).toLocaleString("id-ID")}{" "}
                  / hari
                </div>
                <span className="inline-block text-xs bg-yellow-200 text-yellow-800 font-bold px-3 py-1 rounded-full shadow">
                  {motor.diskon}% OFF
                </span>
              </div>
            ) : (
              <div className="text-lg font-bold text-indigo-700">
                Rp {Number(motor.harga_sewa).toLocaleString("id-ID")} / hari
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={motor.stok === 0 || loading}
              onClick={() => setSelectedMotor(motor)}
              className={`mt-6 w-full py-3 rounded-full font-extrabold tracking-wider shadow-md text-base transition ${
                motor.stok === 0 || loading
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-blue-400 text-white hover:from-indigo-600 hover:to-blue-500"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {motor.stok === 0 ? "Stok Habis" : "🚀 Sewa Sekarang"}
            </motion.button>
          </motion.article>
        ))}
      </section>

      {/* MODAL PREVIEW GAMBAR */}
      <AnimatePresence>
        {modalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
            onClick={() => setModalImage(null)}
          >
            <motion.div
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.97 }}
              className="relative max-w-4xl max-h-4xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setModalImage(null)}
                className="absolute -top-3 -right-3 bg-white text-indigo-900 rounded-full w-9 h-9 flex items-center justify-center font-black hover:bg-gray-200"
              >
                ×
              </button>
              <img
                src={modalImage}
                alt="Motor"
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL FORM PEMESANAN */}
      <AnimatePresence>
        {selectedMotor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl relative overflow-y-auto max-h-[95vh]">
              <button
                onClick={() => setSelectedMotor(null)}
                className="absolute top-4 right-4 text-3xl font-black text-pink-600 hover:text-pink-800"
              >
                &times;
              </button>
              <h2
                className="text-2xl font-black mb-8 text-indigo-700 pr-8 tracking-wide"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                🚦 Form Pemesanan – {selectedMotor.nama}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* FORM FIELD */}
                {/* Nama & Telp */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Penyewa *
                    </label>
                    <input
                      type="text"
                      name="nama_penyewa"
                      value={formData.nama_penyewa}
                      onChange={handleChange}
                      placeholder="Nama Penyewa"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon *
                    </label>
                    <input
                      type="text"
                      name="nomor_telepon"
                      value={formData.nomor_telepon}
                      onChange={handleChange}
                      placeholder="Nomor Telepon"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                {/* Tanggal & Jam Booking */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Booking *
                    </label>
                    <input
                      type="date"
                      name="tanggal_booking"
                      value={formData.tanggal_booking}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Booking *
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="jam_booking"
                        value={formData.jam_booking}
                        onChange={handleChange}
                        required
                        className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                      <select
                        name="menit_booking"
                        value={formData.menit_booking}
                        onChange={handleChange}
                        required
                        className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {["00", "30"].map((menit) => (
                          <option key={menit} value={menit}>
                            {menit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                {/* Durasi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durasi Penyewaan (Hari) *
                  </label>
                  <select
                    name="durasi_penyewaan"
                    value={formData.durasi_penyewaan}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Array.from({ length: 30 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} hari
                      </option>
                    ))}
                  </select>
                </div>
                {/* Lokasi Pengambilan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi Pengambilan *
                  </label>
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pakaiAntar"
                      checked={pakaiAntar}
                      onChange={(e) => setPakaiAntar(e.target.checked)}
                      className="accent-indigo-600"
                    />
                    <label htmlFor="pakaiAntar" className="text-sm select-none">
                      Diantar ke Lokasi Kamu
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="lokasi_pengambilan"
                        value="Showroom"
                        checked={formData.lokasi_pengambilan === "Showroom"}
                        onChange={handleChange}
                        disabled={pakaiAntar}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Showroom MotoRent</div>
                        <div className="text-sm text-gray-600">
                          {SHOWROOM_ADDRESS}
                        </div>
                        <button
                          type="button"
                          onClick={openGoogleMaps}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          Lihat di Maps
                        </button>
                      </div>
                    </label>
                    <label className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="lokasi_pengambilan"
                        value="Diantar"
                        checked={formData.lokasi_pengambilan === "Diantar"}
                        onChange={handleChange}
                        disabled={!pakaiAntar}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          Diantar ke Lokasi Kamu
                        </div>
                        <p className="text-sm text-gray-500 leading-snug">
                          Alamat lengkap harus mencakup RT/RW, Kecamatan,
                          Kelurahan, dan Kode Pos.
                        </p>
                        <div className="text-xs text-orange-600 font-semibold mt-1">
                          *Harga antar: 1 km = Rp 5.000
                        </div>
                        {formData.lokasi_pengambilan === "Diantar" && (
                          <div className="mt-3">
                            <textarea
                              name="alamat_pengambilan"
                              value={formData.alamat_pengambilan}
                              onChange={handleChange}
                              placeholder="Masukkan alamat lengkap pengantaran..."
                              rows={2}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              required={pakaiAntar}
                            />
                            <button
                              type="button"
                              className="mt-2 px-4 py-2 bg-blue-100 rounded text-blue-700 font-bold text-xs hover:bg-blue-200"
                              onClick={async () => {
                                setLoadingJarakAntar(true);
                                setErrorJarakAntar("");
                                setJarakAntar(null);
                                if (
                                  !formData.alamat_pengambilan.trim() ||
                                  isCoord(formData.alamat_pengambilan)
                                ) {
                                  setErrorJarakAntar(
                                    "Isi alamat lengkap, bukan koordinat GPS."
                                  );
                                  setLoadingJarakAntar(false);
                                  return;
                                }
                                try {
                                  const jarak = await getDistanceGoogle(
                                    SHOWROOM_ADDRESS,
                                    formData.alamat_pengambilan
                                  );
                                  if (jarak) setJarakAntar(jarak);
                                  else
                                    setErrorJarakAntar(
                                      "Jarak tidak ditemukan, cek alamat lagi."
                                    );
                                } catch (err) {
                                  setErrorJarakAntar(
                                    err?.response?.data?.message ||
                                      "Gagal cek jarak: pastikan alamat benar."
                                  );
                                  setJarakAntar(null);
                                }
                                setLoadingJarakAntar(false);
                              }}
                            >
                              {loadingJarakAntar
                                ? "Menghitung..."
                                : "Cek Jarak & Ongkir via Maps"}
                            </button>
                            {jarakAntar && (
                              <div className="mt-2 text-xs">
                                Jarak: <b>{jarakAntar} km</b> <br />
                                Biaya Antar:{" "}
                                <b>
                                  Rp{" "}
                                  {getOngkir(jarakAntar).toLocaleString(
                                    "id-ID"
                                  )}
                                </b>
                              </div>
                            )}
                            {errorJarakAntar && (
                              <div className="mt-2 text-xs text-red-600">
                                {errorJarakAntar}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
                {/* Lokasi Pengembalian */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi Pengembalian *
                  </label>
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pakaiJemput"
                      checked={pakaiJemput}
                      onChange={(e) => setPakaiJemput(e.target.checked)}
                      className="accent-indigo-600"
                    />
                    <label
                      htmlFor="pakaiJemput"
                      className="text-sm select-none"
                    >
                      Diambil ke Lokasi Kamu
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="lokasi_pengembalian"
                        value="Showroom"
                        checked={formData.lokasi_pengembalian === "Showroom"}
                        onChange={handleChange}
                        disabled={pakaiJemput}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Showroom MotoRent</div>
                        <div className="text-sm text-gray-600">
                          {SHOWROOM_ADDRESS}
                        </div>
                        <button
                          type="button"
                          onClick={openGoogleMaps}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          Lihat di Maps
                        </button>
                      </div>
                    </label>
                    <label className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="lokasi_pengembalian"
                        value="Diambil"
                        checked={formData.lokasi_pengembalian === "Diambil"}
                        onChange={handleChange}
                        disabled={!pakaiJemput}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          Diambil ke Lokasi Kamu
                        </div>
                        <p className="text-sm text-gray-500 leading-snug">
                          Alamat lengkap harus mencakup RT/RW, Kecamatan,
                          Kelurahan, dan Kode Pos.
                        </p>
                        <div className="text-xs text-orange-600 font-semibold mt-1">
                          *Harga jemput: 1 km = Rp 5.000
                        </div>
                        {formData.lokasi_pengembalian === "Diambil" && (
                          <div className="mt-3">
                            <textarea
                              name="alamat_pengembalian"
                              value={formData.alamat_pengembalian}
                              onChange={handleChange}
                              placeholder="Masukkan alamat lengkap penjemputan..."
                              rows={2}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              required={pakaiJemput}
                            />
                            <button
                              type="button"
                              className="mt-2 px-4 py-2 bg-blue-100 rounded text-blue-700 font-bold text-xs hover:bg-blue-200"
                              onClick={async () => {
                                setLoadingJarakJemput(true);
                                setErrorJarakJemput("");
                                setJarakJemput(null);
                                if (
                                  !formData.alamat_pengembalian.trim() ||
                                  isCoord(formData.alamat_pengembalian)
                                ) {
                                  setErrorJarakJemput(
                                    "Isi alamat lengkap, bukan koordinat GPS."
                                  );
                                  setLoadingJarakJemput(false);
                                  return;
                                }
                                try {
                                  const jarak = await getDistanceGoogle(
                                    SHOWROOM_ADDRESS,
                                    formData.alamat_pengembalian
                                  );
                                  if (jarak) setJarakJemput(jarak);
                                  else
                                    setErrorJarakJemput(
                                      "Jarak tidak ditemukan, cek alamat lagi."
                                    );
                                } catch (err) {
                                  setErrorJarakJemput(
                                    err?.response?.data?.message ||
                                      "Gagal cek jarak: pastikan alamat benar."
                                  );
                                  setJarakJemput(null);
                                }
                                setLoadingJarakJemput(false);
                              }}
                            >
                              {loadingJarakJemput
                                ? "Menghitung..."
                                : "Cek Jarak & Ongkir via Maps"}
                            </button>
                            {jarakJemput && (
                              <div className="mt-2 text-xs">
                                Jarak: <b>{jarakJemput} km</b> <br />
                                Biaya Jemput:{" "}
                                <b>
                                  Rp{" "}
                                  {getOngkir(jarakJemput).toLocaleString(
                                    "id-ID"
                                  )}
                                </b>
                              </div>
                            )}
                            {errorJarakJemput && (
                              <div className="mt-2 text-xs text-red-600">
                                {errorJarakJemput}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
                {/* Keterangan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keterangan (Opsional)
                  </label>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    placeholder="Keterangan tambahan..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                {/* Upload Dokumen */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Foto KTP *
                    </label>
                    <input
                      type="file"
                      name="foto_ktp"
                      accept="image/*"
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Foto SIM *
                    </label>
                    <input
                      type="file"
                      name="foto_sim"
                      accept="image/*"
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                {/* Breakdown Estimasi */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <h3 className="text-base font-bold text-indigo-700 mb-2">
                    Estimasi Biaya Sewa
                  </h3>
                  {(() => {
                    const {
                      hargaAwal,
                      hargaSetelahDiskon,
                      total,
                      breakdown,
                      durasi,
                      biayaAntar,
                      biayaJemput,
                    } = calculateTotalPriceWithBreakdown();
                    return (
                      <>
                        <div className="flex justify-between text-sm text-gray-700 mb-1">
                          <span>Harga Awal per Hari:</span>
                          <span className="text-red-500 line-through">
                            Rp {hargaAwal.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700 mb-1">
                          <span>Harga Setelah Diskon:</span>
                          <span className="text-green-600 font-semibold">
                            Rp {hargaSetelahDiskon.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700 mb-1">
                          <span>Total Sewa ({durasi} hari):</span>
                          <span>
                            Rp{" "}
                            {(hargaSetelahDiskon * durasi).toLocaleString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                        {biayaAntar > 0 && (
                          <div className="flex justify-between text-sm text-gray-700 mb-1">
                            <span>Biaya Antar:</span>
                            <span>Rp {biayaAntar.toLocaleString("id-ID")}</span>
                          </div>
                        )}
                        {biayaJemput > 0 && (
                          <div className="flex justify-between text-sm text-gray-700 mb-1">
                            <span>Biaya Jemput:</span>
                            <span>
                              Rp {biayaJemput.toLocaleString("id-ID")}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-bold text-indigo-700 mt-2">
                          <span>Grand Total:</span>
                          <span>Rp {total.toLocaleString("id-ID")}</span>
                        </div>
                        {breakdown.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-1 font-semibold">
                              Rincian Penyesuaian Harga:
                            </p>
                            <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                              {breakdown.map((item, idx) => (
                                <li key={idx}>✅ {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full font-black bg-gradient-to-r from-indigo-600 to-blue-400 text-white hover:from-indigo-700 hover:to-blue-500 shadow-lg transition text-lg"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Konfirmasi & Sewa
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SECTION TESTIMONI/REVIEW CUSTOMER --- */}
      <section className="py-16 sm:py-20 px-3 sm:px-6 bg-gradient-to-br from-yellow-100 via-blue-50 to-white">
        <div className="max-w-5xl mx-auto text-center mb-9 sm:mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-blue-800">
            Apa Kata Customer?
          </h3>
        </div>
        {reviewLoading ? (
          <div className="flex justify-center items-center min-h-[160px]">
            <span className="text-blue-700 font-semibold animate-pulse">
              Memuat review pelanggan...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {reviewList.length > 0 ? (
              reviewList.map((t, i) => (
                <div
                  key={i}
                  className="bg-white p-7 rounded-2xl shadow-lg flex flex-col items-center"
                >
                  <img
                    src={randomAvatar(t.user?.nama)}
                    alt={t.user?.nama || "Customer"}
                    className="w-16 h-16 rounded-full object-cover mb-3 shadow"
                  />
                  <div className="flex items-center gap-1 text-yellow-400 mb-1">
                    {[...Array(5)].map((_, j) => (
                      <FaStar
                        key={j}
                        className={j < Number(t.rating) ? "" : "opacity-30"}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm mb-2 font-semibold">
                    "{t.pesan}"
                  </p>
                  <div className="text-blue-800 font-bold">
                    {t.user?.nama || "Customer"}
                  </div>
                  {t.kendaraan?.nama && (
                    <div className="text-xs text-gray-400 font-medium mt-1">
                      (Sewa {t.kendaraan?.nama})
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-gray-400 text-center font-medium">
                Belum ada review customer terbaru.
              </div>
            )}
          </div>
        )}
      </section>

      {/* --- SECTION LOKASI & ABOUT --- */}
      <section
        className="bg-blue-800 text-yellow-400 py-16 sm:py-20 px-3 sm:px-6"
        id="location"
      >
        <div className="max-w-6xl mx-auto text-center border border-yellow-400 rounded-xl py-7 sm:py-10 px-2 sm:px-4 shadow-lg">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-yellow-400">
            Available At
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-semibold mb-5 sm:mb-6 leading-relaxed">
            Jakarta | Jakarta Selatan
          </p>
          <a
            href="https://wa.me/6285776828467"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 px-5 sm:px-6 rounded shadow transition"
          >
            Contact Us
          </a>
        </div>
        <div className="mt-10 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 items-center">
          <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden">
            <iframe
              title="Map Location"
              src="https://www.google.com/maps?q=-6.2642677,106.8194088&hl=en&z=14&output=embed"
              width="100%"
              height="100%"
              loading="lazy"
              className="rounded-xl border-2 border-yellow-400 min-h-[220px]"
            ></iframe>
          </div>
          <div className="text-left text-white">
            <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-2">
              Head Office
            </h3>
            <p className="text-base sm:text-lg font-semibold mb-1">UI Works</p>
            <a
              href="https://maps.app.goo.gl/fyabSHRKeVKWJnrB6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-yellow-300 block mb-4"
            >
              Jalan Kemang Utara VII G No.2 RT 001 RW 004, Jakarta Selatan,
              Kodepos 12730
            </a>
            <p className="text-sm text-gray-300">
              Buka: <span className="text-white">Senin – Jumat</span> (kecuali
              tanggal merah)
              <br />
              Jam: <span className="text-white">09:00 – 17:00</span>
            </p>
          </div>
        </div>
      </section>

      {/* SECTION LAYANAN */}
      <section
        id="about"
        className="bg-white text-gray-800 py-20 sm:py-24 px-3 sm:px-6"
      >
        <div className="max-w-6xl mx-auto text-center mb-10 sm:mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-blue-800">
            LAYANAN KAMI
          </h3>
          <p className="text-gray-600">
            Kami menawarkan berbagai layanan sewa motor Jakarta yang fleksibel
            dan nyaman, siap memenuhi kebutuhan perjalanan Anda.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8">
          {[
            {
              title: "Sewa Motor 24 Jam",
              desc: "Layanan sewa motor harian, mingguan, atau bulanan. Armada terawat, harga kompetitif, siap pakai.",
              icon: (
                <FaCarSide className="text-3xl sm:text-4xl text-blue-700" />
              ),
            },
            {
              title: "Sewa Hiace & City Tour",
              desc: "Keliling Jakarta makin nyaman. Hiace dan driver profesional, cocok buat wisata/group event.",
              icon: (
                <FaShuttleVan className="text-3xl sm:text-4xl text-blue-700" />
              ),
            },
            {
              title: "Antar – Jemput Kendaraan",
              desc: "Motor diantar & diambil ke lokasi Anda. Praktis, aman, fleksibel.",
              icon: (
                <FaHandshake className="text-3xl sm:text-4xl text-blue-700" />
              ),
            },
            {
              title: "Tanpa DP/Deposit & Survey",
              desc: "Booking cepat tanpa perlu DP/Deposit, tanpa survey. Tinggal klik & berangkat!",
              icon: (
                <FaMoneyCheckAlt className="text-3xl sm:text-4xl text-blue-700" />
              ),
            },
          ].map(({ title, desc, icon }, i) => (
            <div
              key={i}
              className="flex gap-3 sm:gap-4 bg-gradient-to-br from-blue-50 via-white to-yellow-100 rounded-2xl shadow-md p-5 sm:p-6 hover:shadow-lg transition"
            >
              <div className="flex-shrink-0">{icon}</div>
              <div className="text-left">
                <h4 className="font-bold text-base sm:text-lg mb-1 text-blue-800">
                  {title}
                </h4>
                <p className="text-sm text-gray-700 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cara Rental */}
      <section
        className="bg-white text-gray-800 py-20 sm:py-24 px-3 sm:px-6"
        id="cara-rental"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-10 sm:mb-12">
            <span className="text-black">Cara Rental di </span>
            <span className="text-blue-800">MotoRent</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "Pesan Kendaraan",
                desc: "Pilih motor & tanggal via website.",
                icon: "📄",
              },
              {
                title: "Tunggu Konfirmasi",
                desc: "Admin hubungi via WhatsApp.",
                icon: "⏳",
              },
              {
                title: "Bayar & Nikmati",
                desc: "Lakukan pembayaran, motor siap digunakan.",
                icon: "💳",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 border rounded-2xl shadow hover:shadow-md transition bg-blue-50/30"
              >
                <div className="text-3xl sm:text-4xl mb-4">{item.icon}</div>
                <h4 className="text-base sm:text-lg font-bold mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keunggulan */}
      <section className="bg-gray-50 text-gray-800 py-16 sm:py-20 px-3 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 mb-8 sm:mb-10">
            Kenapa Pilih MotoRent?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: "🕒",
                title: "Sewa 24 Jam",
                desc: "Fleksibel sesuai kebutuhan.",
              },
              {
                icon: "🛡️",
                title: "Asuransi Unit",
                desc: "Perlindungan kendaraan mulai 15 ribu.",
              },
              {
                icon: "💰",
                title: "Harga Hemat",
                desc: "Mulai 40K/24 Jam, transparan, tanpa biaya tersembunyi.",
              },
              {
                icon: "📞",
                title: "CS Responsif",
                desc: "Support cepat via WhatsApp.",
              },
              {
                icon: "📍",
                title: "Antar Jemput",
                desc: "Motor diantar ke lokasi Anda.",
              },
              {
                icon: "🆓",
                title: "Tanpa DP/Deposit",
                desc: "Booking tanpa DP/Deposit, tanpa ribet.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl bg-white border hover:shadow-lg transition"
              >
                <div className="text-2xl sm:text-3xl mb-3">{item.icon}</div>
                <h4 className="text-md font-bold mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-24 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-blue-800">
              FAQ
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              Pertanyaan yang sering ditanyakan user
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-10">
            {[
              {
                icon: "📋",
                q: "Bagaimana cara pesan motor?",
                a: "Pilih motor, isi form, ikuti instruksi di WhatsApp.",
              },
              {
                icon: "🧾",
                q: "Dokumen yang dibutuhkan?",
                a: "KTP, SIM, atau kartu identitas lain.",
              },
              {
                icon: "🚗",
                q: "Lepas kunci atau driver?",
                a: "Saat ini baru tersedia lepas kunci.",
              },
              {
                icon: "🔞",
                q: "Usia minimum sewa?",
                a: "Minimal 17 tahun dengan identitas valid.",
              },
              {
                icon: "💸",
                q: "Biaya tambahan luar kota?",
                a: "Ada tambahan, dikonfirmasi admin sebelum sewa.",
              },
              {
                icon: "📦",
                q: "Layanan antar jemput?",
                a: "Ada, tarif mulai 50 ribu, bisa dipilih saat booking.",
              },
              {
                icon: "💳",
                q: "Cara bayar?",
                a: "Transfer bank/e-wallet/kartu kredit, dibayar saat serah terima.",
              },
              {
                icon: "⛽",
                q: "Harus isi bensin sebelum kembali?",
                a: "Kembalikan sesuai level saat terima motor.",
              },
            ].map(({ icon, q, a }, i) => (
              <div key={i} className="flex items-start gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl text-blue-700">{icon}</div>
                <div>
                  <h4 className="font-semibold text-base sm:text-lg mb-1">
                    {q}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* FOOTER */}
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
