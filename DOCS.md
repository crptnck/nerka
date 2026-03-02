# nerka.pro — Полная техническая документация

> Документ для воссоздания проекта с нуля (ИИ-агентом или человеком).
> Последнее обновление: 2026-02-26

---

## 1. Бизнес-контекст

**nerka.pro** — B2B сайт-каталог оптовой продажи морепродуктов, снеков и закусок к пиву.

- **Регион**: Хабаровск и Дальний Восток
- **Аудитория**: HoReCa, розничные сети, мелкий опт
- **Минимальный заказ**: от 10 000 ₽
- **Владелец**: физлицо, работает один
- **Контакты**: +7 924 403-42-03, WhatsApp, Telegram
- **Домен**: nerka.pro (с 2011 года)

### Мотивация

Сайт — витрина-каталог с возможностью собрать корзину и отправить заказ. Заказ уходит в Telegram-бот владельцу. Никакой серверной логики, оплаты онлайн, личных кабинетов — максимальная простота.

---

## 2. Стек технологий

| Технология | Версия | Зачем |
|---|---|---|
| Next.js | 16.1.6 | React-фреймворк, статический экспорт |
| React | 19.2.3 | UI-компоненты, состояние корзины |
| TypeScript | ^5 | Типизация |
| Чистый CSS | — | Стили (без Tailwind, без CSS-in-JS) |
| GitHub Pages | — | Бесплатный статический хостинг |
| GitHub Actions | — | CI/CD: билд + деплой |
| Telegram Bot API | — | Приём заказов (клиентский fetch) |
| Python 3 + Pillow | — | Скрипты обработки фото |

### Почему такой стек

- **Tailwind v4 был убран** — ломал рендер в старых Safari/мобилках. Чистый CSS работает везде.
- **Статический экспорт** (`output: 'export'`) — GitHub Pages не поддерживает SSR.
- **Нет бэкенда** — вся логика на клиенте. Заказ отправляется напрямую в Telegram через Bot API.
- **React** — нужен для интерактивной корзины, фильтров, поиска, модалок.

---

## 3. Структура проекта

```
nerka-pro/
├── app/
│   ├── layout.tsx          # Корневой layout: header + footer + CartProvider
│   ├── page.tsx            # Каталог: массив 163 товаров + компонент Catalog
│   ├── globals.css         # Все стили (~480 строк, один файл)
│   ├── cart-context.tsx    # React Context для корзины (состояние + localStorage)
│   ├── cart-view.tsx       # Компонент корзины: список, форма, отправка
│   ├── header-cart.tsx     # Иконка корзины в шапке (badge с кол-вом)
│   └── send-order.ts      # Отправка заказа в Telegram Bot API
├── public/
│   ├── CNAME               # Домен nerka.pro для GitHub Pages
│   ├── .nojekyll           # Чтобы GH Pages не игнорировал _next/
│   └── images/products/
│       ├── micro/          # 32×32 WebP blur-placeholder (~0.6KB)
│       ├── thumb/          # 120×120 WebP для карточек (~3.6KB)
│       ├── full/           # 400×400 WebP для модалок (~15KB)
│       ├── fallback/       # 400×400 JPEG для старых браузеров (~25KB)
│       └── raw/            # Оригиналы (gitignored, только для перегенерации)
├── scripts/
│   ├── fetch_images.py     # Скачивание фото из Wikimedia Commons
│   ├── gen_page.py         # Генерация page.tsx из данных + маппинг фото
│   └── process_images.py   # Генерация 4 размеров из raw/ оригиналов
├── .github/workflows/
│   └── deploy.yml          # CI/CD: npm ci → build → deploy на GH Pages
├── .env.local              # TG_BOT_TOKEN + TG_CHAT_ID (gitignored)
├── ФОТО_СПРАВКА.txt        # Справочник: номер товара → имя файла фото
├── Обработать_фото.command # macOS: двойной клик → обработка фото + деплой
├── next.config.mjs         # output: 'export'
├── tsconfig.json
├── package.json
└── postcss.config.mjs
```


