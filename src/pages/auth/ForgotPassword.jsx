import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import Logo from "../../assets/Logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInfo("");
    setError("");
    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email });
      setInfo(
        "Link reset password telah dikirim ke email Anda (cek juga folder spam)."
      );
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-yellow-50 flex items-center justify-center px-2">
      <div className="w-full max-w-4xl bg-white/90 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Kiri: Logo & Welcome (sembunyi di HP) */}
        <div className="hidden md:flex flex-col justify-center items-center px-6 py-10 w-1/2 bg-white relative">
          <img
            src={Logo}
            alt="MotoRent Logo"
            className="w-40 h-auto mb-7 drop-shadow-lg animate-fade-in"
            draggable={false}
          />
          <h1 className="text-2xl font-bold text-blue-800 text-center mb-3 tracking-wide animate-slide-down">
            Selamat Datang di MotoRent
          </h1>
          <p className="text-base text-gray-600 text-center max-w-xs animate-fade-in">
            Solusi rental motor{" "}
            <span className="font-semibold text-blue-700">
              praktis dan cepat
            </span>
            . Dimanapun tujuanmu, MotoRent hadir untukmu.
          </p>
          <div className="absolute left-0 bottom-0 w-20 h-20 rounded-br-3xl bg-blue-50 blur-2xl opacity-60 -z-10"></div>
        </div>

        {/* Kanan: Form Lupa Password */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 md:px-10 md:py-14 bg-gradient-to-br from-gray-100 via-white to-blue-50">
          <div className="w-full max-w-md rounded-2xl bg-white/95 shadow-xl p-6 sm:p-8 border border-blue-100">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-6 text-center tracking-wide">
              Lupa Password Akun
            </h2>
            {info && (
              <p className="text-green-600 text-center mb-4 animate-pulse">
                {info}
              </p>
            )}
            {error && (
              <p className="text-red-600 text-center mb-4 animate-shake">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Akun
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Masukkan Email"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded font-semibold flex items-center justify-center gap-2 shadow hover:bg-indigo-700 transition disabled:opacity-70"
              >
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="white"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {loading ? "Mengirim..." : "Kirim Link Reset Password"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="text-blue-700 hover:text-blue-900 font-semibold"
              >
                Masuk Login MotoRent
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
