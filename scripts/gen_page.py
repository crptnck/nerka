#!/usr/bin/env python3
"""
Генерация page.tsx с маппингом фото, рабочими фильтрами и модалкой.
"""

# Маппинг product id → image slug
IMAGE_MAP = {
    # Морепродукты
    1: "dried-whole-fish", 2: "dried-whole-fish",
    3: "fish-roe",
    4: "dried-whole-fish", 5: "dried-whole-fish", 6: "dried-whole-fish", 7: "dried-whole-fish",
    8: "fish-caramel", 9: "fish-caramel",
    10: "fish-strips", 11: "fish-strips",
    12: "fish-fillet", 13: "fish-fillet",
    14: "dried-whole-fish", 15: "dried-whole-fish",
    16: "fish-fillet", 17: "fish-caramel",
    18: "fish-strips", 19: "smoked-fish-misc",
    20: "fish-caramel",
    21: "squid-rings",
    22: "squid-tentacles", 23: "squid-tentacles", 24: "squid-tentacles",
    # Закуски
    25: "anchovy",
    26: "salmon-jerky", 27: "salmon-jerky",
    28: "yellowtail",
    29: "fish-roe", 30: "fish-roe",
    31: "squid-rings", 32: "squid-rings",
    33: "fish-strips",
    34: "squid-rings",
    35: "fish-fillet", 36: "fish-fillet", 37: "fish-fillet",
    38: "squid-rings",
    39: "octopus",
    40: "fish-snack-misc",
    41: "yellowtail",
    42: "salmon-jerky",
    43: "squid-rings", 44: "squid-rings",
    45: "squid-rings", 46: "squid-rings",
    47: "fish-strips",
    48: "tuna", 49: "tuna",
    50: "salmon-jerky",
    51: "fish-snack-misc",
    52: "fish-strips",
    53: "fish-snack-misc",
    # Орехи и сухари
    54: "glazed-peanuts", 55: "glazed-peanuts", 56: "glazed-peanuts",
    57: "glazed-peanuts", 58: "glazed-peanuts", 59: "glazed-peanuts",
    60: "glazed-peanuts", 61: "glazed-peanuts", 62: "glazed-peanuts",
    63: "glazed-peanuts", 64: "glazed-peanuts", 65: "glazed-peanuts",
    66: "glazed-peanuts", 67: "glazed-peanuts",
    68: "roasted-peanuts", 69: "roasted-peanuts", 70: "roasted-peanuts",
    71: "roasted-peanuts", 72: "roasted-peanuts", 73: "roasted-peanuts",
    74: "snack-mix", 75: "snack-mix",
    76: "lavash-chips", 77: "lavash-chips", 78: "lavash-chips",
    79: "lavash-chips", 80: "lavash-chips", 81: "lavash-chips",
    82: "lavash-chips", 83: "lavash-chips",
    84: "rice-crackers", 85: "rice-crackers", 86: "rice-crackers",
    87: "rice-crackers", 88: "rice-crackers",
    89: "bread-crackers", 90: "bread-crackers", 91: "bread-crackers",
    92: "bread-crackers", 93: "bread-crackers", 94: "bread-crackers",
    95: "bread-crackers", 96: "bread-crackers",
    97: "roasted-peanuts",
    98: "soy-snack",
    99: "pistachios",
    # Мясо вяленое
    100: "chicken-jerky", 101: "chicken-jerky",
    102: "pork-jerky",
    103: "chicken-jerky",
    104: "pork-jerky",
    105: "chicken-jerky", 106: "chicken-jerky",
    107: "pork-jerky",
    108: "pork-jerky",
    109: "chicken-jerky",
    110: "sausages", 111: "sausages",
    112: "sausages", 113: "sausages", 114: "sausages",
    115: "pork-jerky",
    116: "chicken-jerky", 117: "chicken-jerky",
    118: "pork-jerky", 119: "pork-jerky",
    120: "chicken-jerky",
    121: "sausages",
    122: "chicken-jerky",
    # Сыр
    123: "cheese-sticks",
    124: "cheese-strings", 125: "cheese-strings", 126: "cheese-strings", 127: "cheese-strings",
    128: "cheese-strings", 129: "cheese-strings",
    130: "cheese-strings", 131: "cheese-strings", 132: "cheese-strings", 133: "cheese-strings",
    134: "cheese-strings", 135: "cheese-strings",
    136: "cheese-sticks", 137: "cheese-sticks", 138: "cheese-sticks", 139: "cheese-sticks",
    # Цех
    140: "smoked-fish-misc", 141: "smoked-fish-misc",
    142: "smoked-fish-misc",
    143: "shrimp",
    144: "smoked-fish-misc",
    145: "fish-caramel",
    146: "smoked-salmon", 147: "smoked-salmon",
    148: "fish-strips",
    149: "smoked-salmon",
    150: "fish-roe",
    151: "smoked-fish-misc",
    152: "smoked-salmon",
    153: "smoked-salmon", 154: "smoked-salmon",
    155: "fish-snack-misc", 156: "fish-snack-misc",
    157: "smoked-salmon", 158: "smoked-salmon",
    159: "fish-snack-misc",
    160: "fish-caramel",
    161: "fish-fillet", 162: "fish-fillet",
    # Икра
    163: "red-caviar",
}

