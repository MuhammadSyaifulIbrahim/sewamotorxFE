// === src/components/AuthModal.jsx ===
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AuthModal({ isRegister, setIsRegister, setShowLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3001/api";
      const url = isRegister
        ? `${baseUrl}/auth/register`
        : `${baseUrl}/auth/login`;
      const response = await axios.post(url, { username, password });
      const { token, role } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      navigate(role === "admin" ? "/admin" : "/user");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat menghubungi server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <h2 className="text-xl font-bold mb-4 text-center">
          {isRegister ? "Daftar Akun" : "Login"}
        </h2>
        <form className="space-y-4" onSubmit={handleAuth}>
          <input
            type="text"
            placeholder="Username"
            className="w-full border px-4 py-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border px-4 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? "Memproses..." : isRegister ? "Daftar" : "Masuk"}
          </button>
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        </form>
        <div className="text-sm text-center mt-3">
          {isRegister ? (
            <span>
              Sudah punya akun?{" "}
              <button
                onClick={() => setIsRegister(false)}
                className="text-indigo-600 hover:underline"
              >
                Login
              </button>
            </span>
          ) : (
            <span>
              Belum punya akun?{" "}
              <button
                onClick={() => setIsRegister(true)}
                className="text-indigo-600 hover:underline"
              >
                Daftar
              </button>
            </span>
          )}
        </div>
        <button
          onClick={() => {
            setShowLogin(false);
            setIsRegister(false);
          }}
          className="mt-4 text-sm text-gray-600 hover:underline block mx-auto"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
