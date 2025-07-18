import React, { useState, useEffect, useRef } from "react";
import {
  FiUploadCloud,
  FiCheckCircle,
  FiAlertCircle,
  FiClipboard,
} from "react-icons/fi";
import { motion } from "framer-motion";
import axios from "axios";
import AdminLayout from "../../layouts/AdminLayout";

export default function BuktiMotor() {
  const [listPesanan, setListPesanan] = useState([]);
  const [selectedPesanan, setSelectedPesanan] = useState("");
  const [detailPesanan, setDetailPesanan] = useState(null);
  const [buktiPenerimaan, setBuktiPenerimaan] = useState(null);
  const [buktiPengembalian, setBuktiPengembalian] = useState(null);
  const [previewPenerimaan, setPreviewPenerimaan] = useState(null);
  const [previewPengembalian, setPreviewPengembalian] = useState(null);
  const [notif, setNotif] = useState(null);
  const inputRef1 = useRef();
  const inputRef2 = useRef();

  // Ambil daftar pesanan aktif
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/penyewaan`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      })
      .then((res) => {
        // Filter hanya yang status bukan SELESAI/GAGAL/DIBATALKAN
        const aktif = (res.data.data || res.data).filter(
          (item) =>
            !["SELESAI", "GAGAL", "DIBATALKAN"].includes(
              item.status?.toUpperCase()
            )
        );
        setListPesanan(aktif);
      })
      .catch(() => setListPesanan([]));
  }, []);

  // Saat pilih pesanan, ambil detail (termasuk bukti foto)
  useEffect(() => {
    if (!selectedPesanan) {
      setDetailPesanan(null);
      setPreviewPenerimaan(null);
      setPreviewPengembalian(null);
      return;
    }
    axios
      .get(`${import.meta.env.VITE_API_URL}/penyewaan/${selectedPesanan}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      })
      .then((res) => {
        setDetailPesanan(res.data);
        setPreviewPenerimaan(res.data.bukti_penerimaan || null);
        setPreviewPengembalian(res.data.bukti_pengembalian || null);
      })
      .catch(() => {
        setDetailPesanan(null);
        setPreviewPenerimaan(null);
        setPreviewPengembalian(null);
      });
  }, [selectedPesanan]);

  const handleChange = (setter, previewSetter) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  // === FIXED: Gunakan endpoint dengan prefix "/penyewaan/" ===
  const handleUpload = async (type) => {
    if (!selectedPesanan) {
      setNotif({ type: "error", msg: "Pilih pesanan terlebih dahulu!" });
      return;
    }
    setNotif({ type: "info", msg: "Mengupload bukti..." });
    try {
      const formData = new FormData();
      formData.append(
        "foto",
        type === "penerimaan" ? buktiPenerimaan : buktiPengembalian
      );
      const endpoint =
        type === "penerimaan"
          ? `/penyewaan/upload/bukti-penerimaan/${selectedPesanan}`
          : `/penyewaan/upload/bukti-pengembalian/${selectedPesanan}`;
      await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      setNotif({
        type: "success",
        msg: `Bukti ${
          type === "penerimaan" ? "penerimaan" : "pengembalian"
        } berhasil diupload!`,
      });
      setTimeout(() => {
        setBuktiPenerimaan(null);
        setBuktiPengembalian(null);
        axios
          .get(`${import.meta.env.VITE_API_URL}/penyewaan/${selectedPesanan}`, {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          })
          .then((res) => {
            setDetailPesanan(res.data);
            setPreviewPenerimaan(res.data.bukti_penerimaan || null);
            setPreviewPengembalian(res.data.bukti_pengembalian || null);
          });
      }, 1000);
    } catch (err) {
      setNotif({
        type: "error",
        msg: "Gagal upload bukti. Pastikan file gambar valid.",
      });
    }
  };

  // Format tanggal
  const fmtTanggal = (tgl) =>
    tgl
      ? new Date(tgl).toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "-";

  // HALAMAN UTAMA
  const content = (
    <div className="max-w-3xl mx-auto pt-4 pb-14 px-2 md:px-0">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="mb-7"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-800 mb-1 flex items-center gap-2">
          <FiUploadCloud className="text-blue-500" /> Bukti Penerimaan &
          Pengembalian Motor
        </h1>
        <p className="text-gray-500 mb-2 md:mb-4 text-xs sm:text-sm">
          Upload foto sebagai bukti serah terima dan pengembalian motor,
          pastikan sesuai dengan data pesanan.
        </p>
      </motion.div>

      {notif && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl mb-6 shadow-lg transition-all
          ${
            notif.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : notif.type === "error"
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }
        `}
        >
          {notif.type === "success" && <FiCheckCircle className="text-lg" />}
          {notif.type === "error" && <FiAlertCircle className="text-lg" />}
          <span>{notif.msg}</span>
        </motion.div>
      )}

      {/* Dropdown Pilih Pesanan */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-5"
      >
        <label className="block text-sm font-medium text-blue-800 mb-2">
          Pilih Pesanan
        </label>
        <select
          className="w-full bg-white border-2 border-blue-200 rounded-xl px-3 py-2 text-blue-900 outline-blue-400 focus:shadow-lg transition font-semibold text-sm"
          value={selectedPesanan}
          onChange={(e) => setSelectedPesanan(e.target.value)}
        >
          <option value="">-- Pilih pesanan --</option>
          {listPesanan.length === 0 && (
            <option disabled>Tidak ada pesanan berjalan</option>
          )}
          {listPesanan.map((p) => (
            <option key={p.id} value={p.id}>
              {`#${p.id} | ${p.nama_penyewa || p.nama || "Penyewa"} | ${
                p.kendaraan?.nama || p.nama_motor || "Motor"
              } | ${fmtTanggal(p.jadwal_booking || p.tanggal_mulai)}`}
            </option>
          ))}
        </select>
      </motion.div>

      {/* === DETAIL PESANAN === */}
      {detailPesanan && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-3 py-3 mb-7 shadow text-xs sm:text-sm text-blue-900">
          <div className="font-bold text-base sm:text-lg text-blue-700 mb-1 flex items-center gap-2">
            <span>
              <FiClipboard />
            </span>{" "}
            Detail Pesanan
          </div>
          <div className="space-y-1">
            <div>
              <b>Nama:</b> {detailPesanan.nama_penyewa || detailPesanan.nama}
            </div>
            <div>
              <b>Telepon:</b> {detailPesanan.nomor_telepon || "-"}
            </div>
            <div>
              <b>Motor:</b>{" "}
              {detailPesanan.kendaraan?.nama || detailPesanan.nama_motor || "-"}
            </div>
            <div>
              <b>Metode Pengambilan:</b>{" "}
              {detailPesanan.metode_pengambilan === "Diantar"
                ? `Diantar ke Lokasi (${
                    detailPesanan.alamat_pengambilan || "-"
                  })`
                : "Ambil di Showroom"}
            </div>
            <div>
              <b>Metode Pengembalian:</b>{" "}
              {detailPesanan.metode_pengembalian === "Diambil"
                ? `Diambil dari Lokasi (${
                    detailPesanan.alamat_pengembalian || "-"
                  })`
                : "Kembali ke Showroom"}
            </div>
            <div>
              <b>Jadwal Booking:</b> {fmtTanggal(detailPesanan.jadwal_booking)}
            </div>
            <div>
              <b>Keterangan:</b> {detailPesanan.keterangan || "-"}
            </div>
            <div>
              <b>Status Pembayaran:</b>{" "}
              {detailPesanan.status?.replaceAll("_", " ")}
            </div>
            <div>
              <b>Metode Pembayaran:</b>{" "}
              {detailPesanan.metode_pembayaran?.toUpperCase() || "-"}
            </div>
            {detailPesanan.payment_url && (
              <div>
                <b>Invoice Xendit:</b>{" "}
                <a
                  href={detailPesanan.payment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Lihat Invoice
                </a>
              </div>
            )}
            {detailPesanan.foto_ktp && (
              <div>
                <b>KTP:</b>{" "}
                <a
                  href={detailPesanan.foto_ktp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Lihat KTP
                </a>
              </div>
            )}
            {detailPesanan.foto_sim && (
              <div>
                <b>SIM:</b>{" "}
                <a
                  href={detailPesanan.foto_sim}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Lihat SIM
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === UPLOAD/EDIT BUKTI === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Bukti Penerimaan */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl px-3 sm:px-6 py-5 sm:py-7 flex flex-col items-center border border-blue-100"
        >
          <span className="font-bold text-blue-600 mb-3 text-sm sm:text-base">
            Bukti Penerimaan
          </span>
          {previewPenerimaan && (
            <a
              href={previewPenerimaan}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={previewPenerimaan}
                alt="Bukti Penerimaan"
                className="rounded-xl w-full max-w-[290px] object-cover max-h-40 sm:max-h-48 shadow mb-2 border"
              />
            </a>
          )}
          <button
            onClick={() => inputRef1.current.click()}
            className="rounded-xl border-2 border-dashed border-blue-300 w-full min-h-[100px] flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 transition group text-xs"
          >
            <FiUploadCloud className="text-2xl sm:text-3xl text-blue-300 group-hover:text-blue-500" />
            <span className="text-blue-400 font-semibold">Upload Foto</span>
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={inputRef1}
            onChange={handleChange(setBuktiPenerimaan, setPreviewPenerimaan)}
          />
          <button
            disabled={!buktiPenerimaan}
            onClick={() => handleUpload("penerimaan")}
            className={`w-full mt-3 py-2 rounded-xl font-bold transition text-xs sm:text-base
              ${
                buktiPenerimaan
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow"
                  : "bg-blue-100 text-blue-400 cursor-not-allowed"
              }`}
          >
            Simpan Bukti
          </button>
        </motion.div>

        {/* Bukti Pengembalian */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl px-3 sm:px-6 py-5 sm:py-7 flex flex-col items-center border border-blue-100"
        >
          <span className="font-bold text-blue-600 mb-3 text-sm sm:text-base">
            Bukti Pengembalian
          </span>
          {previewPengembalian && (
            <a
              href={previewPengembalian}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={previewPengembalian}
                alt="Bukti Pengembalian"
                className="rounded-xl w-full max-w-[290px] object-cover max-h-40 sm:max-h-48 shadow mb-2 border"
              />
            </a>
          )}
          <button
            onClick={() => inputRef2.current.click()}
            className="rounded-xl border-2 border-dashed border-blue-300 w-full min-h-[100px] flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 transition group text-xs"
          >
            <FiUploadCloud className="text-2xl sm:text-3xl text-blue-300 group-hover:text-blue-500" />
            <span className="text-blue-400 font-semibold">Upload Foto</span>
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={inputRef2}
            onChange={handleChange(
              setBuktiPengembalian,
              setPreviewPengembalian
            )}
          />
          <button
            disabled={!buktiPengembalian}
            onClick={() => handleUpload("pengembalian")}
            className={`w-full mt-3 py-2 rounded-xl font-bold transition text-xs sm:text-base
              ${
                buktiPengembalian
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow"
                  : "bg-blue-100 text-blue-400 cursor-not-allowed"
              }`}
          >
            Simpan Bukti
          </button>
        </motion.div>
      </div>
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
}
