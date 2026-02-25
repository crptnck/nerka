import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nerka.pro — Опт морепродуктов и снеков",
  description:
    "Оптовые поставки морепродуктов, снеков и закусок. Доставка по России.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 md:h-16 md:px-6">
            {/* Logo */}
            <a href="/" className="flex items-baseline gap-0 shrink-0">
              <span className="text-brand text-2xl md:text-3xl font-bold tracking-tight">nerka</span>
              <span className="text-white text-2xl md:text-3xl font-bold">.</span>
              <span className="text-brand text-2xl md:text-3xl font-bold tracking-tight">pro</span>
            </a>

            {/* Nav - desktop */}
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
              <a href="/" className="text-white font-medium">Каталог</a>
              <a href="#delivery" className="hover:text-white transition-colors">Доставка</a>
              <a href="#contacts" className="hover:text-white transition-colors">Контакты</a>
            </nav>

            {/* Phone + CTA */}
            <div className="flex items-center gap-3">
              <a
                href="tel:+79244034203"
                className="hidden sm:block text-sm md:text-base text-white hover:text-brand transition-colors font-medium"
              >
                +7 924 403-42-03
              </a>
              <a
                href="https://wa.me/79244034203"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Написать
              </a>
            </div>
          </div>
        </header>

        <main className="min-h-screen">{children}</main>

        {/* FOOTER */}
        <footer id="contacts" className="border-t border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Col 1 */}
              <div>
                <div className="flex items-baseline gap-0 mb-3">
                  <span className="text-brand text-xl font-bold">nerka</span>
                  <span className="text-white text-xl font-bold">.</span>
                  <span className="text-brand text-xl font-bold">pro</span>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  Оптовые поставки морепродуктов,<br />снеков и закусок к пиву.
                </p>
              </div>

              {/* Col 2 */}
              <div>
                <h4 className="text-white font-semibold text-sm mb-3">Контакты</h4>
                <div className="space-y-2 text-sm text-muted">
                  <a href="tel:+79244034203" className="block hover:text-white transition-colors">
                    +7 924 403-42-03
                  </a>
                  <a href="https://wa.me/79244034203" className="block hover:text-white transition-colors">
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Col 3 */}
              <div id="delivery">
                <h4 className="text-white font-semibold text-sm mb-3">Доставка</h4>
                <p className="text-muted text-sm leading-relaxed">
                  Доставка по Хабаровску и ДВ.&nbsp;
                  Минимальный заказ — от 10 000 ₽.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-border text-muted text-xs">
              © {new Date().getFullYear()} nerka.pro
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
