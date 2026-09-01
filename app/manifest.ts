import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "En Cuanto Esta",
    short_name: "En Cuanto",
    description: "Tasas cambiarias actualizadas de Venezuela.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef5f2",
    theme_color: "#147d64",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };
}