---

## 4. Модель данных

### 4.1. Товар (Product)

163 товара захардкожены в массиве `products` в `app/page.tsx`:

```typescript
{
  id: number,          // Уникальный ID (1–163)
  name: string,        // Название: "Камбала вяленая L"
  price: string,       // Цена с пробелом-разделителем тысяч: "1 145"
  unit: "кг" | "шт",   // Единица измерения
  stock: number,       // Остаток на складе (stock=0 → товар не включён)
  category: string,    // Одна из 7 категорий
  color: string,       // HEX цвет категории (не используется визуально)
  image: string,       // Slug фото: "p1"..."p163" → 4 файла в images/products/
  desc?: string,       // Опциональное описание (есть только у некоторых товаров)
}
```

### 4.2. Категории

7 категорий + мета-фильтр "Все":

| Категория | Цвет (color) | Кол-во товаров |
|---|---|---|
| Морепродукты | #1e3a5f | 24 |
| Закуски | #7c2d12 | 29 |
| Орехи и сухари | #5c4813 | 46 |
| Мясо вяленое | #6b1c1c | 23 |
| Сыр | #6b5c10 | 17 |
| Цех | #1e293b | 23 |
| Икра | #991b1b | 1 |

### 4.3. Акционные товары (promo)

Захардкожены по имени в массиве `promoNames` в `page.tsx`:

```
"Щупальца кальмара с/в", "Зубатка вяленая 23+", "Фисташка в/с",
"Сыр косичка слив Элазан 125гр", "Юкола форели",
"Минтай филе сушеный", "Кета полуспинка хк"
```

Отображаются отдельной секцией "Акция" вверху каталога (только при фильтре "Все").

### 4.4. Корзина (Cart)

Хранится в React Context (`cart-context.tsx`) + localStorage:

```typescript
type CartCtx = {
  cart: Record<number, number>,  // { productId: quantity }
  view: "catalog" | "cart" | "thanks",
  userData: UserData | null,     // { phone, name, address }
  setQty: (id: number, delta: number) => void,  // +1 / -1
  clearCart: () => void,
  setView: (v: View) => void,
  saveUser: (data: UserData) => void,
  totalItems: number,            // кол-во уникальных товаров в корзине
};
```

**localStorage-ключи:**
- `nerka_cart` — JSON с корзиной `{id: qty}`
- `nerka_user` — JSON с данными пользователя `{phone, name, address}`

### 4.5. Формат заказа (Telegram)

Заказ отправляется в Telegram через Bot API (`send-order.ts`):

```
🧾 Заказ #260226-142530-a3f
📅 26.02.2026, 14:25:30 (Asia/Vladivostok)

• Камбала вяленая L — 5 кг × 1 145 ₽ = 5 725 ₽
• Арахис сыр — 3 кг × 467 ₽ = 1 401 ₽

💰 Итого: 7 126 ₽

📞 +7 924 000-00-00
👤 Иван
📍 Хабаровск, ул. Ленина 1
💬 Доставка после 15:00
```

**Номер заказа**: `DDMMYY-HHmmss-rand` (дата + время + 3 случайных символа base36).

**Переменные окружения:**
- `NEXT_PUBLIC_TG_BOT_TOKEN` — токен Telegram-бота
- `NEXT_PUBLIC_TG_CHAT_ID` — ID чата для получения заказов


---

## 5. Компоненты и логика

### 5.1. layout.tsx — Корневой layout

**Ответственность**: обёртка всего приложения.

**Структура:**
1. `<html lang="ru">` — русская локаль
2. `<head>` — viewport с `maximum-scale=1, user-scalable=no` (предотвращает зум на мобилках)
3. `<CartProvider>` — оборачивает header и main (но НЕ footer)
4. `<header>` (sticky) — логотип, навигация, иконка корзины, телефон
5. `<main>{children}</main>` — контент страницы
6. `<footer>` — контакты, доставка, соцсети, копирайт

