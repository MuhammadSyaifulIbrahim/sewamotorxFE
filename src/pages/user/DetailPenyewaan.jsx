import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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

export default function DetailPenyewaan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [penyewaan, setPenyewaan] = useState(null);
  const [modalImage, setModalImage] = useState(null);

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

  useEffect(() => {
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
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("justPaid") === "true") {
      fetchDetail();
      const timeout = setTimeout(() => {
        navigate(location.pathname, { replace: true });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [location.search, location.pathname, navigate]);

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
    <div className="min-h-screen py-10 px-4">
      {modalImage && (
        <ModalImagePreview
          src={modalImage}
          onClose={() => setModalImage(null)}
        />
      )}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-blue-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard/history")}
            className="flex items-center text-blue-700 hover:underline"
          >
            <ArrowLeft className="w-5 h-5 mr-1" /> Kembali
          </button>
          {badgeStatus(penyewaan.status)}
        </div>
        <h1 className="text-2xl font-bold mb-4 text-indigo-700">
          Detail Penyewaan #{penyewaan.id}
        </h1>
        <div className="grid gap-4">
          <div>
            <strong>Nama Motor:</strong> {penyewaan.kendaraan?.nama || "-"}
          </div>
          <div>
            <strong>Jadwal Booking:</strong>{" "}
            {new Date(penyewaan.jadwal_booking).toLocaleString("id-ID")}
          </div>
          <div>
            <strong>Durasi:</strong> {penyewaan.durasi_hari} hari
          </div>
          <div>
            <strong>Harga Total:</strong> Rp{" "}
            {Number(penyewaan.harga_total).toLocaleString("id-ID")}
          </div>
          <div>
            <strong>Pengambilan:</strong>{" "}
            {penyewaan.metode_pengambilan === "Diantar"
              ? `Diantar ke: ${penyewaan.alamat_pengambilan}`
              : `Ambil di showroom: ${showroomAlamat}`}
          </div>
          <div>
            <strong>Pengembalian:</strong>{" "}
            {penyewaan.metode_pengembalian === "Diambil"
              ? `Diambil dari: ${penyewaan.alamat_pengembalian}`
              : `Kembali ke showroom: ${showroomAlamat}`}
          </div>
        </div>

        {penyewaan.status === "MENUNGGU_PEMBAYARAN" &&
          penyewaan.payment_url && (
            <div className="mt-8 text-center border-t pt-6">
              <p className="text-yellow-700 font-semibold mb-3">
                ⚠️ Status: Belum Lunas
              </p>
              <a
                href={penyewaan.payment_url}
                target="_blank"
                rel="noopener noreferrer"
                id="bayar-sekarang"
                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold rounded-full shadow"
              >
                <CreditCard className="w-5 h-5" /> Bayar Sekarang
              </a>
            </div>
          )}
      </div>
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
