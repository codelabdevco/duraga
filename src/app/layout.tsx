import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
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
    <html lang="th" className={notoSansThai.variable}>
      <body className="font-noto antialiased">{children}</body>
    </html>
  );
}
