import type { Metadata, Viewport } from "next";
import { Black_Han_Sans } from "next/font/google";
import "./globals.css";

const blackHan = Black_Han_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-black-han",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "2026 단톡방 어워즈 🏆",
  description: "올해 단톡방에서 가장 미친 존재감을 보여준 사람은? 카카오톡 대화로 여는 친구들끼리의 장난 시상식",
  openGraph: {
    title: "2026 단톡방 어워즈 🏆",
    description: "올해 단톡방에서 가장 미친 존재감을 보여준 사람은?",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={blackHan.variable}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
