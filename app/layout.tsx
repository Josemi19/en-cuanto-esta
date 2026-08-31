import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuanto Esta | Cotizaciones",
  description: "Cotizaciones actualizadas de Venezuela."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}