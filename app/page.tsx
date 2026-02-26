"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "./cart-context";
import CartView from "./cart-view";

/* ─── Данные каталога ─────────────────────────────────────────── */
/*
 * image: slug фото-группы → 4 файла на slug:
 *   micro/{slug}.webp     — ~1KB  blur-placeholder (32×32)
 *   thumb/{slug}.webp     — ~5KB  превью в списке (120×120)
 *   full/{slug}.webp      — ~15KB детальная карточка (400×400)
 *   fallback/{slug}.jpg   — ~25KB JPEG совместимость (400×400)
 */

const products = [
  { id: 1, name: "Зубатка вяленая 23+", price: "2 250", unit: "кг", stock: 103, category: "Морепродукты", color: "#1e3a5f", image: "dried-whole-fish" },
  { id: 2, name: "Зубатка вяленая икряная", price: "3 400", unit: "кг", stock: 5, category: "Морепродукты", color: "#1e3a5f", image: "dried-whole-fish" },
  { id: 3, name: "Икра камбалы", price: "2 100", unit: "кг", stock: 4, category: "Морепродукты", color: "#1e3a5f", image: "fish-roe", desc: "Натуральная икра камбалы дальневосточного вылова. Солёная, вяленая, готова к употреблению. Отлично подходит как закуска к пиву и для розничной перепродажи. Фасовка оптом от 1 кг. Срок хранения 6 мес." },
  { id: 4, name: "Камбала б/ш", price: "1 350", unit: "кг", stock: 30, category: "Морепродукты", color: "#1e3a5f", image: "dried-whole-fish" },
  { id: 5, name: "Камбала вяленая L", price: "1 145", unit: "кг", stock: 12, category: "Морепродукты", color: "#1e3a5f", image: "dried-whole-fish" },
  { id: 6, name: "Камбала вяленая M", price: "1 155", unit: "кг", stock: 20, category: "Морепродукты", color: "#1e3a5f", image: "dried-whole-fish" },
  { id: 7, name: "Камбала икряная", price: "1 980", unit: "кг", stock: 19, category: "Морепродукты", color: "#1e3a5f", image: "dried-whole-fish" },
  { id: 8, name: "Камбала карамелька", price: "2 275", unit: "кг", stock: 10, category: "Морепродукты", color: "#1e3a5f", image: "fish-caramel" },
  { id: 9, name: "Камбала карамелька Океан", price: "1 675", unit: "кг", stock: 6, category: "Морепродукты", color: "#1e3a5f", image: "fish-caramel" },
  { id: 10, name: "Камбала соломка", price: "2 150", unit: "кг", stock: 1, category: "Морепродукты", color: "#1e3a5f", image: "fish-strips" },
  { id: 11, name: "Камбала соломка Океан", price: "2 045", unit: "кг", stock: 11, category: "Морепродукты", color: "#1e3a5f", image: "fish-strips" },
  { id: 12, name: "Камбала филе", price: "2 250", unit: "кг", stock: 7, category: "Морепродукты", color: "#1e3a5f", image: "fish-fillet" },
  { id: 13, name: "Камбала филе на шкуре", price: "2 062", unit: "кг", stock: 5, category: "Морепродукты", color: "#1e3a5f", image: "fish-fillet" },
  { id: 14, name: "Корюшка вяленая", price: "2 170", unit: "кг", stock: 1, category: "Морепродукты", color: "#1e3a5f", image: "dried-whole-fish" },
  { id: 15, name: "Корюшка икряная", price: "3 564", unit: "кг", stock: 10, category: "Морепродукты", color: "#1e3a5f", image: "dried-whole-fish" },
  { id: 16, name: "Минтай в кунжуте ДВРК", price: "2 100", unit: "кг", stock: 13, category: "Морепродукты", color: "#1e3a5f", image: "fish-fillet" },
  { id: 17, name: "Минтай карамелька ДВРК", price: "2 100", unit: "кг", stock: 4, category: "Морепродукты", color: "#1e3a5f", image: "fish-caramel" },
  { id: 18, name: "Минтай филе полоски ДВРК", price: "2 100", unit: "кг", stock: 11, category: "Морепродукты", color: "#1e3a5f", image: "fish-strips" },
  { id: 19, name: "Минтай филе х/к ДВРК", price: "1 445", unit: "кг", stock: 5, category: "Морепродукты", color: "#1e3a5f", image: "smoked-fish-misc" },
  { id: 20, name: "Палтус карамелька Океан", price: "2 375", unit: "кг", stock: 10, category: "Морепродукты", color: "#1e3a5f", image: "fish-caramel" },
  { id: 21, name: "Плавник кальмара с/в", price: "3 162", unit: "кг", stock: 5, category: "Морепродукты", color: "#1e3a5f", image: "squid-rings" },
  { id: 22, name: "Щупальца кальмара г/к", price: "2 200", unit: "кг", stock: 21, category: "Морепродукты", color: "#1e3a5f", image: "squid-tentacles" },
  { id: 23, name: "Щупальца кальмара кунжут", price: "2 275", unit: "кг", stock: 6, category: "Морепродукты", color: "#1e3a5f", image: "squid-tentacles" },
  { id: 24, name: "Щупальца кальмара с/в", price: "4 645", unit: "кг", stock: 6, category: "Морепродукты", color: "#1e3a5f", image: "squid-tentacles" },
  { id: 25, name: "Анчоус", price: "924", unit: "кг", stock: 15, category: "Закуски", color: "#7c2d12", image: "anchovy" },
  { id: 26, name: "Горбуша паутинка", price: "945", unit: "кг", stock: 4, category: "Закуски", color: "#7c2d12", image: "salmon-jerky" },
  { id: 27, name: "Горбуша паутинка с перцем", price: "945", unit: "кг", stock: 8, category: "Закуски", color: "#7c2d12", image: "salmon-jerky" },
  { id: 28, name: "Желтый полосатик", price: "1 232", unit: "кг", stock: 22, category: "Закуски", color: "#7c2d12", image: "yellowtail" },
  { id: 29, name: "Икра минтая вяленая", price: "2 350", unit: "кг", stock: 10, category: "Закуски", color: "#7c2d12", image: "fish-roe" },
  { id: 30, name: "Икра сельди вяленая", price: "3 145", unit: "кг", stock: 10, category: "Закуски", color: "#7c2d12", image: "fish-roe" },
  { id: 31, name: "Кальмар вкус Красной икры", price: "1 515", unit: "кг", stock: 10, category: "Закуски", color: "#7c2d12", image: "squid-rings" },
  { id: 32, name: "Кальмар по шанхайски", price: "1 220", unit: "кг", stock: 11, category: "Закуски", color: "#7c2d12", image: "squid-rings" },
  { id: 33, name: "Камбала соломка Фишка", price: "1 500", unit: "кг", stock: 12, category: "Закуски", color: "#7c2d12", image: "fish-strips" },
  { id: 34, name: "Кольца кальмара", price: "1 600", unit: "кг", stock: 22, category: "Закуски", color: "#7c2d12", image: "squid-rings" },
  { id: 35, name: "Минтай филе с перцем", price: "1 275", unit: "кг", stock: 10, category: "Закуски", color: "#7c2d12", image: "fish-fillet" },
  { id: 36, name: "Минтай филе сушеный", price: "1 412", unit: "кг", stock: 1, category: "Закуски", color: "#7c2d12", image: "fish-fillet" },
  { id: 37, name: "Минтай филе Сушок", price: "1 125", unit: "кг", stock: 5, category: "Закуски", color: "#7c2d12", image: "fish-fillet" },
  { id: 38, name: "Мясо кальмара", price: "999", unit: "кг", stock: 4, category: "Закуски", color: "#7c2d12", image: "squid-rings" },
  { id: 39, name: "Осьминог", price: "1 725", unit: "кг", stock: 18, category: "Закуски", color: "#7c2d12", image: "octopus" },
  { id: 40, name: "Палочки Самурай", price: "935", unit: "кг", stock: 12, category: "Закуски", color: "#7c2d12", image: "fish-snack-misc" },
  { id: 41, name: "Песчанка", price: "1 207", unit: "кг", stock: 5, category: "Закуски", color: "#7c2d12", image: "yellowtail" },
  { id: 42, name: "Семга паутинка", price: "950", unit: "кг", stock: 15, category: "Закуски", color: "#7c2d12", image: "salmon-jerky" },
  { id: 43, name: "Стрелки кальмара красные перец", price: "1 770", unit: "кг", stock: 8, category: "Закуски", color: "#7c2d12", image: "squid-rings" },
  { id: 44, name: "Стрелки кальмара светлые", price: "1 825", unit: "кг", stock: 17, category: "Закуски", color: "#7c2d12", image: "squid-rings" },
  { id: 45, name: "Стружка кальмара", price: "1 595", unit: "кг", stock: 14, category: "Закуски", color: "#7c2d12", image: "squid-rings" },
  { id: 46, name: "Стружка кальмара вкус Краба", price: "1 495", unit: "кг", stock: 9, category: "Закуски", color: "#7c2d12", image: "squid-rings" },
  { id: 47, name: "Треска соломка без перца", price: "925", unit: "кг", stock: 3, category: "Закуски", color: "#7c2d12", image: "fish-strips" },
  { id: 48, name: "Тунец без перца", price: "1 050", unit: "кг", stock: 2, category: "Закуски", color: "#7c2d12", image: "tuna" },
  { id: 49, name: "Тунец кусочки с перцем", price: "1 040", unit: "кг", stock: 5, category: "Закуски", color: "#7c2d12", image: "tuna" },
  { id: 50, name: "Форель паутинка", price: "920", unit: "кг", stock: 13, category: "Закуски", color: "#7c2d12", image: "salmon-jerky" },
  { id: 51, name: "Хот-тейст", price: "1 735", unit: "кг", stock: 12, category: "Закуски", color: "#7c2d12", image: "fish-snack-misc" },
  { id: 52, name: "Щука соломка без перца", price: "985", unit: "кг", stock: 11, category: "Закуски", color: "#7c2d12", image: "fish-strips" },
  { id: 53, name: "Янтарная кусочки с перцем", price: "1 100", unit: "кг", stock: 26, category: "Закуски", color: "#7c2d12", image: "fish-snack-misc" },
  { id: 54, name: "Арахис глазури сыр+чеснок", price: "385", unit: "кг", stock: 5, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 55, name: "Арахис глазурь 4 сыра", price: "385", unit: "кг", stock: 5, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 56, name: "Арахис глазурь бекон", price: "385", unit: "кг", stock: 7, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 57, name: "Арахис глазурь васаби", price: "385", unit: "кг", stock: 7, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 58, name: "Арахис глазурь краб", price: "385", unit: "кг", stock: 6, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 59, name: "Арахис глазурь креветка", price: "385", unit: "кг", stock: 5, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 60, name: "Арахис глазурь микс", price: "385", unit: "кг", stock: 18, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 61, name: "Арахис глазурь морской ассорти", price: "385", unit: "кг", stock: 10, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 62, name: "Арахис глазурь сметана зелень", price: "385", unit: "кг", stock: 13, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 63, name: "Арахис глазурь сыр", price: "385", unit: "кг", stock: 1, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 64, name: "Арахис глазурь холодец хрен", price: "385", unit: "кг", stock: 12, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 65, name: "Арахис глазурь чили /кг", price: "385", unit: "кг", stock: 6, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 66, name: "Арахис глазурь шашлык", price: "385", unit: "кг", stock: 10, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 67, name: "Арахис глузурь устрица", price: "385", unit: "кг", stock: 2, category: "Орехи и сухари", color: "#5c4813", image: "glazed-peanuts" },
  { id: 68, name: "Арахис барбекю", price: "467", unit: "кг", stock: 15, category: "Орехи и сухари", color: "#5c4813", image: "roasted-peanuts" },
  { id: 69, name: "Арахис грибы со сметаной", price: "467", unit: "кг", stock: 2, category: "Орехи и сухари", color: "#5c4813", image: "roasted-peanuts" },
  { id: 70, name: "Арахис сметана зелень", price: "467", unit: "кг", stock: 9, category: "Орехи и сухари", color: "#5c4813", image: "roasted-peanuts" },
  { id: 71, name: "Арахис сыр", price: "467", unit: "кг", stock: 7, category: "Орехи и сухари", color: "#5c4813", image: "roasted-peanuts" },
  { id: 72, name: "Арахис четыре сыра", price: "467", unit: "кг", stock: 9, category: "Орехи и сухари", color: "#5c4813", image: "roasted-peanuts" },
  { id: 73, name: "Арахис шашлык", price: "467", unit: "кг", stock: 3, category: "Орехи и сухари", color: "#5c4813", image: "roasted-peanuts" },
  { id: 74, name: "Микс васаби крекер арахис", price: "563", unit: "кг", stock: 4, category: "Орехи и сухари", color: "#5c4813", image: "snack-mix" },
  { id: 75, name: "Микс сыра крекера и арахиса", price: "585", unit: "кг", stock: 5, category: "Орехи и сухари", color: "#5c4813", image: "snack-mix" },
  { id: 76, name: "Лавашик барбекю", price: "89", unit: "шт", stock: 3, category: "Орехи и сухари", color: "#5c4813", image: "lavash-chips" },
  { id: 77, name: "Лавашик ветчина сыр", price: "89", unit: "шт", stock: 5, category: "Орехи и сухари", color: "#5c4813", image: "lavash-chips" },
  { id: 78, name: "Лавашик жареные грибы", price: "89", unit: "шт", stock: 3, category: "Орехи и сухари", color: "#5c4813", image: "lavash-chips" },
  { id: 79, name: "Лавашик сало с горчицей", price: "89", unit: "шт", stock: 3, category: "Орехи и сухари", color: "#5c4813", image: "lavash-chips" },
  { id: 80, name: "Лавашик сметана зелень", price: "89", unit: "шт", stock: 4, category: "Орехи и сухари", color: "#5c4813", image: "lavash-chips" },
  { id: 81, name: "Лавашик сыр", price: "89", unit: "шт", stock: 5, category: "Орехи и сухари", color: "#5c4813", image: "lavash-chips" },
  { id: 82, name: "Лавашик холодец хрен", price: "89", unit: "шт", stock: 3, category: "Орехи и сухари", color: "#5c4813", image: "lavash-chips" },
  { id: 83, name: "Лавашик чеснок", price: "89", unit: "шт", stock: 3, category: "Орехи и сухари", color: "#5c4813", image: "lavash-chips" },
  { id: 84, name: "Рисовые крекеры", price: "680", unit: "кг", stock: 8, category: "Орехи и сухари", color: "#5c4813", image: "rice-crackers" },
  { id: 85, name: "Рисовые крекеры Васаби /кг", price: "720", unit: "кг", stock: 8, category: "Орехи и сухари", color: "#5c4813", image: "rice-crackers" },
  { id: 86, name: "Рисовые крекеры Креветка", price: "650", unit: "кг", stock: 1, category: "Орехи и сухари", color: "#5c4813", image: "rice-crackers" },
  { id: 87, name: "Рисовые крекеры Микс", price: "700", unit: "кг", stock: 8, category: "Орехи и сухари", color: "#5c4813", image: "rice-crackers" },
  { id: 88, name: "Рисовые крекеры Сыр /кг", price: "685", unit: "кг", stock: 8, category: "Орехи и сухари", color: "#5c4813", image: "rice-crackers" },
  { id: 89, name: "Сухари бородинские 1/10кг", price: "525", unit: "кг", stock: 50, category: "Орехи и сухари", color: "#5c4813", image: "bread-crackers" },
  { id: 90, name: "Сухари ветчина 1/12кг", price: "525", unit: "кг", stock: 15, category: "Орехи и сухари", color: "#5c4813", image: "bread-crackers" },
  { id: 91, name: "Сухари грибные 1/12кг", price: "530", unit: "кг", stock: 29, category: "Орехи и сухари", color: "#5c4813", image: "bread-crackers" },
  { id: 92, name: "Сухари домашние 1/12кг", price: "525", unit: "кг", stock: 86, category: "Орехи и сухари", color: "#5c4813", image: "bread-crackers" },
  { id: 93, name: "Сухари красная икра 1/12кг", price: "530", unit: "кг", stock: 15, category: "Орехи и сухари", color: "#5c4813", image: "bread-crackers" },
  { id: 94, name: "Сухари малосольный огурчик 1/12кг", price: "530", unit: "кг", stock: 16, category: "Орехи и сухари", color: "#5c4813", image: "bread-crackers" },
  { id: 95, name: "Сухари сырные 1/12кг", price: "530", unit: "кг", stock: 21, category: "Орехи и сухари", color: "#5c4813", image: "bread-crackers" },
  { id: 96, name: "Сухари холодец хрен 1/12кг", price: "530", unit: "кг", stock: 14, category: "Орехи и сухари", color: "#5c4813", image: "bread-crackers" },
  { id: 97, name: "Арахис ж/с голд", price: "445", unit: "кг", stock: 49, category: "Орехи и сухари", color: "#5c4813", image: "roasted-peanuts" },
  { id: 98, name: "Соя фри /кг", price: "195", unit: "кг", stock: 5, category: "Орехи и сухари", color: "#5c4813", image: "soy-snack" },
  { id: 99, name: "Фисташка в/с", price: "1 325", unit: "кг", stock: 11, category: "Орехи и сухари", color: "#5c4813", image: "pistachios" },
  { id: 100, name: "Чипсы курица Корбан", price: "1 850", unit: "кг", stock: 6, category: "Мясо вяленое", color: "#6b1c1c", image: "chicken-jerky" },
  { id: 101, name: "Чипсы курицы круглые Корбан", price: "1 850", unit: "кг", stock: 8, category: "Мясо вяленое", color: "#6b1c1c", image: "chicken-jerky" },
  { id: 102, name: "Чипсы свинина Корбан", price: "2 355", unit: "кг", stock: 2, category: "Мясо вяленое", color: "#6b1c1c", image: "pork-jerky" },
  { id: 103, name: "Чипсы курицы ДВРК", price: "2 020", unit: "кг", stock: 9, category: "Мясо вяленое", color: "#6b1c1c", image: "chicken-jerky" },
  { id: 104, name: "Чипсы свинина ДВРК", price: "2 265", unit: "кг", stock: 10, category: "Мясо вяленое", color: "#6b1c1c", image: "pork-jerky" },
  { id: 105, name: "Чипсы из индейки Л", price: "1 260", unit: "кг", stock: 2, category: "Мясо вяленое", color: "#6b1c1c", image: "chicken-jerky" },
  { id: 106, name: "Чипсы из курицы Л", price: "1 219", unit: "кг", stock: 2, category: "Мясо вяленое", color: "#6b1c1c", image: "chicken-jerky" },
  { id: 107, name: "Чипсы свинины Л", price: "1 340", unit: "кг", stock: 1, category: "Мясо вяленое", color: "#6b1c1c", image: "pork-jerky" },
  { id: 108, name: "Брусочки из свинины с чесноком -", price: "1 430", unit: "кг", stock: 5, category: "Мясо вяленое", color: "#6b1c1c", image: "pork-jerky" },
  { id: 109, name: "Карпаччо из курицы", price: "1 175", unit: "кг", stock: 1, category: "Мясо вяленое", color: "#6b1c1c", image: "chicken-jerky" },
  { id: 110, name: "Колбаса Неаполитанские", price: "1 050", unit: "кг", stock: 7, category: "Мясо вяленое", color: "#6b1c1c", image: "sausages" },
  { id: 111, name: "Колбаса Охотнячьи", price: "1 050", unit: "кг", stock: 6, category: "Мясо вяленое", color: "#6b1c1c", image: "sausages" },
  { id: 112, name: "Колбаски Баварские", price: "1 590", unit: "кг", stock: 1, category: "Мясо вяленое", color: "#6b1c1c", image: "sausages" },
  { id: 113, name: "Колбаски Салями", price: "1 575", unit: "кг", stock: 6, category: "Мясо вяленое", color: "#6b1c1c", image: "sausages" },
  { id: 114, name: "Колбаски Чоризо", price: "1 600", unit: "кг", stock: 9, category: "Мясо вяленое", color: "#6b1c1c", image: "sausages" },
  { id: 115, name: "Соломка из свинины с чесноком", price: "1 690", unit: "кг", stock: 6, category: "Мясо вяленое", color: "#6b1c1c", image: "pork-jerky" },
  { id: 116, name: "Строганина из курицы -", price: "1 500", unit: "кг", stock: 1, category: "Мясо вяленое", color: "#6b1c1c", image: "chicken-jerky" },
  { id: 117, name: "Строганина из курицы 100гр", price: "160", unit: "шт", stock: 5, category: "Мясо вяленое", color: "#6b1c1c", image: "chicken-jerky" },
  { id: 118, name: "Чипсы из свинины классика -", price: "1 430", unit: "кг", stock: 7, category: "Мясо вяленое", color: "#6b1c1c", image: "pork-jerky" },
  { id: 119, name: "Чипсы из свинины с перцем", price: "1 600", unit: "кг", stock: 4, category: "Мясо вяленое", color: "#6b1c1c", image: "pork-jerky" },
  { id: 120, name: "Балаганчики из птицы", price: "2 035", unit: "кг", stock: 17, category: "Мясо вяленое", color: "#6b1c1c", image: "chicken-jerky" },
  { id: 121, name: "Колбаски из птицы БиФи", price: "1 940", unit: "кг", stock: 7, category: "Мясо вяленое", color: "#6b1c1c", image: "sausages" },
  { id: 122, name: "Малявки из птицы", price: "1 850", unit: "кг", stock: 12, category: "Мясо вяленое", color: "#6b1c1c", image: "chicken-jerky" },
  { id: 123, name: "Кальмар вкус Краба", price: "1 520", unit: "кг", stock: 10, category: "Сыр", color: "#6b5c10", image: "cheese-sticks" },
  { id: 124, name: "Сыр бочонок копченый", price: "1 395", unit: "кг", stock: 9, category: "Сыр", color: "#6b5c10", image: "cheese-strings" },
  { id: 125, name: "Сыр бочонок сливочный", price: "1 395", unit: "кг", stock: 1, category: "Сыр", color: "#6b5c10", image: "cheese-strings" },
  { id: 126, name: "Сыр бочонок сметана зелень", price: "1 395", unit: "кг", stock: 4, category: "Сыр", color: "#6b5c10", image: "cheese-strings" },
  { id: 127, name: "Сыр бочонок томат базилик", price: "1 395", unit: "кг", stock: 4, category: "Сыр", color: "#6b5c10", image: "cheese-strings" },
  { id: 128, name: "Сыр косичка копченая /кг", price: "675", unit: "кг", stock: 5, category: "Сыр", color: "#6b5c10", image: "cheese-strings" },
  { id: 129, name: "Сыр косичка сливочная /кг", price: "742", unit: "кг", stock: 2, category: "Сыр", color: "#6b5c10", image: "cheese-strings" },
  { id: 130, name: "Сыр паутинка копченая", price: "700", unit: "кг", stock: 24, category: "Сыр", color: "#6b5c10", image: "cheese-strings" },
  { id: 131, name: "Сыр паутинка пармезан /кг", price: "672", unit: "кг", stock: 2, category: "Сыр", color: "#6b5c10", image: "cheese-strings" },
  { id: 132, name: "Сыр паутинка сливочная", price: "700", unit: "кг", stock: 23, category: "Сыр", color: "#6b5c10", image: "cheese-strings" },
  { id: 133, name: "Сыр паутинка сметана зелень /кг", price: "672", unit: "кг", stock: 11, category: "Сыр", color: "#6b5c10", image: "cheese-strings" },
  { id: 134, name: "Сыр косичка копч Элазан 120гр", price: "162", unit: "шт", stock: 455, category: "Сыр", color: "#6b5c10", image: "cheese-strings" },
  { id: 135, name: "Сыр косичка слив Элазан 125гр", price: "162", unit: "шт", stock: 515, category: "Сыр", color: "#6b5c10", image: "cheese-strings" },
  { id: 136, name: "Спагетти жареные Крылышки терияки", price: "1 600", unit: "кг", stock: 7, category: "Сыр", color: "#6b5c10", image: "cheese-sticks" },
  { id: 137, name: "Спагетти жареный Классика", price: "1 600", unit: "кг", stock: 3, category: "Сыр", color: "#6b5c10", image: "cheese-sticks" },
  { id: 138, name: "Спагетти жареный Сметана с травами", price: "1 600", unit: "кг", stock: 6, category: "Сыр", color: "#6b5c10", image: "cheese-sticks" },
  { id: 139, name: "Спагетти жареный Шашлык", price: "1 600", unit: "кг", stock: 8, category: "Сыр", color: "#6b5c10", image: "cheese-sticks" },
  { id: 140, name: "Кальмар гигас г/к Вольт", price: "1 738", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "smoked-fish-misc" },
  { id: 141, name: "Кальмар тушка г/к Вольт", price: "1 595", unit: "кг", stock: 8, category: "Цех", color: "#1e293b", image: "smoked-fish-misc" },
  { id: 142, name: "Камбала х/к Вольт", price: "775", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "smoked-fish-misc" },
  { id: 143, name: "Креветка г/к Вольт", price: "2 500", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "shrimp" },
  { id: 144, name: "Ребра г/к Вольт", price: "924", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "smoked-fish-misc" },
  { id: 145, name: "Карамелька из кеты", price: "2 370", unit: "кг", stock: 4, category: "Цех", color: "#1e293b", image: "fish-caramel" },
  { id: 146, name: "Кета брюшки хк", price: "1 105", unit: "кг", stock: 3, category: "Цех", color: "#1e293b", image: "smoked-salmon" },
  { id: 147, name: "Кета полуспинка хк", price: "1 470", unit: "кг", stock: 10, category: "Цех", color: "#1e293b", image: "smoked-salmon" },
  { id: 148, name: "Соломка кеты", price: "2 340", unit: "кг", stock: 4, category: "Цех", color: "#1e293b", image: "fish-strips" },
  { id: 149, name: "Юкола кеты", price: "1 325", unit: "кг", stock: 11, category: "Цех", color: "#1e293b", image: "smoked-salmon" },
  { id: 150, name: "Икра минтая г/к", price: "1 695", unit: "кг", stock: 14, category: "Цех", color: "#1e293b", image: "fish-roe" },
  { id: 151, name: "Терпуг х/к", price: "875", unit: "кг", stock: 3, category: "Цех", color: "#1e293b", image: "smoked-fish-misc" },
  { id: 152, name: "Форели палочки хк", price: "2 750", unit: "кг", stock: 4, category: "Цех", color: "#1e293b", image: "smoked-salmon" },
  { id: 153, name: "Юкола горбуша", price: "1 555", unit: "кг", stock: 3, category: "Цех", color: "#1e293b", image: "smoked-salmon" },
  { id: 154, name: "Юкола форели", price: "2 800", unit: "кг", stock: 5, category: "Цех", color: "#1e293b", image: "smoked-salmon" },
  { id: 155, name: "Хе из сельди (2кг ведро) Океан", price: "1 025", unit: "шт", stock: 19, category: "Цех", color: "#1e293b", image: "fish-snack-misc" },
  { id: 156, name: "Хе из сельди (500 гр.банка)", price: "320", unit: "шт", stock: 5, category: "Цех", color: "#1e293b", image: "fish-snack-misc" },
  { id: 157, name: "Горбуша палочки ДальМ", price: "1 865", unit: "кг", stock: 2, category: "Цех", color: "#1e293b", image: "smoked-salmon" },
  { id: 158, name: "Кета палочки ДальМ", price: "2 757", unit: "кг", stock: 4, category: "Цех", color: "#1e293b", image: "smoked-salmon" },
  { id: 159, name: "Набор к пиву Палтус", price: "1 050", unit: "кг", stock: 5, category: "Цех", color: "#1e293b", image: "fish-snack-misc" },
  { id: 160, name: "Форель карамелька", price: "2 540", unit: "кг", stock: 3, category: "Цех", color: "#1e293b", image: "fish-caramel" },
  { id: 161, name: "Нерка филе с/с в/у Трим", price: "1 860", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "fish-fillet" },
  { id: 162, name: "Филе форели с травами", price: "2 630", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "fish-fillet" },
  { id: 163, name: "Икра нерки", price: "7 400", unit: "кг", stock: 20, category: "Икра", color: "#991b1b", image: "red-caviar" },
];

