import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { FiClipboard, FiEye, FiTrash2, FiCheckCircle } from "react-icons/fi";

const DAFTAR_STATUS_PESANAN = [
  "Sedang Dikemas",
  "Segera Ambil di Showroom",
  "Dikirim",
  "Telah Sampai di Tempat Customer",
  "Proses Pengambilan Motor Sewa di Tempat Customer",
  "Selesai Pengambilan Motor dari Tempat Customer",
];

export default function KelolaPesanan() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [range, setRange] = useState({ dari: "", sampai: "" });
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [jamData, setJamData] = useState({});
  const [statusLoading, setStatusLoading] = useState({});

  const rupiah = (n) => (n ? `Rp${Number(n).toLocaleString("id-ID")}` : "–");
  const tanggal = (d) =>
    d
      ? new Date(d).toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "–";

  const onChangeRange = (e) => {
    setRange({ ...range, [e.target.name]: e.target.value });
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let endpoint = "/penyewaan";
      if (range.dari && range.sampai) {
        endpoint = `/penyewaan/tanggal?dari=${range.dari}&sampai=${range.sampai}`;
      }
      const { data } = await API.get(endpoint, config);

      const now = new Date();
      const processed = data.map((item) => {
        const terlambat =
          item.status === "BERHASIL" &&
          item.jam_pengembalian &&
          new Date(item.jam_pengembalian) < now;
        return { ...item, keterlambatan: terlambat };
      });

      setRows(processed);
      setErr("");
    } catch (error) {
      setErr("Gagal memuat data pesanan. Token mungkin kedaluwarsa.");
    }
  };

  const handleExport = async (type) => {
    if (!range.dari || !range.sampai) {
      setErr("Pilih tanggal mulai dan akhir sebelum export.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await API.get(
        `/penyewaan/export/${type}?dari=${range.dari}&sampai=${range.sampai}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const disposition = response.headers["content-disposition"];
      let filename = "export." + (type === "excel" ? "xlsx" : "pdf");
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setErr("Gagal export file. " + (err?.response?.data?.message || ""));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/penyewaan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      alert("Gagal menghapus data.");
    }
  };

  const handleJamChange = (id, field, value) => {
    setJamData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleJamSubmit = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await API.patch(
        `/penyewaan/${id}/jam`,
        {
          jam_pengambilan: jamData[id]?.jam_pengambilan,
          durasi_hari: jamData[id]?.durasi,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditing(null);
      fetchData();
    } catch (error) {}
  };

  const handleSelesai = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Yakin ingin menyelesaikan pesanan ini?")) return;
    try {
      await API.patch(
        `/penyewaan/${id}/selesai`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchData();
    } catch (error) {
      alert("Terjadi kesalahan saat menyelesaikan pesanan.");
    }
  };

  const handleStatusPesanan = async (id, statusBaru) => {
    if (!window.confirm(`Ubah status pesanan menjadi "${statusBaru}"?`)) return;
    setStatusLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem("token");
      await API.patch(
        `/penyewaan/${id}/status`,
        { status_pesanan: statusBaru },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      alert("Gagal update status pesanan.");
    }
    setStatusLoading((prev) => ({ ...prev, [id]: false }));
  };

  useEffect(() => {
    fetchData();
    const intv = setInterval(fetchData, 7000);
    return () => clearInterval(intv);
  }, [range]);

  const rowsAktif = rows.filter((r) => r.status !== "SELESAI");
  const rowsSelesai = rows.filter((r) => r.status === "SELESAI");
  const total = rowsSelesai.reduce(
    (acc, cur) => acc + (cur.harga_total || 0),
    0
  );
  const totalTerlambat = rowsAktif.filter((r) => r.keterlambatan).length;

  const statusPenyewaan = (item) => {
    const now = new Date();
    if (!item.jam_pengambilan || !item.jam_pengembalian) return "-";
    const pengembalian = new Date(item.jam_pengembalian);
    return now > pengembalian ? "Telat Mengembalikan" : "Dalam Penyewaan";
  };

  // === START RENDER ===
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-2 sm:px-5 py-2">
        {/* HEADER */}
        <div className="mb-8 flex flex-wrap gap-2 justify-between items-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center gap-3 tracking-tight">
            <FiClipboard className="text-indigo-700 bg-indigo-100 rounded-lg p-2 text-2xl sm:text-3xl md:text-4xl shadow" />
            Kelola Pesanan
          </h1>
        </div>

        {/* FILTER & EXPORT */}
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center mb-6">
          <input
            type="date"
            name="dari"
            value={range.dari}
            onChange={onChangeRange}
            className="border px-2 py-2 rounded-lg text-xs sm:text-sm"
          />
          <span className="text-gray-500 text-xs sm:text-sm">sampai</span>
          <input
            type="date"
            name="sampai"
            value={range.sampai}
            onChange={onChangeRange}
            className="border px-2 py-2 rounded-lg text-xs sm:text-sm"
          />
          <button
            onClick={() => handleExport("excel")}
            className="bg-gradient-to-r from-green-500 to-green-400 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold shadow hover:from-green-600 hover:to-green-500 text-xs sm:text-sm"
          >
            Export Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="bg-gradient-to-r from-red-500 to-orange-400 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold shadow hover:from-red-600 hover:to-orange-500 text-xs sm:text-sm"
          >
            Export PDF
          </button>
        </div>

        {/* ALERT */}
        {err && (
          <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium shadow text-xs sm:text-sm">
            {err}
          </div>
        )}

        {/* SUMMARY */}
        <div className="mb-3 text-gray-800 text-xs sm:text-base font-semibold">
          Total pesanan: <span className="text-indigo-600">{rows.length}</span>{" "}
          | Total pendapatan:{" "}
          <span className="text-green-600">{rupiah(total)}</span> |{" "}
          <span className="text-red-500">
            Keterlambatan: <span className="font-bold">{totalTerlambat}</span>
          </span>
        </div>

        {/* TABEL PESANAN AKTIF */}
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg mb-10">
          <div className="flex items-center gap-2 px-3 sm:px-6 pt-6 pb-3">
            <span className="text-indigo-600 text-lg sm:text-xl">📋</span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Tabel Pesanan Aktif
            </h2>
          </div>
          <table className="w-full text-xs sm:text-sm text-center min-w-[860px]">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-2 sm:px-4 py-3">Nama Penyewa</th>
                <th className="px-2 sm:px-4 py-3">Email</th>
                <th className="px-2 sm:px-4 py-3">Motor</th>
                <th className="px-2 sm:px-4 py-3">Jadwal Booking</th>
                <th className="px-2 sm:px-4 py-3">Durasi</th>
                <th className="px-2 sm:px-4 py-3">Total Biaya</th>
                <th className="px-2 sm:px-4 py-3">Status</th>
                <th className="px-2 sm:px-4 py-3">Status Pesanan</th>
                <th className="px-2 sm:px-4 py-3">Aksi</th>
                <th className="px-2 sm:px-4 py-3">Selesaikan</th>
              </tr>
            </thead>
            <tbody>
              {rowsAktif.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-gray-400">
                    Tidak ada data aktif.
                  </td>
                </tr>
              ) : (
                rowsAktif.map((item, idx) => {
                  const statusLabel = item.keterlambatan
                    ? "Telat Mengembalikan"
                    : "Dalam Penyewaan";
                  const badgeColor = item.keterlambatan
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700";
                  return (
                    <tr key={item.id} className={idx % 2 ? "bg-gray-50" : ""}>
                      <td className="px-2 sm:px-4 py-3 font-semibold">
                        {item.nama_penyewa}
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        {item.user?.email || "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        {item.kendaraan?.nama || "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        {tanggal(item.jadwal_booking)}
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        {item.durasi_hari ? `${item.durasi_hari} hari` : "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        {rupiah(item.harga_total)}
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold ${badgeColor}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <select
                          className={`w-full px-3 py-2 rounded-full text-sm sm:text-xs font-bold border appearance-none relative z-10 ${
                            item.status_pesanan ===
                            "Selesai Pengambilan Motor dari Tempat Customer"
                              ? "bg-green-100 text-green-700 border-green-400"
                              : "bg-yellow-50 text-yellow-700 border-yellow-400"
                          }`}
                          value={item.status_pesanan || ""}
                          onChange={(e) =>
                            handleStatusPesanan(item.id, e.target.value)
                          }
                          disabled={!!statusLoading[item.id]}
                        >
                          {DAFTAR_STATUS_PESANAN.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        {statusLoading[item.id] && (
                          <span className="ml-2 text-blue-600 animate-pulse">
                            updating...
                          </span>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex justify-center gap-2 sm:gap-4 text-lg">
                          <button
                            onClick={() => setDetail(item)}
                            title="Lihat Detail"
                            className="text-indigo-600 hover:text-indigo-800 transition"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Hapus Pesanan"
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        <button
                          onClick={() => handleSelesai(item.id)}
                          title="Selesaikan Pesanan"
                          className="text-green-600 hover:text-green-800 text-xl transition"
                        >
                          <FiCheckCircle />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="mt-2 text-xs text-gray-400 block sm:hidden px-2">
            Scroll ke kanan untuk melihat kolom lain
          </div>
        </div>

        {/* MODAL DETAIL */}
        {detail && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-2 py-5">
            <div className="bg-white p-4 sm:p-7 rounded-2xl shadow-2xl w-full max-w-lg relative">
              <button
                onClick={() => setDetail(null)}
                className="absolute top-2 right-4 text-2xl text-red-500 hover:text-red-700"
              >
                ×
              </button>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-indigo-700">
                Detail Pesanan
              </h3>
              <div className="text-xs sm:text-sm space-y-2">
                <p>
                  <strong>Nama:</strong> {detail.nama_penyewa}
                </p>
                <p>
                  <strong>Telepon:</strong> {detail.nomor_telepon}
                </p>
                <p>
                  <strong>Motor:</strong> {detail.kendaraan?.nama}
                </p>
                <p>
                  <strong>Metode Pengambilan:</strong>{" "}
                  {detail.metode_pengambilan === "Diantar"
                    ? `Diantar ke Lokasi Kamu (${
                        detail.alamat_pengambilan || "-"
                      })`
                    : "Ambil di Showroom"}
                </p>
                <p>
                  <strong>Metode Pengembalian:</strong>{" "}
                  {detail.metode_pengembalian === "Diambil"
                    ? `Diambil dari Lokasi Kamu (${
                        detail.alamat_pengembalian || "-"
                      })`
                    : "Kembali ke Showroom"}
                </p>
                <p>
                  <strong>Jadwal Booking:</strong>{" "}
                  {tanggal(detail.jadwal_booking)}
                </p>
                <p>
                  <strong>Keterangan:</strong> {detail.keterangan || "-"}
                </p>
                <p>
                  <strong>Status Pembayaran:</strong>{" "}
                  {detail.status.replaceAll("_", " ")}
                </p>
                <p>
                  <strong>Metode Pembayaran:</strong>{" "}
                  {detail.metode_pembayaran?.toUpperCase() || "-"}
                </p>
                {detail.payment_url && (
                  <p>
                    <strong>Invoice Xendit:</strong>{" "}
                    <a
                      href={detail.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Lihat Invoice
                    </a>
                  </p>
                )}
                <p>
                  <strong>KTP:</strong>{" "}
                  <a
                    href={detail.foto_ktp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Lihat KTP
                  </a>
                </p>
                <p>
                  <strong>SIM:</strong>{" "}
                  <a
                    href={detail.foto_sim}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Lihat SIM
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TABEL JAM PENYEWAAN */}
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg mt-12 mb-10">
          <div className="flex items-center gap-2 px-3 sm:px-6 pt-6 pb-3">
            <span className="text-indigo-600 text-lg sm:text-xl">⏱️</span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Tabel Jam Penyewaan
            </h2>
          </div>
          <p className="px-3 sm:px-6 text-xs sm:text-sm text-gray-500 mb-2">
            Jam pengembalian dihitung otomatis berdasarkan durasi. Denda
            Rp50.000 per 5 jam keterlambatan.
          </p>
          <table className="w-full text-xs sm:text-sm text-center min-w-[600px]">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-2 sm:px-4 py-3">Nama Penyewa</th>
                <th className="px-2 sm:px-4 py-3">Motor</th>
                <th className="px-2 sm:px-4 py-3">Durasi (hari)</th>
                <th className="px-2 sm:px-4 py-3">Jam Pengambilan</th>
                <th className="px-2 sm:px-4 py-3">Jam Pengembalian</th>
                <th className="px-2 sm:px-4 py-3">Status Penyewaan</th>
                <th className="px-2 sm:px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rowsAktif.map((item, idx) => (
                <tr key={item.id} className={idx % 2 ? "bg-gray-50" : ""}>
                  <td className="px-2 sm:px-4 py-3">{item.nama_penyewa}</td>
                  <td className="px-2 sm:px-4 py-3">
                    {item.kendaraan?.nama || "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    {editing === item.id ? (
                      <input
                        type="number"
                        min="1"
                        value={jamData[item.id]?.durasi || 1}
                        onChange={(e) =>
                          handleJamChange(item.id, "durasi", e.target.value)
                        }
                        className="border px-2 py-1 rounded w-16 sm:w-20 text-xs"
                      />
                    ) : (
                      `${item.durasi_hari || 1} hari`
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    {editing === item.id ? (
                      <input
                        type="datetime-local"
                        value={jamData[item.id]?.jam_pengambilan || ""}
                        onChange={(e) =>
                          handleJamChange(
                            item.id,
                            "jam_pengambilan",
                            e.target.value
                          )
                        }
                        className="border px-2 py-1 rounded text-xs"
                      />
                    ) : (
                      tanggal(item.jam_pengambilan)
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    {tanggal(item.jam_pengembalian)}
                  </td>
                  <td className="px-2 sm:px-4 py-3 font-bold text-xs">
                    {statusPenyewaan(item)}
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    {editing === item.id ? (
                      <div className="flex justify-center gap-2 sm:gap-3 text-lg">
                        <button
                          onClick={() => handleJamSubmit(item.id)}
                          title="Simpan"
                          className="text-green-600 hover:text-green-800"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          title="Batal"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ❌
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditing(item.id);
                          setJamData((prev) => ({
                            ...prev,
                            [item.id]: {
                              jam_pengambilan:
                                item.jam_pengambilan?.slice(0, 16) || "",
                              durasi: item.durasi_hari || 1,
                            },
                          }));
                        }}
                        title="Edit Jam Penyewaan"
                        className="text-indigo-600 hover:text-indigo-800 text-lg"
                      >
                        ✏️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-xs text-gray-400 block sm:hidden px-2">
            Scroll ke kanan untuk melihat kolom lain
          </div>
        </div>

        {/* TABEL PESANAN SELESAI */}
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg mt-12 mb-10">
          <div className="flex items-center gap-2 px-3 sm:px-6 pt-6 pb-3">
            <span className="text-green-600 text-lg sm:text-xl">✅</span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Pesanan Selesai
            </h2>
          </div>
          <table className="w-full text-xs sm:text-sm text-center min-w-[680px]">
            <thead className="bg-green-50">
              <tr>
                <th className="px-2 sm:px-4 py-3">Nama Penyewa</th>
                <th className="px-2 sm:px-4 py-3">Email</th>
                <th className="px-2 sm:px-4 py-3">Motor</th>
                <th className="px-2 sm:px-4 py-3">Tanggal Booking</th>
                <th className="px-2 sm:px-4 py-3">Durasi</th>
                <th className="px-2 sm:px-4 py-3">Total</th>
                <th className="px-2 sm:px-4 py-3">Status</th>
                <th className="px-2 sm:px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rowsSelesai.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-gray-400">
                    Belum ada pesanan selesai.
                  </td>
                </tr>
              ) : (
                rowsSelesai.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 ? "bg-gray-50" : ""}>
                    <td className="px-2 sm:px-4 py-3 font-semibold">
                      {item.nama_penyewa}
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      {item.user?.email || "-"}
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      {item.kendaraan?.nama || "-"}
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      {tanggal(item.jadwal_booking)}
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      {item.durasi_hari ? `${item.durasi_hari} hari` : "-"}
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      {rupiah(item.harga_total)}
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        Selesai
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex justify-center gap-2 sm:gap-4 text-lg">
                        <button
                          onClick={() => setDetail(item)}
                          title="Lihat Detail"
                          className="text-indigo-600 hover:text-indigo-800 transition"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Hapus"
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="mt-2 text-xs text-gray-400 block sm:hidden px-2">
            Scroll ke kanan untuk melihat kolom lain
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
