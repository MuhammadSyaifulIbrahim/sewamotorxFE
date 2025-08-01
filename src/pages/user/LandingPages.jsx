import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsWhatsapp } from "react-icons/bs";
import {
  FaCarSide,
  FaShuttleVan,
  FaHandshake,
  FaMoneyCheckAlt,
  FaStar,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import axios from "axios";
// --- ASSET ---
import GENIO from "../../assets/GenioNoBG.png";
import NMAX from "../../assets/NMAXNoBG.png";
import XMAX from "../../assets/XMAXNoBG.png";
import AEROX from "../../assets/AEROXNoBG.png";
import SCOOPY from "../../assets/SCOOPYNoBG.png";
import MIO from "../../assets/MIONoBG.png";
import PCX from "../../assets/PCXNoBG.png";
import BANNER1 from "../../assets/Carousel1.png";
import BANNER2 from "../../assets/Carousel2.png";
import BANNER3 from "../../assets/Carousel3.png";
import LogoNoBG from "../../assets/LogoNoBG.png";

// Ganti dengan base url API kamu jika beda
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://sewamotorxbe-production.up.railway.app/api";

// Data Motor
const MOTORLIST = [
  {
    name: "Genio",
    brand: "HONDA",
    tahun: "2022",
    img: GENIO,
    price: 100000,
    type: "Matic",
    diskon: 10,
    best: true,
  },
  {
    name: "NMAX",
    brand: "YAMAHA",
    tahun: "2023",
    img: NMAX,
    price: 200000,
    type: "Matic",
    diskon: 15,
    best: true,
  },
  {
    name: "Aerox",
    brand: "YAMAHA",
    tahun: "2022",
    img: AEROX,
    price: 185000,
    type: "Matic",
    diskon: 10,
    best: false,
  },
  {
    name: "Scoopy",
    brand: "HONDA",
    tahun: "2023",
    img: SCOOPY,
    price: 100000,
    type: "Matic",
    diskon: 0,
    best: false,
  },
  {
    name: "Mio",
    brand: "YAMAHA",
    tahun: "2021",
    img: MIO,
    price: 85000,
    type: "Matic",
    diskon: 0,
    best: false,
  },
  {
    name: "XMAX",
    brand: "YAMAHA",
    tahun: "2023",
    img: XMAX,
    price: 300000,
    type: "Matic",
    diskon: 20,
    best: true,
  },
  {
    name: "PCX",
    brand: "HONDA",
    tahun: "2022",
    img: PCX,
    price: 275000,
    type: "Matic",
    diskon: 0,
    best: false,
  },
];

// Avatar generator (auto avatar jika tidak ada foto user)
const randomAvatar = (nama = "") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nama
  )}&background=6E9EF8&color=fff&rounded=true&bold=true&size=128`;

export default function LandingPages() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [reviewList, setReviewList] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);

  // AUTO SCROLL CAROUSEL MOTOR
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const container = containerRef.current;
      if (container) {
        const scrollAmount = isMobile ? 2 : 1.3;
        container.scrollLeft += scrollAmount;
        if (
          container.scrollLeft + container.clientWidth >=
          container.scrollWidth - 5
        ) {
          container.scrollLeft = 0;
        }
      }
    }, 16);
    return () => clearInterval(interval);
  }, [isPaused, isMobile]);

  // Hide scrollX di body
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "";
    };
  }, []);

  // === Fetch Review Public dari Backend ===
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

  return (
    <div className="scroll-smooth overflow-x-hidden font-sans bg-gradient-to-br from-blue-50 via-white to-yellow-50 min-h-screen">
      {/* Navbar */}
      <header className="w-full">
        <nav className="max-w-7xl mx-auto mt-3 sm:mt-4 rounded-full bg-white/90 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-center border border-blue-100 backdrop-blur-lg">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
          <div className="space-x-1 sm:space-x-2 flex gap-2">
            <button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-purple-800 px-5 sm:px-6 py-2 rounded-full font-bold hover:opacity-90 transition text-sm sm:text-base"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-blue-700 text-white font-bold px-5 sm:px-6 py-2 rounded-full hover:bg-yellow-400 hover:text-blue-900 transition text-sm sm:text-base"
            >
              Register
            </button>
          </div>
        </nav>
      </header>

      {/* Banner Carousel */}
      <section className="mb-8 mt-8 max-w-6xl mx-auto w-full px-2">
        <div className="rounded-3xl shadow-1xl overflow-hidden w-full aspect-video bg-gray-100">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4200, disableOnInteraction: false }}
            slidesPerView={1}
            loop
            className="w-full h-full"
          >
            {[BANNER1, BANNER2, BANNER3].map((img, idx) => (
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

      {/* Pilihan Motor Favorit */}
      <section
        className="text-white pt-8 pb-12 sm:pt-14 sm:pb-20 px-1 sm:px-6 relative"
        style={{
          background: "linear-gradient(105deg,#3b82f6 30%,#fde047 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-yellow-200/0" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase text-white">
            Pilihan Motor Favorit
          </h2>
          <div className="h-1 w-24 bg-yellow-400 mx-auto mt-2 mb-7 sm:mb-10 rounded-full" />
          {/* Card list */}
          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {[...MOTORLIST, ...MOTORLIST].map((m, i) => (
              <motion.div
                key={i}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 32px rgba(27, 74, 210, 0.18)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 17 }}
                className="motor-card relative flex flex-col rounded-2xl min-w-[82vw] max-w-[94vw] sm:min-w-[320px] sm:max-w-xs md:min-w-[260px] md:max-w-[320px] w-full overflow-hidden border border-blue-100 bg-white text-black group snap-center"
              >
                {/* Badge Diskon dan Best Seller */}
                {m.diskon > 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                    -{m.diskon}%
                  </span>
                )}
                {m.best && (
                  <span className="absolute top-4 left-4 bg-yellow-400 text-purple-900 font-bold px-3 py-1 rounded-full text-xs animate-pulse">
                    Best Seller
                  </span>
                )}

                {/* Gambar Motor */}
                <div className="w-full h-[34vw] max-h-[180px] sm:h-[170px] md:h-[180px] flex items-center justify-center bg-white pt-2">
                  <img
                    src={m.img}
                    alt={m.name}
                    className="h-full object-contain mx-auto"
                    style={{ maxHeight: "170px", width: "auto" }}
                    draggable={false}
                  />
                </div>

                {/* Detail & Button */}
                <div className="p-3 pb-4 pt-2 flex flex-col flex-grow">
                  {/* Brand + Tahun */}
                  <div className="text-xs font-bold mb-1 uppercase text-gray-500 min-h-[36px]">
                    {m.brand} {m.name}{" "}
                    <span className="text-xs font-normal">{m.tahun}</span>
                  </div>

                  {/* Nama */}
                  <h3 className="font-extrabold text-lg mb-1 min-h-[28px]">
                    {m.name}
                  </h3>

                  {/* Jenis & Harga */}
                  <div className="flex items-center gap-2 text-gray-700 mb-2 flex-wrap min-h-[48px]">
                    <span className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                      {m.type}
                    </span>
                    <div className="flex flex-col gap-1 min-h-[45px]">
                      <span
                        className={`line-through text-red-500 font-medium text-sm ${
                          m.diskon > 0 ? "" : "invisible"
                        }`}
                      >
                        Rp{m.price.toLocaleString("id-ID")}
                      </span>
                      <span className="text-green-600 font-bold text-base">
                        Rp
                        {(m.price * (1 - m.diskon / 100)).toLocaleString(
                          "id-ID"
                        )}
                        /hari
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-yellow-500 mb-2 min-h-[24px]">
                    {[...Array(5)].map((_, j) => (
                      <FaStar key={j} />
                    ))}
                  </div>

                  {/* Fasilitas */}
                  <div className="flex justify-around text-xs text-gray-700 mb-3 min-h-[24px]">
                    <span>🪖 2x Helm</span>
                    <span>🧥 2x Jas Hujan</span>
                    <span>📱 Holder HP</span>
                  </div>

                  {/* Tombol Sewa Motor */}
                  <button
                    onClick={() => {
                      alert("Untuk memesan, silakan login terlebih dahulu.");
                      navigate("/login");
                    }}
                    className="mt-auto w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold py-2 rounded-full transition"
                  >
                    Sewa Motor
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          <style>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      </section>

      {/* WhatsApp Floating */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
        className="fixed bottom-16 right-5 z-50 flex flex-col items-center space-y-1"
      >
        <span className="text-sm font-semibold text-green-700 select-none cursor-default flex items-center gap-1">
          Nomor CS <span className="text-lg">⬇️</span>
        </span>
        <a
          href="https://wa.me/6285776828467"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition"
        >
          <BsWhatsapp size={28} />
        </a>
      </motion.div>

      {/* Testimoni / Review Customer */}
      <section
        id="testimoni"
        className="py-16 sm:py-20 px-3 sm:px-6 bg-gradient-to-br from-yellow-100 via-blue-50 to-white"
      >
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
                  className="bg-white p-7 rounded-2xl flex flex-col items-center"
                >
                  <img
                    src={randomAvatar(t.user?.nama)}
                    alt={t.user?.nama || "Customer"}
                    className="w-16 h-16 rounded-full object-cover mb-3"
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

      {/* Location */}
      <section
        className="bg-blue-800 text-yellow-400 py-16 sm:py-20 px-3 sm:px-6"
        id="location"
      >
        <div className="max-w-6xl mx-auto text-center border border-yellow-400 rounded-xl py-7 sm:py-10 px-2 sm:px-4">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-yellow-400">
            Available At
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-semibold mb-5 sm:mb-6 leading-relaxed">
            Jakarta | Jakarta Selatan
          </p>
          <a
            href="https://wa.me/6285776828467"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 px-5 sm:px-6 rounded"
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

      {/* About/Layanan */}
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
              className="flex gap-3 sm:gap-4 bg-gradient-to-br from-blue-50 via-white to-yellow-100 rounded-2xl sm:p-6 transition"
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
                className="p-5 sm:p-6 border rounded-2xl hover:shadow-md transition bg-blue-50/30"
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
              <p>📞 +62-857-7682-8467 </p>
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
              <li>
                <a href="#faq" className="hover:underline">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#testimoni" className="hover:underline">
                  Testimoni
                </a>
              </li>
              <li>
                <a href="#about" className="hover:underline">
                  Layanan Kami
                </a>
              </li>
              <li>
                <a href="#cara-rental" className="hover:underline">
                  Cara Rental
                </a>
              </li>
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
