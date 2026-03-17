import type { Metadata, Viewport } from "next";
import { Cinzel, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "สัมผัส ดีวาย — ดูดวงไพ่ทาโร่",
  description: "เปิดไพ่ทาโร่เพื่อค้นหาคำตอบที่จักรวาลมีให้คุณ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${cinzel.variable} ${notoSansThai.variable}`}>
      <body className="font-thai antialiased">{children}</body>
    </html>
  );
}
