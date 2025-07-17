import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { FiActivity } from "react-icons/fi";

export default function AdminLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/activity-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Cek apakah hasil res.data adalah array, jika tidak, fallback []
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setLogs([]); // Supaya tetap array, tidak error map
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-2 sm:px-6 py-4 sm:py-6">
        {/* HEADER */}
        <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8">
          <FiActivity className="text-2xl sm:text-3xl text-blue-700 bg-blue-100 p-2 rounded-lg shadow" />
          <h1 className="text-lg sm:text-3xl font-extrabold text-gray-800 tracking-tight">
            Log Aktivitas Admin
          </h1>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex items-center gap-2 text-blue-600 font-semibold mb-8">
            <svg
              className="animate-spin h-5 w-5 sm:h-6 sm:w-6"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Memuat data log...
          </div>
        ) : (
          <div className="overflow-x-auto bg-white p-3 sm:p-6 rounded-2xl shadow-lg">
            <table className="w-full table-auto text-xs sm:text-sm">
              <thead className="bg-blue-50 font-bold text-blue-900">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    Waktu
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    Admin
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    Aksi
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(logs) && logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-8 text-gray-400 font-semibold"
                    >
                      Tidak ada data log.
                    </td>
                  </tr>
                ) : (
                  (logs || []).map((log) => (
                    <tr
                      key={log.id}
                      className="border-b hover:bg-blue-50 transition"
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("id-ID")}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 whitespace-nowrap">
                        {log.admin?.nama || "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                        <span className="px-2 sm:px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 break-all">
                        {log.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Scroll info */}
            <div className="mt-2 text-xs text-gray-400 block sm:hidden">
              Scroll ke kanan untuk lihat seluruh kolom
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
