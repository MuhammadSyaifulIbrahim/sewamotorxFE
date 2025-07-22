// src/pages/user/ReviewForm.jsx
import { useState } from "react";
import axios from "axios";
import { BsStarFill, BsStar } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";

const ReviewForm = ({ penyewaanId, kendaraanId, onSukses }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState(false);
  const [error, setError] = useState("");

  const handleStarClick = (val) => setRating(val);

  const submitReview = async (e) => {
    e.preventDefault();
    setError("");
    if (!rating) return setError("Beri rating dulu ya!");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/review`,
        {
          rating,
          pesan,
          penyewaanId,
          kendaraanId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSukses(true);
      setPesan("");
      setRating(0);
      if (onSukses) onSukses({ rating, pesan });
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal mengirim review");
    } finally {
      setLoading(false);
    }
  };

  if (sukses) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 mb-1 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold flex items-center gap-2"
      >
        <BsStarFill className="text-yellow-400" /> Terima kasih atas ulasanmu!
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={submitReview}
      className="p-4 border rounded-xl shadow bg-white mt-4"
    >
      <label className="font-semibold mb-2 block text-gray-700">
        Berikan Ulasan
      </label>

      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            className="focus:outline-none"
            onClick={() => handleStarClick(num)}
            onMouseEnter={() => setHoverRating(num)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Beri ${num} bintang`}
          >
            {(hoverRating || rating) >= num ? (
              <BsStarFill className="text-yellow-400 text-2xl transition" />
            ) : (
              <BsStar className="text-gray-300 text-2xl transition" />
            )}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">
          {rating ? `${rating} / 5` : ""}
        </span>
      </div>

      <textarea
        className="border rounded-lg p-2 w-full mb-2 text-sm resize-none"
        placeholder="Tulis pesan ulasanmu di sini..."
        rows={3}
        value={pesan}
        onChange={(e) => setPesan(e.target.value)}
        disabled={loading}
      />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mb-2 text-red-600 text-xs font-semibold"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 transition disabled:opacity-50 w-full"
        disabled={loading || !rating}
      >
        {loading ? "Mengirim..." : "Kirim Review"}
      </button>
    </form>
  );
};

export default ReviewForm;
