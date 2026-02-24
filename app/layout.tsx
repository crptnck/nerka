import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nerka.pro",
  description: "Опт морепродуктов и снеков",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Asap:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white min-h-screen">
        {/* ШАПКА */}
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-black border-b border-gray-800 flex items-center justify-between px-4 md:px-6">
          <div className="font-['Asap'] text-[#f20019] text-3xl md:text-5xl tracking-[-0.02em]">
            nerka<span style={{ color: "#ffffff" }}>.</span>pro
          </div>

          <a href="tel:+79244034203" className="text-white font-medium text-lg md:text-xl hover:text-[#f20019]">
            +7 924 403-42-03
          </a>

          <button className="md:hidden text-3xl">☰</button>
        </header>

        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
