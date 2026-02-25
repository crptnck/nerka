"use client";

import { useState } from "react";
import { useCart, type UserData } from "./cart-context";
import { sendOrderToTelegram, generateOrderNumber, calcTotal } from "./send-order";

/* products imported from page — pass as prop to avoid duplication */
type Product = {
  id: number;
  name: string;
  price: string;
  unit: string;
  image: string;
  [k: string]: unknown;
};

export default function CartView({ products }: { products: Product[] }) {
  const { cart, setQty, clearCart, userData, saveUser, setView } = useCart();
  const [comment, setComment] = useState("");
  const [step, setStep] = useState<"list" | "form" | "sending" | "done">("list");
  const [phone, setPhone] = useState(userData?.phone ?? "");
  const [name, setName] = useState(userData?.name ?? "");
  const [address, setAddress] = useState(userData?.address ?? "");

  const items = Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find((pr) => pr.id === Number(id));
      return p ? { ...p, qty } : null;
    })
    .filter(Boolean) as (Product & { qty: number })[];

  const total = calcTotal(items.map((i) => ({ name: i.name, price: i.price, unit: i.unit, qty: i.qty })));

  /* ── Оформление заказа ── */
  const handleConfirm = async () => {
    if (items.length === 0) return;

    /* Если пользователь незнакомый — показываем форму */
    if (!userData && step === "list") {
      setStep("form");
      return;
    }

    const user: UserData = userData ?? { phone, name, address };
    if (!user.phone.trim()) return;

    /* Сохраняем данные пользователя */
    if (!userData) saveUser(user);

    setStep("sending");
    const orderNum = generateOrderNumber();
    await sendOrderToTelegram(
      orderNum,
      items.map((i) => ({ name: i.name, price: i.price, unit: i.unit, qty: i.qty })),
      user,
      comment,
    );

    clearCart();
    setStep("done");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    saveUser({ phone, name, address });
    handleConfirm();
  };

  /* ── Экран «Спасибо» ── */
  if (step === "done") {
    return (
      <div className="thanks-screen">
        <div className="thanks-icon">✓</div>
        <h2>Спасибо за заказ!</h2>
        <p>Оператор свяжется с вами для подтверждения.</p>
        <button className="btn" onClick={() => { setStep("list"); setView("catalog"); }}>
          Вернуться в каталог
        </button>
      </div>
    );
  }

  /* ── Форма для незнакомого пользователя ── */
  if (step === "form") {
    return (
      <div className="checkout-form">
        <h2 className="cart-heading">Ваши данные</h2>
        <form onSubmit={handleFormSubmit}>
          <label className="form-label">
            Телефон <span className="form-req">*</span>
            <input
              className="form-input"
              type="tel"
              placeholder="+7 ..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className="form-label">
            Имя
            <input
              className="form-input"
              type="text"
              placeholder="Как к вам обращаться"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="form-label">
            Адрес доставки
            <input
              className="form-input"
              type="text"
              placeholder="Город, улица, дом"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setStep("list")}>Назад</button>
            <button type="submit" className="btn">Отправить заказ</button>
          </div>
        </form>
      </div>
    );
  }

  /* ── Отправка ── */
  if (step === "sending") {
    return (
      <div className="thanks-screen">
        <p>Отправляем заказ...</p>
      </div>
    );
  }

  /* ── Список корзины ── */
  return (
    <div className="cart-wrap">
      <div className="cart-header">
        <h2 className="cart-heading">Корзина</h2>
        <button className="cart-back" onClick={() => setView("catalog")}>← Каталог</button>
      </div>

      {items.length === 0 ? (
        <p className="cart-empty">Корзина пуста</p>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  <picture>
                    <source srcSet={`/images/products/thumb/${item.image}.webp`} type="image/webp" />
                    <img src={`/images/products/fallback/${item.image}.jpg`} alt={item.name} width={56} height={56} loading="lazy" />
                  </picture>
                </div>
                <div className="cart-item-body">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-row">
                    <span className="card-price">{item.price} ₽</span>
                    <span className="card-unit">/ {item.unit}</span>
                    <div className="qty">
                      <button className="qty-btn" onClick={() => setQty(item.id, -1)}>−</button>
                      <span className="qty-val">{item.qty}</span>
                      <button className="qty-btn" onClick={() => setQty(item.id, +1)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Итого:</span>
              <span className="cart-total-val">{total.toLocaleString("ru-RU")} ₽</span>
            </div>
            <textarea
              className="cart-comment"
              placeholder="Комментарий к заказу..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
            <button className="btn cart-confirm" onClick={handleConfirm}>
              Подтвердить заказ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
