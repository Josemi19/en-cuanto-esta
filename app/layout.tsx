import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "En Cuanto Esta",
  description: "Tasas cambiarias actualizadas de Venezuela."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}