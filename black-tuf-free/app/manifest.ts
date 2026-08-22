import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Black Tuf — Engineering Digital & Industrial Solutions",
    short_name: "Black Tuf",
    description:
      "Marketplace connecting clients with vetted engineers across software and industrial automation.",
    start_url: "/",
    display: "standalone",
    background_color: "#07080f",
    theme_color: "#07080f",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
