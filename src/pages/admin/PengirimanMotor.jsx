import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { FiTrash2, FiMapPin, FiTruck } from "react-icons/fi";

const ALAMAT_SHOWROOM =
  "Jl. Kemang Utara VII G No.2, Jakarta Selatan, Indonesia";
const BIAYA_DASAR = 10000;
const BIAYA_PER_KM = 2500;

export default function PengirimanMotor() {
  const [pesananList, setPesananList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [jarak, setJarak] = useState("");
  const [biaya, setBiaya] = useState(0);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data pesanan dari backend
  useEffect(() => {
    const fetchPesanan = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await API.get("/penyewaan", config);
        setPesananList(data.filter((p) => p.status !== "SELESAI"));
      } catch {
        setPesananList([]);
      }
    };
    fetchPesanan();
  }, []);

  useEffect(() => {
    const pesanan = pesananList.find(
      (p) => String(p.id) === String(selectedId)
    );
    setSelectedOrder(pesanan || null);
    setJarak("");
    setBiaya(0);
  }, [selectedId, pesananList]);

  useEffect(() => {
    if (!jarak || isNaN(jarak)) setBiaya(0);
    else setBiaya(BIAYA_DASAR + BIAYA_PER_KM * parseFloat(jarak));
  }, [jarak]);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await API.get("/pengiriman", config);
      setRiwayat(data);
    } catch {
      setRiwayat([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
    // eslint-disable-next-line
  }, []);

  const handleOpenMaps = () => {
    if (!selectedOrder) return alert("Pilih pesanan lebih dulu!");
    const origin = encodeURIComponent(ALAMAT_SHOWROOM);
    const dest = encodeURIComponent(
      selectedOrder.metode_pengambilan === "Diantar"
        ? selectedOrder.alamat_pengambilan
        : selectedOrder.alamat_pengembalian
    );
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`,
      "_blank"
    );
  };

  const handleTambah = async () => {
    if (!biaya || isNaN(biaya)) return alert("Biaya belum valid!");
    if (!selectedOrder || !jarak)
      return alert("Lengkapi data pesanan & jarak!");
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await API.post(
        "/pengiriman",
        {
          penyewaan_id: selectedOrder.id,
          alamat_tujuan:
            selectedOrder.metode_pengambilan === "Diantar"
              ? selectedOrder.alamat_pengambilan
              : selectedOrder.alamat_pengembalian,
          jarak_km: parseFloat(jarak),
          biaya: parseInt(biaya),
        },
        config
      );
      await fetchRiwayat();
      setSelectedId("");
      setJarak("");
      setBiaya(0);
    } catch (err) {
      alert("Gagal tambah pengiriman ke server!");
    }
  };

  const handleHapus = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await API.delete(`/pengiriman/${id}`, config);
      await fetchRiwayat();
    } catch {
      alert("Gagal hapus data pengiriman!");
    }
  };

  // EXPORT EXCEL (Bobble Style)
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await API.get("/pengiriman/export/excel", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "rekap_pengiriman.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Gagal export excel!");
    } finally {
      setLoading(false);
    }
  };

  // EXPORT PDF (Bobble Style)
  const handleExportPdf = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await API.get("/pengiriman/export/pdf", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "rekap_pengiriman.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Gagal export PDF!");
    } finally {
      setLoading(false);
    }
  };

  const filterList = pesananList.filter(
    (item) =>
      item.nama_penyewa?.toLowerCase().includes(search.toLowerCase()) ||
      (item.kendaraan?.nama || "-").toLowerCase().includes(search.toLowerCase())
  );

  const total = riwayat.reduce((sum, curr) => sum + (curr.biaya || 0), 0);

  return (
    <AdminLayout>
      <div className="w-full max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8 mt-4 sm:mt-8">
        {/* HEADER */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
          <FiTruck className="text-2xl sm:text-3xl text-blue-700 bg-blue-100 p-2 rounded-lg shadow" />
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-blue-800 tracking-tight">
            Pengiriman Motor
          </h1>
        </div>

        {/* Step 1: Pilih Pesanan */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm">
            Cari/Pilih Pesanan
          </label>
          <input
            type="text"
            className="border px-3 py-2 rounded-lg w-full mb-2 text-xs sm:text-sm"
            placeholder="Cari nama penyewa / motor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border px-3 py-2 rounded-lg w-full text-xs sm:text-sm"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">-- Pilih pesanan --</option>
            {filterList.map((order) => (
              <option key={order.id} value={String(order.id)}>
                {order.nama_penyewa} – {order.kendaraan?.nama || "-"} –{" "}
                {order.jadwal_booking}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Detail & Rute */}
        {selectedOrder && (
          <>
            <div className="mt-4 border-b pb-4 space-y-1 sm:space-y-2 text-gray-700 text-xs sm:text-base">
              <div>
                <b>Nama Penyewa:</b> {selectedOrder.nama_penyewa}
              </div>
              <div>
                <b>No. Telepon:</b> {selectedOrder.nomor_telepon}
              </div>
              <div>
                <b>Motor:</b> {selectedOrder.kendaraan?.nama}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <FiMapPin className="text-blue-500" />
                <b>Alamat Pengiriman:</b>{" "}
                <span>
                  {selectedOrder.metode_pengambilan === "Diantar"
                    ? selectedOrder.alamat_pengambilan
                    : selectedOrder.alamat_pengembalian}
                </span>
              </div>
              <div>
                <b>Jadwal Booking:</b> {selectedOrder.jadwal_booking}
              </div>
              <div>
                <b>Status:</b> {selectedOrder.status}
              </div>
              <div>
                <b>Metode Pengambilan:</b> {selectedOrder.metode_pengambilan}
              </div>
              <div>
                <b>Metode Pengembalian:</b> {selectedOrder.metode_pengembalian}
              </div>
              <button
                onClick={handleOpenMaps}
                className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg mt-3 shadow font-semibold text-xs sm:text-base"
              >
                Lihat Rute di Google Maps
              </button>
            </div>
            <div className="mt-4 mb-3">
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Jarak Tempuh (km)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="w-full border px-3 py-2 rounded-lg mb-2 text-xs sm:text-sm"
                placeholder="Contoh: 4.5"
                value={jarak}
                onChange={(e) => setJarak(e.target.value)}
              />
              <div className="bg-gray-50 p-2 sm:p-3 rounded-xl text-sm sm:text-lg shadow-inner">
                <b>Biaya Pengiriman:</b>{" "}
                <span className="text-green-700 font-bold">
                  Rp {biaya ? biaya.toLocaleString() : "0"}
                </span>
              </div>
              <button
                onClick={handleTambah}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl mt-3 font-bold shadow transition text-xs sm:text-base"
                disabled={!biaya}
              >
                Tambah ke Rekap Pengiriman
              </button>
            </div>
          </>
        )}

        {/* Rekap & Riwayat */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 sm:p-5 rounded-xl shadow-inner mb-2 sm:mb-4">
          <div className="font-bold mb-2 text-gray-800 text-xs sm:text-base">
            Total Uang Pengiriman:
          </div>
          <div className="text-lg sm:text-2xl text-green-700 font-extrabold">
            Rp {total.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="font-bold mb-2 text-gray-700 text-xs sm:text-base">
            Riwayat Pengiriman:
          </div>
          {/* --- Export Buttons: Bobble Style --- */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleExportExcel}
              className="px-6 py-2 rounded-full font-bold shadow-md bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white text-base transition-all duration-150 hover:scale-105 active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
              style={{
                boxShadow: "0 4px 20px 0 rgba(30,200,110,0.07)",
                letterSpacing: 0.5,
              }}
            >
              Export Excel
            </button>
            <button
              onClick={handleExportPdf}
              className="px-6 py-2 rounded-full font-bold shadow-md bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white text-base transition-all duration-150 hover:scale-105 active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
              style={{
                boxShadow: "0 4px 20px 0 rgba(255,125,50,0.10)",
                letterSpacing: 0.5,
              }}
            >
              Export PDF
            </button>
          </div>
          {loading && (
            <div className="text-xs sm:text-sm text-gray-500 mb-2">
              Memuat data...
            </div>
          )}
          <ul className="text-xs sm:text-sm list-disc pl-4 max-h-[240px] overflow-y-auto">
            {!loading && riwayat.length === 0 && (
              <li className="text-gray-400">Belum ada data pengiriman.</li>
            )}
            {riwayat.map((item) => (
              <li
                key={item.id}
                className="mb-3 flex flex-col sm:flex-row sm:justify-between items-start border-b pb-2 last:border-b-0"
              >
                <div>
                  <b>{item.penyewaan?.nama_penyewa}</b>{" "}
                  <span className="text-xs text-gray-400 font-semibold">
                    ({item.penyewaan?.kendaraan?.nama})
                  </span>
                  <br />
                  <span className="text-gray-500">{item.alamat_tujuan}</span>
                  <br />
                  <span className="text-green-700 font-semibold">
                    Rp {item.biaya?.toLocaleString()}
                  </span>
                  {" – "}
                  <span className="text-xs">{item.jarak_km} km</span>{" "}
                  <span className="text-[10px] text-gray-400">
                    | {new Date(item.waktu_input).toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  onClick={() => handleHapus(item.id)}
                  className="mt-2 sm:mt-0 ml-0 sm:ml-2 p-2 rounded-full hover:bg-red-100 transition"
                  title="Hapus"
                >
                  <FiTrash2 className="text-red-500 text-lg" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
