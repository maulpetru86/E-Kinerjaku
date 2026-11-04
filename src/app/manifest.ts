import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KinerjaKu — Asisten Pribadi Bukti e-Kinerja",
    short_name: "KinerjaKu",
    description:
      "Catat sekali, siapkan bukti sepanjang waktu. Asisten pribadi pencatatan aktivitas dan bank bukti dukung pelaporan e-Kinerja BKN.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      {
        src: "/file.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

