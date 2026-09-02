import "./globals.css";
import { QuotesProvider } from "./quotes-context";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "En Cuanto Esta",
  description: "Tasas cambiarias actualizadas de Venezuela.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "En Cuanto Esta",
    statusBarStyle: "default",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <QuotesProvider>{children}</QuotesProvider>
      </body>
    </html>
  );
}
