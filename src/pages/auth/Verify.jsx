import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import Logo from "../../assets/Logo.png";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    setTokenValid(!!token);
    setMessage("");
    setVerified(false);
  }, [searchParams]);

  const handleVerify = async () => {
    const token = searchParams.get("token");
    if (!token) {
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }
    setLoading(true);
    try {
      const res = await API.get(`/auth/verify?token=${token}`);
      setMessage(res.data.message || "Verifikasi berhasil!");
      setVerified(true);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Link verifikasi tidak valid atau sudah kadaluarsa."
      );
      setVerified(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-yellow-50 flex items-center justify-center px-3">
      <div className="w-full max-w-5xl bg-white/90 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Kiri: Logo & Welcome Info */}
        <div className="hidden md:flex flex-col justify-center items-center px-6 py-10 w-1/2 bg-white relative">
          <img
            src={Logo}
            alt="MotoRent Logo"
            className="w-40 h-auto mb-7 drop-shadow-lg animate-fade-in"
            draggable={false}
          />
          <h1 className="text-2xl font-bold text-blue-800 text-center mb-3 animate-slide-down">
            Verifikasi Akun MotoRent
          </h1>
          <p className="text-base text-gray-600 text-center max-w-xs animate-fade-in">
            Klik tombol verifikasi untuk mengaktifkan akun Anda dan mulai
            menggunakan layanan kami dengan nyaman dan aman.
          </p>
          <div className="absolute left-0 bottom-0 w-20 h-20 rounded-br-3xl bg-blue-50 blur-2xl opacity-60 -z-10"></div>
        </div>

        {/* Kanan: Verifikasi Panel */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 md:px-10 md:py-14 bg-gradient-to-br from-gray-100 via-white to-blue-50">
          <div className="w-full max-w-md rounded-2xl bg-white/95 shadow-xl p-6 sm:p-8 border border-blue-100 text-center">
            <div className="text-5xl mb-4">{verified ? "✅" : "🔑"}</div>
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-800 mb-2">
              Verifikasi Email Anda
            </h2>

            {!verified && tokenValid && (
              <p className="text-gray-600 mb-4">
                Klik tombol di bawah untuk memverifikasi akun Anda.
              </p>
            )}

            {message && (
              <p
                className={`mb-4 ${
                  verified
                    ? "text-green-700 animate-pulse"
                    : "text-red-600 animate-shake"
                }`}
              >
                {message}
              </p>
            )}

            {!verified && tokenValid && (
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded shadow mb-3 transition disabled:opacity-60"
              >
                {loading ? "Memverifikasi..." : "Verifikasi Sekarang"}
              </button>
            )}

            <button
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded shadow"
              onClick={() => navigate("/")}
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
