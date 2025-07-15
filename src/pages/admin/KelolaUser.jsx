import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { FaUsers } from "react-icons/fa";

export default function KelolaUser() {
  const [users, setUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setError("Gagal memuat data pengguna.");
    }
  };

  const toggleStatus = async (id, status, nama) => {
    const konfirmasi = window.confirm(
      `Yakin ingin ${
        status === "aktif" ? "memblokir" : "mengaktifkan"
      } user "${nama}"?`
    );
    if (!konfirmasi) return;

    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/users/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Status pengguna berhasil diperbarui.");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Gagal mengubah status pengguna.");
      setTimeout(() => setError(""), 3000);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users
    .filter((user) => {
      if (filterStatus === "semua") return true;
      return user.status === filterStatus;
    })
    .filter((user) => {
      const searchTerm = search.toLowerCase();
      return (
        user.nama?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm)
      );
    });

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-5">
        {/* HEADER */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <FaUsers className="text-indigo-700 bg-indigo-100 rounded-lg p-2 text-2xl sm:text-3xl shadow" />
          <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
            Kelola Pengguna
          </h2>
        </div>

        {/* ALERT */}
        {error && (
          <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold shadow text-xs sm:text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold shadow text-xs sm:text-sm">
            {success}
          </div>
        )}

        {/* SEARCH & FILTER */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-5 items-center">
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-2 py-2 rounded-lg w-full sm:w-64 md:w-72 text-xs sm:text-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-2 py-2 rounded-lg text-xs sm:text-sm"
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white p-2 sm:p-6 rounded-2xl shadow-lg overflow-x-auto">
          <table className="w-full table-auto text-xs sm:text-sm min-w-[520px]">
            <thead className="bg-indigo-50 text-indigo-900 font-bold">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">No</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Nama</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Email</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Peran</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-gray-400 font-semibold"
                  >
                    Tidak ada pengguna yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, i) => (
                  <tr
                    key={user.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                      {i + 1}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      {user.nama || "-"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">{user.email}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize">
                      {user.role || "-"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <span
                        className={`text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full ${
                          user.status === "aktif"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status === "aktif" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <button
                        onClick={() =>
                          toggleStatus(user.id, user.status, user.nama)
                        }
                        className={`px-3 sm:px-4 py-1.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow transition ${
                          user.status === "aktif"
                            ? "bg-red-500 hover:bg-red-700"
                            : "bg-blue-500 hover:bg-blue-700"
                        }`}
                      >
                        {user.status === "aktif" ? "Blokir" : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="mt-2 text-xs text-gray-400 block sm:hidden px-2">
            Scroll ke kanan untuk lihat kolom lain
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
