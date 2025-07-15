import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../api/axios";
import Logo from "../../assets/Logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect"); // misal: "/booking/scoopy"

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Jika login dari "Sewa Motor", redirect ke tujuan, jika tidak, dashboard/admin
      if (redirect) {
        navigate(redirect, { replace: true });
      } else {
        navigate(
          res.data.user.role === "admin" ? "/admin/dashboard" : "/dashboard"
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Email atau password salah.");
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
            . Dimanapun tujuanmu, MotoRent hadir untukmu.
          </p>
          <div className="absolute left-0 bottom-0 w-20 h-20 rounded-br-3xl bg-blue-50 blur-2xl opacity-60 -z-10"></div>
        </div>

        {/* Kanan: Form Login */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 md:px-10 md:py-14 bg-gradient-to-br from-gray-100 via-white to-blue-50">
          <div className="w-full max-w-md rounded-2xl bg-white/95 shadow-xl p-6 sm:p-8 border border-blue-100">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-6 text-center tracking-wide">
              Masuk ke Akun Anda
            </h2>
            {error && (
              <p className="text-red-600 text-center text-sm mb-4 animate-shake">
                {error}
              </p>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
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
                  autoComplete="username"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
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
                  autoComplete="current-password"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
                <span
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute top-8 right-4 text-gray-400 hover:text-blue-700 cursor-pointer text-lg"
                  title={showPass ? "Sembunyikan" : "Tampilkan"}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
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
                Login
              </button>
            </form>

            <div className="text-sm text-center mt-4">
              Belum punya akun?{" "}
              <span
                className="text-blue-700 font-bold cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Register
              </span>
            </div>
            <div className="text-sm text-right mt-2">
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => navigate("/forgot-password")}
              >
                Lupa password?
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
