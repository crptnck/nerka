import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./cart-context";
import HeaderCart from "./header-cart";

export const metadata: Metadata = {
  title: "nerka.pro — Опт морепродуктов и снеков",
  description: "Оптовые поставки морепродуктов, снеков и закусок. Доставка по России.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <CartProvider>
        <header className="header">
          <div className="header-inner">
            <a href="/" className="logo">
              <span className="logo-red">nerka</span>
              <span className="logo-dot">.</span>
              <span className="logo-red">pro</span>
            </a>

            <nav className="nav">
              <a href="/" className="active">Каталог</a>
              <a href="#delivery">Доставка</a>
              <a href="#contacts">Контакты</a>
            </nav>

            <div className="header-right">
              <a href="tel:+79244034203" className="header-phone">+7 924 403-42-03</a>
              <HeaderCart />
            </div>
          </div>
        </header>

        <main>{children}</main>

        </CartProvider>
        <footer id="contacts" className="footer">
          <div className="container">
            <div className="footer-grid">
              <div>
                <div className="logo" style={{ marginBottom: 12 }}>
                  <span className="logo-red">nerka</span>
                  <span className="logo-dot">.</span>
                  <span className="logo-red">pro</span>
                </div>
                <p>Оптовые поставки морепродуктов,<br />снеков и закусок к пиву.</p>
              </div>
              <div>
                <h4>Контакты</h4>
                <div className="footer-links">
                  <a href="tel:+79244034203">+7 924 403-42-03</a>
                  <a href="https://wa.me/79244034203">WhatsApp</a>
                </div>
              </div>
              <div id="delivery">
                <h4>Доставка</h4>
                <p>Доставка по Хабаровску и ДВ. Минимальный заказ — от 10 000 ₽.</p>
              </div>
            </div>
            <div className="footer-bottom">© {new Date().getFullYear()} nerka.pro</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
