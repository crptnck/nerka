const products = [
  { id: 1, name: "Нерка с/м б/г", weight: "~2-3 кг/шт", price: "890", unit: "кг", badge: "Хит", color: "#7f1d1d" },
  { id: 2, name: "Кета с/м б/г", weight: "~2-4 кг/шт", price: "490", unit: "кг", badge: null, color: "#7c2d12" },
  { id: 3, name: "Горбуша с/м п.б.г", weight: "~1-1.5 кг/шт", price: "290", unit: "кг", badge: null, color: "#78350f" },
  { id: 4, name: "Креветка с/м 50/70", weight: "блок 10 кг", price: "1 250", unit: "кг", badge: "Новинка", color: "#831843" },
  { id: 5, name: "Кальмар тушка с/м", weight: "блок 10 кг", price: "420", unit: "кг", badge: null, color: "#1e293b" },
  { id: 6, name: "Минтай б/г с/м", weight: "блок 22.68 кг", price: "185", unit: "кг", badge: null, color: "#1e3a5f" },
  { id: 7, name: "Янтарная рыбка с перцем", weight: "упак. 1 кг", price: "780", unit: "кг", badge: "Хит", color: "#713f12" },
  { id: 8, name: "Кольца кальмара сушёные", weight: "упак. 1 кг", price: "920", unit: "кг", badge: null, color: "#92400e" },
  { id: 9, name: "Стружка кальмара", weight: "упак. 500 г", price: "680", unit: "кг", badge: null, color: "#9a3412" },
  { id: 10, name: "Икра горбуши 1 сорт", weight: "д/б 11 кг", price: "5 200", unit: "кг", badge: "Сезон", color: "#991b1b" },
  { id: 11, name: "Краб-стригун мясо", weight: "упак. 500 г", price: "2 800", unit: "кг", badge: null, color: "#881337" },
  { id: 12, name: "Сельдь с/с", weight: "ведро 10 кг", price: "210", unit: "кг", badge: null, color: "#312e81" },
];

const categories = ["Все", "Рыба", "Морепродукты", "Снеки", "Икра"];

export default function Catalog() {
  return (
    <div className="container">
      <section className="hero">
        <h1>Опт морепродуктов и снеков</h1>
        <p>Прямые поставки с Дальнего Востока. Свежая и свежемороженая продукция для HoReCa и розничных сетей.</p>
      </section>

      <section className="filters">
        {categories.map((cat, i) => (
          <button key={cat} className={`chip${i === 0 ? " active" : ""}`}>{cat}</button>
        ))}
      </section>

      <section className="grid">
        {products.map((p) => (
          <article key={p.id} className="card">
            <div className="card-img" style={{ background: p.color }}>
              <span style={{ opacity: 0.2, userSelect: "none" }}>🐟</span>
              {p.badge && <span className="card-badge">{p.badge}</span>}
            </div>
            <div className="card-body">
              <div className="card-title">{p.name}</div>
              <div className="card-meta">{p.weight}</div>
              <div className="card-footer">
                <div>
                  <span className="card-price">{p.price} ₽</span>
                  <span className="card-unit">/ {p.unit}</span>
                </div>
                <a href="https://wa.me/79244034203" target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                  Заказать
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="cta">
        <h2>Нужен индивидуальный прайс?</h2>
        <p>Напишите нам — подберём ассортимент и объёмы под ваш бизнес.</p>
        <a href="https://wa.me/79244034203" target="_blank" rel="noopener noreferrer" className="btn">
          Написать в WhatsApp
        </a>
      </section>
    </div>
  );
}
