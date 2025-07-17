import axios from "axios";

// Tidak perlu lagi baca rows[0].elements[0], cukup ambil langsung
export const getDistanceGoogle = async (origin, destination) => {
  try {
    const response = await axios.get(
      `https://sewamotorxbe-production.up.railway.app/api/maps/distance`,
      {
        params: {
          origin,
          destination,
        },
      }
    );

    // Ambil langsung dari response.data
    if (
      response.data &&
      response.data.distance &&
      response.data.distance.value
    ) {
      // hasil meter → km (1 desimal)
      const jarakKm = response.data.distance.value / 1000;
      return Math.round(jarakKm * 10) / 10;
    } else {
      console.error("Jarak tidak ditemukan:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Gagal ambil jarak dari Google Maps API:", error);
    return null;
  }
};
