/**
 * Menghitung harga sewa dengan penyesuaian dinamis dan opsi breakdown.
 * @param {Object} param
 * @param {number} param.harga_per_hari - Harga sewa per hari (setelah diskon produk, jika ada)
 * @param {Date} param.jam_pengambilan - Tanggal & jam mulai sewa
 * @param {Date} param.jam_pengembalian - Tanggal & jam akhir sewa
 * @param {boolean} [param.includeBreakdown=false] - Apakah ingin dapatkan rincian breakdown
 * @returns {number|object} total harga, atau object { total, breakdown, durasiHari }
 */
export default function calculateDynamicPrice({
  harga_per_hari,
  jam_pengambilan,
  jam_pengembalian,
  includeBreakdown = false,
}) {
  const durasiHari = Math.max(
    1,
    Math.ceil((jam_pengembalian - jam_pengambilan) / (1000 * 60 * 60 * 24))
  );

  const base = harga_per_hari * durasiHari;
  let total = base;
  const breakdown = [];

  // Weekend markup (Sabtu = 6, Minggu = 0)
  const pickupDay = jam_pengambilan.getDay();
  if (pickupDay === 0 || pickupDay === 6) {
    total += 25000;
    if (includeBreakdown) {
      breakdown.push("Biaya tambahan Weekend = +Rp 25.000");
    }
  }

  // Diskon long rent
  if (durasiHari >= 30) {
    const potongan = total * 0.15;
    total -= potongan;
    if (includeBreakdown) {
      breakdown.push(
        `Diskon Long Rent (≥ 30 hari) -15% = -Rp ${Math.round(
          potongan
        ).toLocaleString("id-ID")}`
      );
    }
  } else if (durasiHari >= 7) {
    const potongan = total * 0.1;
    total -= potongan;
    if (includeBreakdown) {
      breakdown.push(
        `Diskon Long Rent (≥ 7 hari) -10% = -Rp ${Math.round(
          potongan
        ).toLocaleString("id-ID")}`
      );
    }
  }

  const finalTotal = Math.round(total);

  return includeBreakdown
    ? { total: finalTotal, breakdown, durasiHari }
    : finalTotal;
}
