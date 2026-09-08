import "./globals.css";
import { QuotesProvider } from "./quotes-context";
import { Analytics } from "@vercel/analytics/next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "En Cuanto Esta | Dólar BCV y tasas cambiarias de Venezuela",
    template: "%s | En Cuanto Esta",
  },
  description:
    "Consulta en cuanto esta el dolar hoy, la tasa del BCV y otras tasas cambiarias de Venezuela en bolivares.",
  keywords: [
    "en cuanto esta",
    "en cuanto esta el dolar",
    "en cuanto esta bcv",
    "dolar bcv",
    "bolivares",
    "tasa cambiaria",
    "tasa del dolar hoy",
    "tasas cambiarias de Venezuela",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: "/",
    siteName: "En Cuanto Esta",
    title: "En Cuanto Esta | Dólar BCV y tasas cambiarias",
    description:
      "Consulta el dólar BCV, bolívares y otras tasas cambiarias de Venezuela.",
  },
  twitter: {
    card: "summary_large_image",
    title: "En Cuanto Esta | Dólar BCV y tasas cambiarias",
    description: "Consulta el dólar BCV y otras tasas cambiarias de Venezuela.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3551002915134191"
          crossorigin="anonymous"
        ></script>
      </head>
      <body>
        <QuotesProvider>{children}</QuotesProvider>
        <Analytics />
      </body>
    </html>
  );
}
