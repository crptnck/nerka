import type { UserData } from "./cart-context";

const BOT_TOKEN = process.env.NEXT_PUBLIC_TG_BOT_TOKEN ?? "";
const CHAT_ID = process.env.NEXT_PUBLIC_TG_CHAT_ID ?? "";
const ORDER_API = "/api/order.php";

type OrderItem = { name: string; price: string; unit: string; qty: number };

export function generateOrderNumber(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 5);
  return `${pad(d.getDate())}${pad(d.getMonth() + 1)}${String(d.getFullYear()).slice(2)}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}-${rand}`;
}

function parsePrice(s: string): number {
  return Number(s.replace(/\s/g, "")) || 0;
}

export function calcTotal(items: OrderItem[]): number {
  return items.reduce((sum, i) => sum + parsePrice(i.price) * i.qty, 0);
}

export async function sendOrderToTelegram(
  orderNum: string,
  items: OrderItem[],
  user: UserData,
  comment: string,
): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("Telegram credentials not configured");
    return false;
  }

  const total = calcTotal(items);
  const lines = [
    `🧾 Заказ #${orderNum}`,
    `📅 ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Vladivostok" })}`,
    "",
    ...items.map(
      (i) =>
        `• ${i.name} — ${i.qty} ${i.unit} × ${i.price} ₽ = ${(parsePrice(i.price) * i.qty).toLocaleString("ru-RU")} ₽`,
    ),
    "",
    `💰 Итого: ${total.toLocaleString("ru-RU")} ₽`,
    "",
    `📞 ${user.phone}`,
    user.name ? `👤 ${user.name}` : "",
    user.address ? `📍 ${user.address}` : "",
    comment ? `💬 ${comment}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    // Сначала пробуем через серверный прокси (обходит блокировку TG в РФ)
    const res = await fetch(ORDER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lines }),
    });
    if (res.ok) return true;

    // Фоллбэк: прямой вызов Telegram API (работает из-за рубежа / через VPN)
    const direct = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: lines }),
    });
    return direct.ok;
  } catch {
    console.error("Failed to send order to Telegram");
    return false;
  }
}
