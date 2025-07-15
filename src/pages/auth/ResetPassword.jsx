import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../api/axios";
import Logo from "../../assets/Logo.png";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (password.length < 6) return setError("Password minimal 6 karakter.");
    if (password !== confirm)
      return setError("Password dan konfirmasi tidak sama.");
    try {
      await API.post("/auth/reset-password", { token, newPassword: password });
      setInfo("Password berhasil direset! Silakan login.");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Reset password gagal atau link sudah tidak valid."
      );
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-yellow-50">
        <div className="bg-white/90 shadow-2xl rounded-xl p-8 text-red-600 text-lg font-semibold border border-red-200 animate-fade-in">
          Token tidak valid atau sudah kedaluwarsa.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-yellow-50 flex items-center justify-center px-2">
      <div className="w-full max-w-4xl bg-white/90 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Kiri: Logo & Info */}
        <div className="hidden md:flex flex-col justify-center items-center px-6 py-10 w-1/2 bg-white relative">
          <img
            src={Logo}
            alt="MotoRent Logo"
            className="w-40 h-auto mb-7 drop-shadow-lg"
            draggable={false}
          />
          <h1 className="text-2xl font-bold text-blue-800 text-center mb-2 tracking-wide">
            Reset Password MotoRent
          </h1>
          <p className="text-base text-gray-600 text-center max-w-xs">
            Masukkan password baru Anda dan konfirmasi untuk mengamankan kembali
            akun Anda.
          </p>
          <div className="absolute left-0 bottom-0 w-20 h-20 rounded-br-3xl bg-blue-50 blur-2xl opacity-60 -z-10"></div>
        </div>

        {/* Kanan: Form Reset Password */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 md:px-10 md:py-14 bg-gradient-to-br from-gray-100 via-white to-blue-50">
          <div className="w-full max-w-md rounded-2xl bg-white/95 shadow-xl p-6 sm:p-8 border border-blue-100">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-6 text-center tracking-wide">
              Buat Password Baru
            </h2>
            {info && (
              <div className="text-green-600 text-center mb-4 animate-pulse">
                {info}
              </div>
            )}
            {error && (
              <div className="text-red-600 text-center mb-4 animate-shake">
                {error}
              </div>
            )}
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password Baru
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Password baru minimal 6 karakter"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                  value={password}
                  minLength={6}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={success}
                />
              </div>
              <div>
                <label
                  htmlFor="confirm"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  id="confirm"
                  placeholder="Konfirmasi Password baru"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                  value={confirm}
                  minLength={6}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  disabled={success}
                />
              </div>
              <button
                type="submit"
                disabled={success}
                className={`w-full py-2 rounded text-white font-semibold transition shadow ${
                  success
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {success ? "Password Tersimpan ✓" : "Simpan Password Baru"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
