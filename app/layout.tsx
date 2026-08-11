import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AICS Lab Internal Portal · Ver.2",
  description: "AICS Lab 연구 운영 포털",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
