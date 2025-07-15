import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { FaPlus, FaEdit, FaTrash, FaBoxOpen } from "react-icons/fa";

export default function KelolaProduk() {
  const [produk, setProduk] = useState([]);
  const [form, setForm] = useState({
    nama: "",
    tipe: "",
    transmisi: "",
    harga_sewa: "",
    stok: "",
    durasi_maksimal: "",
    diskon: "",
    gambar: null,
  });

  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchProduk = async () => {
    try {
      const res = await API.get("/kendaraan");
      setProduk(res.data);
    } catch (err) {
      setError("Gagal memuat data produk.");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "gambar") {
      setForm({ ...form, gambar: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let key in form) {
      if (form[key] !== null) {
        formData.append(key, form[key]);
      }
    }

    try {
      if (editId) {
        await API.put(`/kendaraan/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Produk berhasil diperbarui!");
      } else {
        await API.post("/kendaraan", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Produk berhasil ditambahkan!");
      }

      setForm({
        nama: "",
        tipe: "",
        transmisi: "",
        harga_sewa: "",
        stok: "",
        durasi_maksimal: "",
        diskon: "",
        gambar: null,
      });

      setPreview(null);
      setEditId(null);
      setError("");
      fetchProduk();
      setShowForm(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menyimpan produk.";
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    const konfirmasi = window.confirm("Yakin ingin menghapus produk?");
    if (!konfirmasi) return;
    try {
      await API.delete(`/kendaraan/${id}`);
      fetchProduk();
      setSuccess("Produk berhasil dihapus!");
    } catch (err) {
      setError("Gagal menghapus produk.");
    }
  };

  const handleEdit = (item) => {
    setForm({
      nama: item.nama,
      tipe: item.tipe,
      transmisi: item.transmisi,
      harga_sewa: item.harga_sewa,
      stok: item.stok,
      durasi_maksimal: item.durasi_maksimal || "",
      diskon: item.diskon || "",
      gambar: null,
    });
    setEditId(item.id);
    setShowForm(true);
    setPreview(null);
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  const rupiah = (n) => (n ? `Rp ${Number(n).toLocaleString("id-ID")}` : "–");

  return (
    <AdminLayout>
      <div className="p-2 sm:p-5 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center gap-2 tracking-tight">
            <FaBoxOpen className="text-indigo-700 bg-indigo-100 rounded-lg p-2 text-2xl sm:text-3xl md:text-4xl shadow" />
            Kelola Produk
          </h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditId(null);
              setForm({
                nama: "",
                tipe: "",
                transmisi: "",
                harga_sewa: "",
                stok: "",
                durasi_maksimal: "",
                diskon: "",
                gambar: null,
              });
              setPreview(null);
              setError("");
              setSuccess("");
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white px-3 sm:px-4 md:px-5 py-2 md:py-3 rounded-xl font-semibold shadow transition text-xs sm:text-sm md:text-base"
          >
            <FaPlus /> {showForm ? "Tutup Form" : "Tambah Produk"}
          </button>
        </div>

        {/* ALERT */}
        {error && (
          <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium shadow text-xs sm:text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium shadow text-xs sm:text-sm">
            {success}
          </div>
        )}

        {/* FORM */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 bg-white p-3 sm:p-4 md:p-8 rounded-2xl shadow-lg mb-8"
          >
            <div>
              <label className="block mb-1 font-semibold text-gray-700 text-xs sm:text-sm">
                Nama Produk
              </label>
              <input
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Nama Produk"
                className="border px-3 py-2 rounded-lg w-full text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700 text-xs sm:text-sm">
                Tipe
              </label>
              <input
                name="tipe"
                value={form.tipe}
                onChange={handleChange}
                placeholder="Tipe"
                className="border px-3 py-2 rounded-lg w-full text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700 text-xs sm:text-sm">
                Transmisi
              </label>
              <select
                name="transmisi"
                value={form.transmisi}
                onChange={handleChange}
                className="border px-3 py-2 rounded-lg w-full text-xs sm:text-sm"
                required
              >
                <option value="">Pilih Transmisi</option>
                <option value="Manual">Manual</option>
                <option value="Matic">Matic</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700 text-xs sm:text-sm">
                Harga Sewa
              </label>
              <input
                name="harga_sewa"
                type="number"
                value={form.harga_sewa}
                onChange={handleChange}
                placeholder="Harga Sewa"
                className="border px-3 py-2 rounded-lg w-full text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700 text-xs sm:text-sm">
                Stok
              </label>
              <input
                name="stok"
                type="number"
                value={form.stok}
                onChange={handleChange}
                placeholder="Stok"
                className="border px-3 py-2 rounded-lg w-full text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700 text-xs sm:text-sm">
                Diskon (%)
              </label>
              <input
                name="diskon"
                type="number"
                value={form.diskon}
                onChange={handleChange}
                placeholder="Diskon % (misal 10)"
                className="border px-3 py-2 rounded-lg w-full text-xs sm:text-sm"
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700 text-xs sm:text-sm">
                Durasi Maksimal (hari)
              </label>
              <input
                name="durasi_maksimal"
                type="number"
                value={form.durasi_maksimal}
                onChange={handleChange}
                placeholder="Durasi Maksimal (opsional)"
                className="border px-3 py-2 rounded-lg w-full text-xs sm:text-sm"
                min={1}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700 text-xs sm:text-sm">
                Gambar
              </label>
              <input
                type="file"
                name="gambar"
                accept="image/*"
                onChange={handleChange}
                className="border px-3 py-2 rounded-lg w-full text-xs sm:text-sm"
              />
              {preview && (
                <div className="mt-2">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-28 h-16 sm:w-32 sm:h-20 object-cover rounded-xl border shadow"
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2 md:py-3 rounded-xl font-bold text-base shadow transition mt-3"
            >
              {editId ? "Update Produk" : "Simpan Produk"}
            </button>
          </form>
        )}

        {/* TABEL PRODUK */}
        <div className="bg-white p-2 sm:p-3 md:p-6 rounded-2xl shadow-lg overflow-x-auto">
          <table className="w-full table-auto text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-2 md:px-4 py-2 text-left font-bold">Nama</th>
                <th className="px-2 md:px-4 py-2 text-left font-bold">Tipe</th>
                <th className="px-2 md:px-4 py-2 text-left font-bold">
                  Transmisi
                </th>
                <th className="px-2 md:px-4 py-2 text-left font-bold">Harga</th>
                <th className="px-2 md:px-4 py-2 text-left font-bold">
                  Diskon
                </th>
                <th className="px-2 md:px-4 py-2 text-left font-bold">Stok</th>
                <th className="px-2 md:px-4 py-2 text-left font-bold">
                  Gambar
                </th>
                <th className="px-2 md:px-4 py-2 text-left font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {produk.map((item) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-2 md:px-4 py-2 font-semibold">
                    {item.nama}
                  </td>
                  <td className="px-2 md:px-4 py-2">{item.tipe}</td>
                  <td className="px-2 md:px-4 py-2">{item.transmisi}</td>
                  <td className="px-2 md:px-4 py-2">
                    {rupiah(item.harga_sewa)}
                  </td>
                  <td className="px-2 md:px-4 py-2">
                    {item.diskon ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                        {item.diskon}%
                      </span>
                    ) : (
                      <span className="text-gray-400">–</span>
                    )}
                  </td>
                  <td className="px-2 md:px-4 py-2">{item.stok}</td>
                  <td className="px-2 md:px-4 py-2">
                    <img
                      src={item.gambar}
                      alt={item.nama}
                      className="w-14 h-10 sm:w-20 sm:h-14 object-cover rounded-lg border"
                    />
                  </td>
                  <td className="px-2 md:px-4 py-2">
                    <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="inline-flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white px-2 md:px-3 py-1 rounded-lg font-semibold shadow transition text-xs"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2 md:px-3 py-1 rounded-lg font-semibold shadow transition text-xs"
                      >
                        <FaTrash className="mr-1" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Scroll info for mobile */}
          <div className="mt-2 text-xs text-gray-400 block md:hidden">
            Scroll ke kanan untuk lihat kolom lain
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
