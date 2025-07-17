import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  BadgeCheck,
  CreditCard,
  Timer,
  XCircle,
} from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";

export default function DetailPenyewaan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [penyewaan, setPenyewaan] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await API.get(`/penyewaan/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPenyewaan(res.data);
      } catch (err) {
        alert("Data tidak ditemukan.");
        navigate("/dashboard/history");
      }
    };
    fetchDetail();
  }, [id, navigate]);

  useEffect(() => {
    const closeOnEsc = (e) => {
      if (e.key === "Escape") setModalImage(null);
    };
    if (modalImage) window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, [modalImage]);

  useEffect(() => {
    // Jika menunggu pembayaran, scroll ke tombol pembayaran
    if (penyewaan?.status === "MENUNGGU_PEMBAYARAN") {
      setTimeout(() => {
        const bayarBtn = document.getElementById("bayar-sekarang");
        bayarBtn && bayarBtn.scrollIntoView({ behavior: "smooth" });
      }, 700);
    }
  }, [penyewaan]);

  if (!penyewaan)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-10 h-10 border-b-2 border-blue-600 rounded-full mr-4"></div>
        <span className="text-lg text-blue-700 font-semibold">
          Memuat data penyewaan...
        </span>
      </div>
    );

  const showroomAlamat =
    "Jl. Kemang Utara VII G No.2, RT 001/ RW04, Jakarta Selatan";
  const linkMaps =
    "https://maps.google.com/?q=Jl.+Kemang+Utara+VII+G+No.2,+RT+001+RW04,+Jakarta+Selatan";

  const badgeStatus = (status) => {
    let bg, tx, label, icon;
    switch (status) {
      case "BERHASIL":
        bg = "bg-green-100";
        tx = "text-green-700";
        label = "Berhasil";
        icon = <BadgeCheck className="w-4 h-4 mr-1" />;
        break;
      case "MENUNGGU_PEMBAYARAN":
        bg = "bg-yellow-100 animate-pulse";
        tx = "text-yellow-700";
        label = "Menunggu Pembayaran";
        icon = <Timer className="w-4 h-4 mr-1" />;
        break;
      case "DIBATALKAN":
      case "GAGAL":
        bg = "bg-red-100";
        tx = "text-red-700";
        label = status === "DIBATALKAN" ? "Dibatalkan" : "Gagal";
        icon = <XCircle className="w-4 h-4 mr-1" />;
        break;
      default:
        bg = "bg-gray-100";
        tx = "text-gray-600";
        label = status;
        icon = null;
    }
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-xs shadow ${bg} ${tx}`}
      >
        {icon}
        {label}
      </span>
    );
  };

  // BADGE UNTUK STATUS PESANAN/TRACKING
  const badgeStatusPesanan = (status_pesanan) => {
    let bg, tx;
    switch (status_pesanan) {
      case "Sedang Dikemas":
        bg = "bg-yellow-100";
        tx = "text-yellow-800";
        break;
      case "Segera Ambil di Showroom":
        bg = "bg-purple-100";
        tx = "text-purple-800";
        break;
      case "Dikirim":
        bg = "bg-blue-100";
        tx = "text-blue-800";
        break;
      case "Telah Sampai di Tempat Customer":
        bg = "bg-green-100";
        tx = "text-green-800";
        break;
      case "Proses Pengambilan Motor Sewa di Tempat Customer":
        bg = "bg-orange-100";
        tx = "text-orange-800";
        break;
      case "Selesai Pengambilan Motor dari Tempat Customer":
        bg = "bg-gray-100";
        tx = "text-gray-800";
        break;
      default:
        bg = "bg-gray-50";
        tx = "text-gray-500";
    }
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow ${bg} ${tx}`}
      >
        {status_pesanan}
      </span>
    );
  };

  // Modal preview animasi
  const ModalImagePreview = ({ src, onClose }) => (
    <AnimatePresence>
      <motion.div
        key="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={onClose}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          initial={{ scale: 0.92 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 320, damping: 25 }}
          className="relative flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-8 right-0 text-white text-3xl font-bold rounded-full p-1 hover:bg-white/20 focus:outline-none"
            aria-label="Tutup"
            autoFocus
          >
            ×
          </button>
          <img
            src={src}
            alt="Preview"
            className="max-w-[96vw] max-h-[90vh] rounded-lg shadow-2xl border-4 border-white bg-white"
            draggable="true"
          />
          <div className="mt-4 flex gap-3">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="px-4 py-2 rounded bg-white text-blue-700 font-bold shadow hover:bg-blue-100 transition"
            >
              Download
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <AnimatePresence>
        {modalImage && (
          <ModalImagePreview
            src={modalImage}
            onClose={() => setModalImage(null)}
          />
        )}
      </AnimatePresence>

      {/* Sticky Header Back */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur shadow px-2 sm:px-6 py-2">
        <button
          onClick={() => navigate("/dashboard/history")}
          className="flex items-center gap-2 text-blue-800 hover:text-yellow-600 hover:underline font-bold text-base"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Riwayat
        </button>
      </div>

      <div className="flex-grow px-2 sm:px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 170, damping: 16 }}
            className="bg-white rounded-3xl shadow-2xl p-5 sm:p-9 space-y-8 border border-blue-100"
          >
            <h2 className="text-2xl font-black text-indigo-700 text-center drop-shadow-sm tracking-wide mb-2">
              Detail Penyewaan{" "}
              <span className="text-blue-500">#{penyewaan.id}</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-gray-50 rounded-xl overflow-hidden shadow aspect-video min-w-[200px] max-w-[380px] flex items-center justify-center cursor-pointer border-2 border-blue-100 hover:border-yellow-400 transition"
                onClick={() =>
                  penyewaan.kendaraan?.gambar &&
                  setModalImage(penyewaan.kendaraan.gambar)
                }
                title="Klik untuk perbesar"
              >
                <img
                  src={
                    penyewaan.kendaraan?.gambar
                      ? penyewaan.kendaraan.gambar
                      : "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  alt={penyewaan.kendaraan?.nama}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="flex-1 space-y-2 text-[15px] sm:text-base text-gray-800">
                <div className="flex gap-2 flex-wrap mb-1">
                  {badgeStatus(penyewaan.status)}
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-xs">
                    ⏳ {penyewaan.durasi_hari} hari
                  </span>
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-xs">
                    💸 Rp{" "}
                    {Number(penyewaan.harga_total).toLocaleString("id-ID")}
                  </span>
                </div>

                {/* STATUS PESANAN/TRACKING */}
                <div className="my-3">
                  <span className="font-semibold text-gray-700 block mb-1">
                    Status Pesanan:
                  </span>
                  {badgeStatusPesanan(penyewaan.status_pesanan)}
                </div>

                <div className="font-bold text-lg text-indigo-700 mb-1 flex items-center gap-2">
                  <span>{penyewaan.kendaraan?.nama}</span>
                  <span className="ml-1 font-normal text-xs text-gray-400">
                    #{penyewaan.kendaraan?.id}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mb-2">
                  <span className="bg-yellow-50 text-yellow-800 px-2 py-1 rounded text-xs">
                    {penyewaan.kendaraan?.tipe}
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs">
                    {penyewaan.kendaraan?.transmisi}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Jadwal:</span>{" "}
                  {new Date(penyewaan.jadwal_booking).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div>
                  <span className="font-semibold">Metode Pengambilan:</span>
                  <div>
                    {penyewaan.metode_pengambilan === "Diantar" ? (
                      <span>
                        🚚 Diantar ke Lokasi Kamu:
                        <br />
                        <span className="ml-4">
                          {penyewaan.alamat_pengambilan || "-"}
                        </span>
                      </span>
                    ) : (
                      <span>
                        📍 Ambil di Showroom <br />
                        <span className="ml-4">{showroomAlamat}</span>
                        <a
                          href={linkMaps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 underline text-xs inline-flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" /> Lihat di
                          Maps
                        </a>
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-semibold">Metode Pengembalian:</span>
                  <div>
                    {penyewaan.metode_pengembalian === "Diambil" ? (
                      <span>
                        🚚 Diambil dari Lokasi Kamu:
                        <br />
                        <span className="ml-4">
                          {penyewaan.alamat_pengembalian || "-"}
                        </span>
                      </span>
                    ) : (
                      <span>
                        📍 Kembali ke Showroom <br />
                        <span className="ml-4">{showroomAlamat}</span>
                        <a
                          href={linkMaps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 underline text-xs inline-flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" /> Lihat di
                          Maps
                        </a>
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-semibold">Keterangan:</span>{" "}
                  {penyewaan.keterangan || "-"}
                </div>
                <div>
                  <span className="font-semibold">Pembayaran:</span>{" "}
                  {penyewaan.metode_pembayaran?.toUpperCase() || "-"}
                </div>

                {/* Tambahan tombol WhatsApp di bawah pembayaran */}
                <div className="mt-4">
                  <h3 className="text-base font-semibold text-indigo-700 mb-2">
                    More Information by Whatsapp
                  </h3>
                  <a
                    href={`https://wa.me/6285776828467?text=${encodeURIComponent(
                      "Halo! saya butuh bantuan terkait pesanan saya, apakah bisa dibantu?"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-full transition text-base shadow"
                  >
                    <BsWhatsapp className="w-5 h-5" />
                    Whatsapp
                  </a>
                </div>
              </div>
            </div>
            {/* Dokumen KTP & SIM */}
            <div className="grid md:grid-cols-2 gap-7 pt-7 border-t">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold">Foto KTP</span>
                </div>
                <div className="bg-gray-100 rounded-xl overflow-hidden h-44 flex items-center justify-center border-2 border-blue-50">
                  <img
                    src={
                      penyewaan.foto_ktp
                        ? penyewaan.foto_ktp
                        : "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt="Foto KTP"
                    className="object-cover w-full h-full cursor-pointer hover:scale-105 transition"
                    onClick={() =>
                      penyewaan.foto_ktp && setModalImage(penyewaan.foto_ktp)
                    }
                    title="Klik untuk perbesar"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold">Foto SIM</span>
                </div>
                <div className="bg-gray-100 rounded-xl overflow-hidden h-44 flex items-center justify-center border-2 border-blue-50">
                  <img
                    src={
                      penyewaan.foto_sim
                        ? penyewaan.foto_sim
                        : "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt="Foto SIM"
                    className="object-cover w-full h-full cursor-pointer hover:scale-105 transition"
                    onClick={() =>
                      penyewaan.foto_sim && setModalImage(penyewaan.foto_sim)
                    }
                    title="Klik untuk perbesar"
                  />
                </div>
              </div>
            </div>
            {/* Bayar sekarang jika menunggu pembayaran */}
            {penyewaan.status === "MENUNGGU_PEMBAYARAN" &&
              penyewaan.payment_url && (
                <div className="mt-8 border-t pt-6 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-gray-700 mb-3 text-sm">
                      Status pembayaran:{" "}
                      <span className="font-semibold text-yellow-700">
                        Belum Lunas
                      </span>
                    </p>
                    <a
                      href={penyewaan.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-yellow-400 text-blue-900 font-bold px-8 py-3 rounded-full hover:bg-yellow-500 hover:scale-105 transition text-lg shadow-lg"
                      id="bayar-sekarang"
                    >
                      <CreditCard className="w-6 h-6" />
                      Bayar Sekarang
                    </a>
                  </motion.div>
                </div>
              )}
          </motion.div>
        </div>
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
