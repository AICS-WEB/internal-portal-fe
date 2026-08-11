import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AICS Lab Internal Portal",
  description: "AICS Lab 연구실 운영 포털",
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