**Навигация в header:**
- Каталог (/) — активная ссылка
- Доставка (#delivery) — якорь в футере
- Контакты (#contacts) — якорь в футере
- Навигация скрыта на мобилках (display: none → display: flex при 768px+)

**Соцсети в footer:** WhatsApp, Telegram, MAX (SVG-иконки inline).

**Телефон**: `924 403 4203` — с неразрывными пробелами (U+202F) в header, `+7 924 403-42-03` в footer.

### 5.2. page.tsx — Каталог

**Директива**: `"use client"` — клиентский компонент (интерактивный).

**Состояние:**
- `filter` — текущая категория ("Все" по умолчанию)
- `selected` — товар для модалки (null = закрыта)
- `nextSectionIdx` — индекс следующей секции (для навигации)
- `searchActive` / `searchQuery` — поиск по названию

**Режимы отображения:**

1. **Секционный** (filter = "Все", поиск неактивен):
   - Товары группируются по категориям
   - Каждая группа: sticky заголовок (section-bar) + сетка карточек
   - Секция "Акция" вверху (promoItems)
   - Навигационная полоска внизу экрана ("↓ Следующая категория ↓")
   - Клик по заголовку секции — скролл к предыдущей секции

2. **Плоский** (выбрана категория или активен поиск):
   - Простая сетка отфильтрованных карточек

**Поиск:**
- Кнопка "Поиск" среди chip-фильтров (с иконкой лупы, border dashed)
- При активации: input с автофокусом + кнопка закрытия "✕"
- Фильтрация по `name.toLowerCase().includes(query)`
- Sticky позиция (прилипает под header)

**Карточка товара (renderCard):**
- Горизонтальная, высота 72px
- `<picture>` с WebP source + JPEG fallback
- Бейдж "Мало" при stock ≤ 5 (оранжевый)
- Кнопки +/− для количества (e.stopPropagation — чтобы не открывалась модалка)
- Весь блок кликабельный → открывает модалку

**Модалка:**
- Overlay с backdrop-filter blur
- Фото full-size (400×400)
- Описание: `desc` товара или автогенерированное "{category}. Опт, доставка по Хабаровску и ДВ."
- Цена, кнопки количества, кнопка OK
- Закрытие: клик по overlay или кнопка ×

### 5.3. cart-context.tsx — Состояние корзины

**React Context + localStorage persistence.**

**Hydration:**
- При монтировании: читает `nerka_cart` и `nerka_user` из localStorage
- Флаг `hydrated` предотвращает перезапись localStorage пустыми данными при SSR

**setQty(id, delta):**
- delta = +1 (добавить) или -1 (убрать)
- Если qty ≤ 0 → товар удаляется из корзины (delete next[id])
- useCallback для стабильной ссылки

**totalItems:** кол-во уникальных товаров (Object.keys(cart).length), НЕ сумма количеств.

### 5.4. cart-view.tsx — Экран корзины

**Пропсы:** получает массив `products` из page.tsx (чтобы не дублировать данные).

**Шаги (step):**
1. `"list"` — список товаров в корзине + итого + комментарий + кнопка "Подтвердить"
2. `"form"` — форма данных пользователя (если userData = null): телефон*, имя, адрес
3. `"sending"` — индикатор отправки
4. `"done"` — экран "Спасибо" с кнопкой "Вернуться в каталог"

**Логика оформления (handleConfirm):**
- Если userData нет и step = "list" → показывает форму (step = "form")
- Если userData есть → сразу отправляет
- После отправки: clearCart() + step = "done"

**calcTotal:** парсит цену (убирает пробелы), умножает на qty, суммирует.

### 5.5. header-cart.tsx — Иконка корзины

- Появляется только когда totalItems > 0
- Позиция: absolute center (left: 50%, top: 50%, transform: translate)
- Бейдж с количеством (красный кружок)
- Клик: переключение между catalog и cart view

### 5.6. send-order.ts — Отправка в Telegram

**Функции:**
- `generateOrderNumber()` — формат DDMMYY-HHmmss-rand
- `parsePrice(s)` — "1 145" → 1145 (убирает пробелы)
- `calcTotal(items)` — сумма (price × qty)
- `sendOrderToTelegram(orderNum, items, user, comment)` — POST на Telegram Bot API

**Telegram API:**
```
POST https://api.telegram.org/bot{TOKEN}/sendMessage
Body: { chat_id: CHAT_ID, text: formatированный_текст }
```

Токен и chat_id берутся из `process.env.NEXT_PUBLIC_TG_*` — вкомпилируются в клиентский бандл при билде.


---

## 6. Система фотографий

### 6.1. Схема именования

Каждый товар имеет поле `image: "p1"..."p163"` — это slug фотографии. Для каждого slug существует 4 файла:

```
public/images/products/
  thumb/p1.webp      — 120×120 WebP (~3.6KB) — карточка в каталоге
  full/p1.webp       — 400×400 WebP (~15KB)  — модалка
  fallback/p1.jpg    — 400×400 JPEG (~25KB)  — старые браузеры
  micro/p1.webp      — 32×32 WebP (~0.6KB)   — blur-placeholder
```

### 6.2. HTML-разметка фото

Используется `<picture>` для прогрессивной совместимости:

```html
<picture>
  <source srcSet="/images/products/thumb/p1.webp" type="image/webp" />
  <img src="/images/products/fallback/p1.jpg" alt="Название" width={72} height={72} loading="lazy" decoding="async" />
</picture>
```

Современные браузеры берут WebP. Старые (iPhone 5, iOS <14, Safari без WebP) — JPEG из `<img>`.

### 6.3. Обработка фото (process_images.py)

**Вход:** оригинальные фото в `public/images/products/raw/` (gitignored).

**Пайплайн:**
1. Открыть оригинал (поддержка: jpg, png, webp, heic, tiff, bmp)
2. Конвертировать в RGB
3. Обрезать до квадрата из центра (crop_center_square)
4. Ресайз до целевого размера (LANCZOS)
5. Сохранить с бинарным поиском quality для попадания в бюджет KB

**Бинарный поиск quality:**
- 8 итераций, диапазон 10–85
- Для WebP: `img.save(format="WEBP", quality=mid, method=4)`
- Для JPEG: `img.save(format="JPEG", quality=mid, optimize=True)`
- Если даже min_quality превышает бюджет — сохраняет с min_quality

**Запуск:**
```bash
python3 scripts/process_images.py          # обработать новые
python3 scripts/process_images.py --force  # перезаписать все
```

### 6.4. Скачивание фото (fetch_images.py)

Скрипт для первоначального заполнения фото из Wikimedia Commons:
- Поиск через Wikimedia Commons API по английским ключевым словам
- Скачивание первого подходящего (>200×200px, не SVG)
- Если ничего не найдено — генерация плейсхолдера (тёмный круг на #0a0a0a фоне)
- User-Agent: "NerkaProBot/1.0"

### 6.5. Обработать_фото.command

macOS-скрипт для владельца (двойной клик в Finder):
1. Открывает папку raw/ в Finder
2. Считает файлы
3. Проверяет Python + Pillow
4. Запускает `process_images.py --force`
5. Спрашивает "Закоммитить и задеплоить? (y/n)"
6. При "y" — git add + commit + push

### 6.6. ФОТО_СПРАВКА.txt

Справочник для владельца: список всех 163 товаров с их номером-слагом (p1–p163).
Инструкция: назвать файл как номер (p1.jpg), положить в raw/, запустить обработку.

---

## 7. Стили (globals.css)

### 7.1. Дизайн-система

**CSS-переменные:**
```css
--brand: #e50019        /* красный акцент */
--brand-hover: #cc0016  /* hover-состояние */
--surface: #111         /* фон карточек */
--surface-hover: #1a1a1a
--border: #222          /* границы */
--muted: #888           /* вторичный текст */
--bg: #0a0a0a           /* фон страницы */
```

**Шрифт:** системный стек: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.

**Общий стиль:** тёмная тема, минималистичный B2B-дизайн.

### 7.2. Адаптивность (mobile-first)

- **<640px**: 1 колонка карточек
- **640px+**: 2 колонки
- **768px+**: навигация видна, header выше (64px), hero крупнее, footer 3 колонки
- **1024px+**: 2 колонки
- **1280px+**: 3 колонки

### 7.3. Ключевые компоненты

**Header (sticky):**
- Высота: 56px (→ 40px при скролле, через класс `body.scrolled`)
- Фон: `rgba(10,10,10,0.95)` + backdrop-filter blur(10px)
- Transition на height: 0.15s

**Section bars (sticky):**
- Прилипают к верху (top: 56px, → 40px при scrolled)
- Текст uppercase, letter-spacing, centered
- Секция "Акция" — красного цвета

**Section-next (fixed bottom):**
- Полоска внизу экрана "↓ Категория ↓"
- Исчезает когда пользователь в конце страницы (atBottom detection)

**Карточки:** border-radius: 10px, border hover → rgba(229,0,25,0.3).

**Модалка:** max-width: 380px, border-radius: 16px, кнопка закрытия — полупрозрачный круг.

---

## 8. CI/CD и деплой

### 8.1. GitHub Actions (.github/workflows/deploy.yml)

**Триггер:** push в `main` или workflow_dispatch.

**Jobs:**
1. **build**: checkout → setup-node@20 → npm ci → npm run build (с env TG_BOT_TOKEN, TG_CHAT_ID из secrets) → upload-pages-artifact (out/)
2. **deploy**: deploy-pages → GitHub Pages

**Секреты в GitHub:**
- `TG_BOT_TOKEN` — токен Telegram-бота
- `TG_CHAT_ID` — ID чата

### 8.2. Next.js конфигурация

```javascript
// next.config.mjs
const nextConfig = { output: 'export' };
```

Это генерирует полностью статический сайт в `out/`.

### 8.3. Домен

- `public/CNAME` содержит `nerka.pro`
- DNS: A-записи на GitHub Pages IPs (185.199.108–111.153)
- `public/.nojekyll` — чтобы GitHub Pages не игнорировал папку `_next/`

### 8.4. Локальная разработка

```bash
npm install
npm run dev          # → http://localhost:3000

# .env.local с TG-кредами (gitignored):
NEXT_PUBLIC_TG_BOT_TOKEN=...
NEXT_PUBLIC_TG_CHAT_ID=...
```

### 8.5. Продакшн-билд

```bash
npm run build        # → out/
```


---

## 9. Инструкция по воссозданию с нуля

### Шаг 1: Инициализация проекта

```bash
npx create-next-app@latest nerka-pro --typescript --app --no-tailwind --no-src-dir
cd nerka-pro
npm install
```

Настроить `next.config.mjs`:
```javascript
const nextConfig = { output: 'export' };
export default nextConfig;
```

### Шаг 2: Структура файлов

Создать файлы в `app/`:
1. `globals.css` — все стили (dark theme, CSS-переменные, responsive grid)
2. `cart-context.tsx` — React Context: cart state + localStorage persistence
3. `send-order.ts` — функции отправки заказа в Telegram
4. `header-cart.tsx` — иконка корзины (клиентский компонент)
5. `cart-view.tsx` — экран корзины: список, форма, отправка, "спасибо"
6. `layout.tsx` — header (sticky, logo, nav, phone) + footer (contacts, socials) + CartProvider
7. `page.tsx` — массив products (163 товара) + компонент Catalog

### Шаг 3: Данные товаров

Массив `products` в `page.tsx` — 163 объекта. Источник: Excel прайс-лист → скрипт `gen_page.py`.

Ключевые моменты:
- Цены в формате строки с пробелом: "1 145" (парсить через `Number(s.replace(/\s/g, ""))`)
- Товары с stock=0 не включаются
- 7 категорий, порядок: Морепродукты, Закуски, Орехи и сухари, Мясо вяленое, Сыр, Цех, Икра
- image = "p{id}" — slug для файлов фотографий

### Шаг 4: Фотографии

1. Положить оригиналы в `public/images/products/raw/` (p1.jpg, p2.jpg, ...)
2. Запустить `python3 scripts/process_images.py` → генерация micro/thumb/full/fallback

Или для первоначального заполнения: `python3 scripts/fetch_images.py` (Wikimedia Commons).

### Шаг 5: Telegram-бот

1. Создать бота через @BotFather → получить токен
2. Получить chat_id (отправить сообщение боту, запросить getUpdates)
3. Создать `.env.local`:
   ```
   NEXT_PUBLIC_TG_BOT_TOKEN=...
   NEXT_PUBLIC_TG_CHAT_ID=...
   ```
4. Добавить секреты в GitHub: `TG_BOT_TOKEN`, `TG_CHAT_ID`

### Шаг 6: GitHub Pages

1. Создать репозиторий на GitHub
2. Добавить `public/CNAME` с доменом
3. Добавить `public/.nojekyll`
4. Настроить DNS: A-записи на 185.199.108–111.153
5. Добавить `.github/workflows/deploy.yml`
6. Push в main → автодеплой

### Шаг 7: Обновление каталога

1. Обновить массив `products` в `page.tsx`
2. Для новых товаров: добавить фото в `raw/`, запустить `process_images.py`
3. Push в main

---

## 10. Особенности и edge-cases

### Производительность
- Все фото с `loading="lazy"` и `decoding="async"`
- Нет внешних шрифтов, нет иконочных библиотек (SVG inline)
- Суммарный вес фото: ~1.3MB на все размеры
- CSS в одном файле (~480 строк)
- Рассчитано на EDGE (2G) соединение

### Совместимость
- `<picture>` с WebP + JPEG fallback для старых iOS
- viewport `user-scalable=no` для мобилок
- Системный шрифт (без загрузки)
- Чистый CSS (без CSS-in-JS, без Tailwind v4 который ломал старые Safari)

### UX-решения
- Header сжимается при скролле (56px → 40px) — экономия места на мобилке
- Sticky section headers — пользователь всегда видит текущую категорию
- Навигационная полоска внизу — быстрый переход к следующей категории
- Корзина запоминается в localStorage — не теряется при обновлении страницы
- Данные пользователя сохраняются — не нужно вводить повторно
- Бейдж "Мало" — мотивация к покупке (stock ≤ 5)
- Неразрывные пробелы в телефоне (U+202F) — красивый перенос

### Безопасность
- Telegram токен вкомпилирован в клиентский бандл (NEXT_PUBLIC_*) — это сознательный компромисс для serverless-архитектуры. Бот только отправляет сообщения в один чат.
- `.env.local` gitignored
- Секреты в GitHub Actions через secrets

---

## 11. Зависимости

### npm (package.json)
```
dependencies:
  next: 16.1.6
  react: 19.2.3
  react-dom: 19.2.3

devDependencies:
  @tailwindcss/postcss: ^4    (установлен, но НЕ используется — postcss.config пустой)
  @types/node: ^20
  @types/react: ^19
  @types/react-dom: ^19
  eslint: ^9
  eslint-config-next: 16.1.6
  tailwindcss: ^4              (установлен, но НЕ используется)
  typescript: ^5
```

### Python (только для скриптов)
- Python 3
- Pillow (PIL)
- requests (только для fetch_images.py)

### Системные
- Node.js 20+
- Git
- macOS (для .command скрипта, опционально)