const categories = ["Все", "Морепродукты", "Закуски", "Орехи и сухари", "Мясо вяленое", "Сыр", "Цех", "Икра"];

type Product = (typeof products)[number];

/* ─── Компонент каталога ──────────────────────────────────────── */

export default function Catalog() {
  const { cart, setQty, view } = useCart();
  const [filter, setFilter] = useState("Все");
  const [selected, setSelected] = useState<Product | null>(null);
  const [nextSectionIdx, setNextSectionIdx] = useState<number | null>(1);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const showSections = filter === "Все" && !searchActive;
  const searchLower = searchQuery.toLowerCase();
  const filtered = searchActive
    ? products.filter((p) => p.name.toLowerCase().includes(searchLower))
    : filter === "Все" ? products : products.filter((p) => p.category === filter);

  /* Группировка по категориям для секционного вида */
  const grouped = categories.slice(1).map(cat => ({
    name: cat,
    items: products.filter(p => p.category === cat)
  })).filter(g => g.items.length > 0);

  /* Скролл: уменьшение шапки + отслеживание секций */
  useEffect(() => {
    const onScroll = () => {
      document.body.classList.toggle('scrolled', window.scrollY > 10);
      if (!showSections) { setNextSectionIdx(null); return; }
      let current = 0;
      for (let i = 0; i < sectionRefs.current.length; i++) {
        const el = sectionRefs.current[i];
        if (el && el.getBoundingClientRect().top <= 50) current = i;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 60;
      setNextSectionIdx(!atBottom && current + 1 < grouped.length ? current + 1 : null);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [showSections, grouped.length]);

  const scrollToSection = (idx: number) => {
    if (idx < 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const el = sectionRefs.current[idx];
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 41, behavior: 'smooth' });
  };

  /* Рендер карточки товара */
  const renderCard = (p: Product) => (
    <article
      key={p.id}
      className="card"
      onClick={() => setSelected(p)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setSelected(p)}
    >
      <div className="card-img">
        <picture>
          <source srcSet={`/images/products/thumb/${p.image}.webp`} type="image/webp" />
          <img src={`/images/products/fallback/${p.image}.jpg`} alt={p.name} width={72} height={72} loading="lazy" decoding="async" />
        </picture>
        {p.stock <= 5 && <span className="card-badge">Мало</span>}
      </div>
      <div className="card-body">
        <div className="card-title">{p.name}</div>
        <div className="card-row">
          <span className="card-price">{p.price} ₽</span>
          <span className="card-unit">/ {p.unit}</span>
          <div className="qty">
            <button className="qty-btn" onClick={(e) => { e.stopPropagation(); setQty(p.id, -1); }}>−</button>
            <span className="qty-val">{cart[p.id] || 0}</span>
            <button className="qty-btn" onClick={(e) => { e.stopPropagation(); setQty(p.id, +1); }}>+</button>
          </div>
        </div>
      </div>
    </article>
  );

  /* Акционные позиции (помечены «А» в прайсе) */
  const promoNames = [
    "Щупальца кальмара с/в",
    "Зубатка вяленая 23+",
    "Фисташка в/с",
    "Сыр косичка слив Элазан 125гр",
    "Юкола форели",
    "Минтай филе сушеный",
    "Кета полуспинка хк",
  ];
  const promoItems = promoNames.map(n => products.find(p => p.name === n)).filter(Boolean) as Product[];

  /* ── Корзина ── */
  if (view === "cart" || view === "thanks") {
    return (
      <div className="container">
        <CartView products={products} />
      </div>
    );
  }

  return (
    <div className="container">

      {/* ── Фильтры / Поиск ── */}
      {searchActive ? (
        <div className="search-bar">
          <input
            ref={searchRef}
            className="search-input"
            type="text"
            placeholder="Название товара..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button className="search-close" onClick={() => { setSearchActive(false); setSearchQuery(""); }}>✕</button>
        </div>
      ) : (
        <section className="filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip${filter === cat ? " active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
          <button className="chip chip-search" onClick={() => { setSearchActive(true); setTimeout(() => searchRef.current?.focus(), 0); }}>
            🔍 Поиск
          </button>
        </section>
      )}

      {/* ── Каталог: секции или плоская сетка ── */}
      {showSections && promoItems.length > 0 && (
        <div className="section-group">
          <div className="section-bar section-bar-promo">Акция</div>
          <section className="grid">{promoItems.map(renderCard)}</section>
        </div>
      )}
      {showSections ? (
        grouped.map((group, gi) => (
          <div key={group.name} className="section-group">
            <div
              className="section-bar"
              ref={el => { sectionRefs.current[gi] = el as HTMLDivElement; }}
              onClick={() => scrollToSection(gi - 1)}
            >
              {group.name}
            </div>
            <section className="grid">{group.items.map(renderCard)}</section>
          </div>
        ))
      ) : (
        <section className="grid">{filtered.map(renderCard)}</section>
      )}

      {/* ── Полоска следующего раздела (прибита к низу) ── */}
      {showSections && nextSectionIdx !== null && (
        <div className="section-next" onClick={() => scrollToSection(nextSectionIdx)}>
          ↓ {grouped[nextSectionIdx].name} ↓
        </div>
      )}

      {/* ── Модалка детальной карточки ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Закрыть">×</button>
            <div className="modal-img">
              <picture>
                <source srcSet={`/images/products/full/${selected.image}.webp`} type="image/webp" />
                <img
                  src={`/images/products/fallback/${selected.image}.jpg`}
                  alt={selected.name}
                  width={400}
                  height={400}
                />
              </picture>
            </div>
            <div className="modal-body">
              <h2 className="modal-title">{selected.name}{selected.stock <= 5 && <span className="modal-stock-low">Мало</span>}</h2>
              <p className="modal-desc">{'desc' in selected && selected.desc ? selected.desc : `${selected.category}. Опт, доставка по Хабаровску и ДВ.`}</p>
              <div className="modal-bottom">
                <span className="modal-price-val">{selected.price} ₽<span className="modal-price-unit">/{selected.unit}</span></span>
                <div className="modal-qty">
                  <button className="qty-btn" onClick={() => setQty(selected.id, -1)}>−</button>
                  <span className="qty-val">{cart[selected.id] || 0}</span>
                  <button className="qty-btn" onClick={() => setQty(selected.id, +1)}>+</button>
                </div>
                <button className="btn btn-ok" onClick={() => setSelected(null)}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