# Читаем текущие данные продуктов из page.tsx
import re, os

page_path = os.path.join(os.path.dirname(__file__), "..", "app", "page.tsx")
with open(page_path, "r") as f:
    old_content = f.read()

# Извлекаем массив products
products_match = re.search(r'const products = \[(.*?)\];', old_content, re.DOTALL)
products_str = products_match.group(1)

# Парсим каждый продукт и добавляем image
lines = []
for m in re.finditer(
    r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*price:\s*"([^"]+)",\s*unit:\s*"([^"]+)",\s*stock:\s*(\d+),\s*category:\s*"([^"]+)",\s*color:\s*"([^"]+)"\s*\}',
    products_str
):
    pid = int(m.group(1))
    name = m.group(2)
    price = m.group(3)
    unit = m.group(4)
    stock = m.group(5)
    category = m.group(6)
    color = m.group(7)
    image = IMAGE_MAP.get(pid, "dried-whole-fish")
    lines.append(
        f'  {{ id: {pid}, name: "{name}", price: "{price}", unit: "{unit}", '
        f'stock: {stock}, category: "{category}", color: "{color}", image: "{image}" }},'
    )

products_ts = "\n".join(lines)

# Генерируем новый page.tsx
new_page = f'''"use client";

import {{ useState }} from "react";

/* ─── Данные каталога ─────────────────────────────────────────── */
/* image: slug фото-группы → /images/products/thumb|full/{{slug}}.webp */

const products = [
{products_ts}
];

const categories = ["Все", "Морепродукты", "Закуски", "Орехи и сухари", "Мясо вяленое", "Сыр", "Цех", "Икра"];

type Product = (typeof products)[number];

/* ─── Компонент каталога ──────────────────────────────────────── */

export default function Catalog() {{
  const [filter, setFilter] = useState("Все");
  const [selected, setSelected] = useState<Product | null>(null);

  const filtered = filter === "Все"
    ? products
    : products.filter((p) => p.category === filter);

  return (
    <div className="container">
      <section className="hero">
        <h1>Опт морепродуктов и снеков</h1>
        <p>Прямые поставки с Дальнего Востока. Свежая и свежемороженая продукция для HoReCa и розничных сетей.</p>
      </section>

      {{/* ── Фильтры категорий ── */}}
      <section className="filters">
        {{categories.map((cat) => (
          <button
            key={{cat}}
            className={{`chip${{filter === cat ? " active" : ""}}`}}
            onClick={{() => setFilter(cat)}}
          >
            {{cat}}
          </button>
        ))}}
      </section>

      {{/* ── Сетка товаров ── */}}
      <section className="grid">
        {{filtered.map((p) => (
          <article
            key={{p.id}}
            className="card"
            onClick={{() => setSelected(p)}}
            role="button"
            tabIndex={{0}}
            onKeyDown={{(e) => e.key === "Enter" && setSelected(p)}}
          >
            <div className="card-img">
              <img
                src={{`/images/products/thumb/${{p.image}}.webp`}}
                alt={{p.name}}
                width={{72}}
                height={{72}}
                loading="lazy"
                decoding="async"
              />
              {{p.stock <= 5 && <span className="card-badge">Мало</span>}}
            </div>
            <div className="card-body">
              <div className="card-title">{{p.name}}</div>
              <div className="card-row">
                <span className="card-price">{{p.price}} ₽</span>
                <span className="card-unit">/ {{p.unit}}</span>
                <div className="qty">
                  <button className="qty-btn" onClick={{(e) => e.stopPropagation()}}>−</button>
                  <span className="qty-val">0</span>
                  <button className="qty-btn" onClick={{(e) => e.stopPropagation()}}>+</button>
                </div>
              </div>
            </div>
          </article>
        ))}}
      </section>

      {{/* ── Модалка детальной карточки ── */}}
      {{selected && (
        <div className="modal-overlay" onClick={{() => setSelected(null)}}>
          <div className="modal" onClick={{(e) => e.stopPropagation()}}>
            <button className="modal-close" onClick={{() => setSelected(null)}} aria-label="Закрыть">×</button>
            <div className="modal-img">
              <img
                src={{`/images/products/full/${{selected.image}}.webp`}}
                alt={{selected.name}}
                width={{400}}
                height={{400}}
              />
            </div>
            <div className="modal-body">
              <span className="modal-cat">{{selected.category}}</span>
              <h2 className="modal-title">{{selected.name}}</h2>
              <div className="modal-price">
                <span className="modal-price-val">{{selected.price}} ₽</span>
                <span className="modal-price-unit">/ {{selected.unit}}</span>
              </div>
              {{selected.stock <= 5 && (
                <span className="modal-stock-low">Осталось мало — {{selected.stock}} {{selected.unit}}</span>
              )}}
              <div className="modal-qty">
                <button className="qty-btn">−</button>
                <span className="qty-val">0</span>
                <button className="qty-btn">+</button>
              </div>
              <a href="https://wa.me/79244034203" className="btn modal-order">Заказать в WhatsApp</a>
            </div>
          </div>
        </div>
      )}}
    </div>
  );
}}
'''

with open(page_path, "w") as f:
    f.write(new_page)

print(f"✅ page.tsx обновлён ({len(products_ts.splitlines())} товаров)")
