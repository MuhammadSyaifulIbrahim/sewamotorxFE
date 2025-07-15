import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../api/axios";
import Logo from "../../assets/Logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect"); // misal "/booking/scoopy"

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/register", {
        nama: form.nama,
        email: form.email,
        password: form.password,
      });
      setSuccess(
        "Registrasi berhasil! Silakan cek email untuk verifikasi akun."
      );
      setTimeout(() => {
        // Redirect ke login dengan param redirect jika sebelumnya dari booking
        if (redirect) {
          navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
        } else {
          navigate("/login");
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal. Coba lagi.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-yellow-50 flex items-center justify-center px-2">
      <div className="w-full max-w-4xl bg-white/90 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Kiri: Logo & Welcome */}
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
            . Daftar sekarang dan mulai perjalananmu!
          </p>
          <div className="absolute left-0 bottom-0 w-20 h-20 rounded-br-3xl bg-blue-50 blur-2xl opacity-60 -z-10"></div>
        </div>

        {/* Kanan: Form Register */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 md:px-10 md:py-14 bg-gradient-to-br from-gray-100 via-white to-blue-50">
          <div className="w-full max-w-md rounded-2xl bg-white/95 shadow-xl p-6 sm:p-8 border border-blue-100">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-6 text-center tracking-wide">
              Daftar Akun Baru
            </h2>
            {error && (
              <p className="text-red-600 text-center text-sm mb-4 animate-shake">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-600 text-center text-sm mb-4 animate-pulse">
                {success}
              </p>
            )}
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label
                  htmlFor="nama"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="nama"
                  placeholder="Masukkan Nama"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Masukkan Email"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  id="password"
                  placeholder="Masukkan Password"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12 text-base"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  autoComplete="new-password"
                />
                <span
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute top-8 right-4 text-gray-400 hover:text-blue-700 cursor-pointer text-lg"
                  title={showPass ? "Sembunyikan" : "Tampilkan"}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Konfirmasi Password
                </label>
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Ulangi Password"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12 text-base"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  required
                  autoComplete="new-password"
                />
                <span
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute top-8 right-4 text-gray-400 hover:text-blue-700 cursor-pointer text-lg"
                  title={showConfirm ? "Sembunyikan" : "Tampilkan"}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-indigo-600 text-white py-2 rounded font-semibold flex items-center justify-center gap-2 shadow hover:bg-indigo-700 transition disabled:opacity-70`}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-1"
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
                ) : null}
                Register
              </button>
            </form>
            <div className="text-sm text-center mt-4">
              Sudah punya akun?{" "}
              <span
                className="text-blue-700 font-bold cursor-pointer"
                onClick={() =>
                  redirect
                    ? navigate(
                        `/login?redirect=${encodeURIComponent(redirect)}`
                      )
                    : navigate("/login")
                }
              >
                Login
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
