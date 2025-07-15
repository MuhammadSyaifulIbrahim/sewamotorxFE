import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import API from "../../api/axios";
import { FiMapPin, FiUpload, FiRefreshCcw, FiX } from "react-icons/fi";

// Modal Preview Gambar Besar
function ModalImagePreview({ open, src, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-6 right-0 text-2xl text-white bg-black/60 hover:bg-black/80 rounded-full p-1"
        >
          <FiX />
        </button>
        <img
          src={src}
          alt="Preview QR"
          className="max-h-[70vh] max-w-[90vw] rounded-2xl shadow-2xl border-4 border-white animate-fade-in"
        />
      </div>
    </div>
  );
}

// Modal Form GPS/QR
function ModalEditGPS({ open, motor, onClose, onSuccess }) {
  const [gpsId, setGpsId] = useState(motor?.gpsId || "");
  const [gpsUrl, setGpsUrl] = useState(motor?.gpsUrl || "");
  const [qrImage, setQrImage] = useState(null);
  const [preview, setPreview] = useState(motor?.qrImage || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imgModal, setImgModal] = useState(false);

  useEffect(() => {
    if (motor) {
      setGpsId(motor.gpsId || "");
      setGpsUrl(motor.gpsUrl || "");
      setPreview(motor.qrImage || "");
      setQrImage(null);
      setError("");
    }
  }, [motor, open]);

  if (!open) return null;

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setQrImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("gpsId", gpsId);
      formData.append("gpsUrl", gpsUrl);
      if (qrImage) formData.append("qrImage", qrImage);

      await API.put(`/kendaraan/${motor.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal menyimpan data GPS. Coba lagi nanti."
      );
    }
    setLoading(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-2xl w-[95vw] max-w-sm relative animate-fade-in">
          <button
            className="absolute right-3 top-2 text-xl text-gray-400 hover:text-red-500"
            onClick={onClose}
            title="Tutup"
          >
            <FiX />
          </button>
          <h3 className="font-bold text-xl text-blue-700 mb-3 flex items-center gap-2">
            <FiUpload className="text-lg" />
            {motor?.gpsId ? "Ubah" : "Tambah"} GPS / QR
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 text-sm mb-1">
                GPS ID <span className="text-red-500">*</span>
              </label>
              <input
                value={gpsId}
                onChange={(e) => setGpsId(e.target.value)}
                placeholder="ID perangkat GPS"
                required
                className="border px-3 py-2 rounded-lg w-full text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 text-sm mb-1">
                GPS URL <span className="text-red-500">*</span>
              </label>
              <input
                value={gpsUrl}
                onChange={(e) => setGpsUrl(e.target.value)}
                placeholder="URL aplikasi/website tracking"
                required
                className="border px-3 py-2 rounded-lg w-full text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 text-sm mb-1">
                Upload QR Code (opsional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border px-3 py-2 rounded-lg w-full text-sm"
              />
              {preview && (
                <img
                  src={preview}
                  alt="QR Preview"
                  className="w-24 h-24 rounded-lg object-cover border mt-2 mx-auto cursor-pointer hover:scale-105 transition"
                  onClick={() => setImgModal(true)}
                  title="Klik untuk preview besar"
                />
              )}
            </div>
            {error && (
              <div className="text-red-500 text-sm font-semibold">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg font-bold shadow"
            >
              {loading ? "Menyimpan..." : "Simpan Data GPS"}
            </button>
          </form>
        </div>
      </div>
      <ModalImagePreview
        open={imgModal}
        src={preview}
        onClose={() => setImgModal(false)}
      />
    </>
  );
}

export default function TrackingPage() {
  const [motors, setMotors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, motor: null });
  const [imgPreview, setImgPreview] = useState({ open: false, src: "" });

  const fetchMotors = async () => {
    try {
      // Ambil SEMUA kendaraan (bukan hanya yang ada GPS)
      const res = await API.get("/kendaraan");
      setMotors(res.data);
    } catch (err) {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotors();
  }, []);

  return (
    <AdminLayout>
      <section className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-blue-800">
            📡 Tracking Kendaraan
          </h1>
          <button
            onClick={fetchMotors}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-4 py-2 rounded-full shadow transition"
          >
            <FiRefreshCcw /> Refresh
          </button>
        </div>
        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">
            Memuat data...
          </p>
        ) : motors.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            Tidak ada motor yang tersedia.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {motors.map((motor) => (
              <div
                key={motor.id}
                className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center relative group hover:shadow-2xl transition"
              >
                <h2 className="text-xl font-bold text-blue-800 mb-1 uppercase tracking-wide">
                  {motor.nama}
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  {motor.tipe} | {motor.transmisi}
                </p>
                {motor.gpsId ? (
                  <>
                    <p className="text-sm text-blue-700 font-semibold mb-2">
                      GPS ID: {motor.gpsId}
                    </p>
                    {motor.qrImage && (
                      <img
                        src={motor.qrImage}
                        alt="QR Code"
                        className="w-32 h-32 mx-auto border p-2 bg-white rounded-lg shadow hover:scale-105 hover:shadow-2xl transition cursor-pointer"
                        title="Klik untuk preview besar"
                        onClick={() =>
                          setImgPreview({ open: true, src: motor.qrImage })
                        }
                      />
                    )}
                    <a
                      href={motor.gpsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-semibold mt-4 shadow transition"
                    >
                      <FiMapPin /> Lihat Tracking
                    </a>
                  </>
                ) : (
                  <div className="text-sm text-red-500 italic mb-3">
                    Belum ada data GPS
                  </div>
                )}
                <button
                  className="mt-4 inline-flex items-center gap-2 text-sm text-blue-700 hover:underline"
                  onClick={() => setModal({ open: true, motor })}
                >
                  <FiUpload /> {motor.gpsId ? "Ubah" : "Tambah"} GPS
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Modal Edit GPS */}
        {modal.open && (
          <ModalEditGPS
            open={modal.open}
            motor={modal.motor}
            onClose={() => setModal({ open: false, motor: null })}
            onSuccess={fetchMotors}
          />
        )}
        {/* Modal Preview QR Image */}
        {imgPreview.open && (
          <ModalImagePreview
            open={imgPreview.open}
            src={imgPreview.src}
            onClose={() => setImgPreview({ open: false, src: "" })}
          />
        )}
      </section>
    </AdminLayout>
  );
}
