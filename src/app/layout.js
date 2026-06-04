import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import BackgroundVideo from "@/components/BackgroundVideo";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "ÇAPAR KUYUMCULUK - Dijital Katalog & İletişim Hub",
  description: "Ailenizin Kuyumcusu. Çapar Kuyumculuk dijital katalog, canlı altın fiyatları, IBAN bilgileri ve iletişim kanalları.",
  icons: {
    icon: "https://framerusercontent.com/images/JrO9LNKXUSHzbPwg3XjiLJhdkeU.png",
    shortcut: "https://framerusercontent.com/images/JrO9LNKXUSHzbPwg3XjiLJhdkeU.png",
    apple: "https://framerusercontent.com/images/JrO9LNKXUSHzbPwg3XjiLJhdkeU.png",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${playfair.variable} ${montserrat.variable}`}>
      <head>
        <meta name="theme-color" content="#070708" />
      </head>
      <body>
        <BackgroundVideo />
        <div className="video-overlay" />
        {children}
      </body>
    </html>
  );
}
