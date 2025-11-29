import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TELA Coffee - Roasting Record",
  description: "커피 로스팅 기록 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
