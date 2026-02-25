const products = [
  { id: 1, name: "Нерка с/м б/г", weight: "~2-3 кг/шт", price: "890", unit: "кг", badge: "Хит", gradient: "from-red-900 to-red-950" },
  { id: 2, name: "Кета с/м б/г", weight: "~2-4 кг/шт", price: "490", unit: "кг", badge: null, gradient: "from-orange-900 to-orange-950" },
  { id: 3, name: "Горбуша с/м п.б.г", weight: "~1-1.5 кг/шт", price: "290", unit: "кг", badge: null, gradient: "from-amber-900 to-amber-950" },
  { id: 4, name: "Креветка с/м 50/70", weight: "блок 10 кг", price: "1 250", unit: "кг", badge: "Новинка", gradient: "from-pink-900 to-pink-950" },
  { id: 5, name: "Кальмар тушка с/м", weight: "блок 10 кг", price: "420", unit: "кг", badge: null, gradient: "from-slate-800 to-slate-950" },
  { id: 6, name: "Минтай б/г с/м", weight: "блок 22.68 кг", price: "185", unit: "кг", badge: null, gradient: "from-blue-900 to-blue-950" },
  { id: 7, name: "Янтарная рыбка с перцем", weight: "упак. 1 кг", price: "780", unit: "кг", badge: "Хит", gradient: "from-yellow-900 to-yellow-950" },
  { id: 8, name: "Кольца кальмара сушёные", weight: "упак. 1 кг", price: "920", unit: "кг", badge: null, gradient: "from-amber-800 to-amber-950" },
  { id: 9, name: "Стружка кальмара", weight: "упак. 500 г", price: "680", unit: "кг", badge: null, gradient: "from-orange-800 to-orange-950" },
  { id: 10, name: "Икра горбуши 1 сорт", weight: "д/б 11 кг", price: "5 200", unit: "кг", badge: "Сезон", gradient: "from-red-800 to-red-950" },
  { id: 11, name: "Краб-стригун мясо", weight: "упак. 500 г", price: "2 800", unit: "кг", badge: null, gradient: "from-rose-900 to-rose-950" },
  { id: 12, name: "Сельдь с/с", weight: "ведро 10 кг", price: "210", unit: "кг", badge: null, gradient: "from-indigo-900 to-indigo-950" },
];

const categories = ["Все", "Рыба", "Морепродукты", "Снеки", "Икра"];

export default function Catalog() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      {/* Hero */}
      <section className="py-8 md:py-14">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
          Опт морепродуктов и снеков
        </h1>
        <p className="text-muted text-sm md:text-base max-w-xl">
          Прямые поставки с Дальнего Востока. Свежая и свежемороженая продукция для HoReCa и розничных сетей.
        </p>
      </section>

      {/* Filters */}
      <section className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat, i) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              i === 0
                ? "bg-brand text-white"
                : "bg-surface text-muted hover:text-white hover:bg-surface-hover border border-border"
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Product grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
        {products.map((p) => (
          <article
            key={p.id}
            className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-brand/30 transition-colors group"
          >
            {/* Image placeholder */}
            <div className={`relative h-40 md:h-44 bg-gradient-to-br ${p.gradient} flex items-center justify-center`}>
              <span className="text-white/20 text-6xl font-bold select-none">🐟</span>
              {p.badge && (
                <span className="absolute top-3 left-3 bg-brand text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                  {p.badge}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="text-white font-semibold text-sm md:text-base leading-snug mb-1">
                {p.name}
              </h3>
              <p className="text-muted text-xs mb-3">{p.weight}</p>

              <div className="flex items-end justify-between">
                <div>
                  <span className="text-brand text-lg md:text-xl font-bold">{p.price} ₽</span>
                  <span className="text-muted text-xs ml-1">/ {p.unit}</span>
                </div>
                <a
                  href="https://wa.me/79244034203"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  Заказать
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-surface border border-border rounded-2xl p-6 md:p-10 mb-12 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Нужен индивидуальный прайс?</h2>
        <p className="text-muted text-sm md:text-base mb-5 max-w-md mx-auto">
          Напишите нам — подберём ассортимент и объёмы под ваш бизнес.
        </p>
        <a
          href="https://wa.me/79244034203"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-brand hover:bg-brand-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Написать в WhatsApp
        </a>
      </section>
    </div>
  );
}
