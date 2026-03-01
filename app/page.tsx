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
  { id: 1, name: "Зубатка вяленая 23+", price: "2 250", unit: "кг", stock: 74, category: "Морепродукты", color: "#1e3a5f", image: "p1" },
  { id: 2, name: "Зубатка вяленая икряная", price: "3 360", unit: "кг", stock: 3, category: "Морепродукты", color: "#1e3a5f", image: "p2" },
  { id: 3, name: "Икра камбалы", price: "1 920", unit: "кг", stock: 4, category: "Морепродукты", color: "#1e3a5f", image: "p3", desc: "Натуральная икра камбалы дальневосточного вылова. Солёная, вяленая, готова к употреблению. Отлично подходит как закуска к пиву и для розничной перепродажи. Фасовка оптом от 1 кг. Срок хранения 6 мес." },
  { id: 4, name: "Камбала б/ш", price: "1 300", unit: "кг", stock: 72, category: "Морепродукты", color: "#1e3a5f", image: "p4" },
  { id: 5, name: "Камбала вяленая L", price: "1 080", unit: "кг", stock: 21, category: "Морепродукты", color: "#1e3a5f", image: "p5" },
  { id: 6, name: "Камбала вяленая M", price: "1 080", unit: "кг", stock: 11, category: "Морепродукты", color: "#1e3a5f", image: "p6" },
  { id: 7, name: "Камбала икряная", price: "1 980", unit: "кг", stock: 27, category: "Морепродукты", color: "#1e3a5f", image: "p7" },
  { id: 8, name: "Камбала карамелька", price: "2 100", unit: "кг", stock: 10, category: "Морепродукты", color: "#1e3a5f", image: "p8" },
  { id: 9, name: "Камбала карамелька Океан", price: "1 608", unit: "кг", stock: 6, category: "Морепродукты", color: "#1e3a5f", image: "p9" },
  { id: 10, name: "Камбала соломка", price: "2 040", unit: "кг", stock: 1, category: "Морепродукты", color: "#1e3a5f", image: "p10" },
  { id: 11, name: "Камбала соломка Океан", price: "1 944", unit: "кг", stock: 11, category: "Морепродукты", color: "#1e3a5f", image: "p11" },
  { id: 12, name: "Камбала филе", price: "2 160", unit: "кг", stock: 4, category: "Морепродукты", color: "#1e3a5f", image: "p12" },
  { id: 13, name: "Камбала филе на шкуре", price: "1 980", unit: "кг", stock: 12, category: "Морепродукты", color: "#1e3a5f", image: "p13" },
  { id: 14, name: "Корюшка вяленая", price: "2 160", unit: "кг", stock: 2, category: "Морепродукты", color: "#1e3a5f", image: "p14" },
  { id: 15, name: "Корюшка икряная", price: "3 600", unit: "кг", stock: 10, category: "Морепродукты", color: "#1e3a5f", image: "p15" },
  { id: 16, name: "Минтай в кунжуте ДВРК", price: "1 980", unit: "кг", stock: 13, category: "Морепродукты", color: "#1e3a5f", image: "p16" },
  { id: 17, name: "Минтай карамелька ДВРК", price: "1 980", unit: "кг", stock: 13, category: "Морепродукты", color: "#1e3a5f", image: "p17" },
  { id: 18, name: "Минтай филе полоски ДВРК", price: "1 980", unit: "кг", stock: 11, category: "Морепродукты", color: "#1e3a5f", image: "p18" },
  { id: 19, name: "Минтай филе х/к ДВРК", price: "1 356", unit: "кг", stock: 4, category: "Морепродукты", color: "#1e3a5f", image: "p19" },
  { id: 20, name: "Палтус карамелька Океан", price: "2 160", unit: "кг", stock: 10, category: "Морепродукты", color: "#1e3a5f", image: "p20" },
  { id: 21, name: "Плавник кальмара с/в", price: "3 000", unit: "кг", stock: 3, category: "Морепродукты", color: "#1e3a5f", image: "p21" },
  { id: 22, name: "Щупальца кальмара г/к", price: "2 100", unit: "кг", stock: 27, category: "Морепродукты", color: "#1e3a5f", image: "p22" },
  { id: 23, name: "Щупальца кальмара кунжут", price: "2 160", unit: "кг", stock: 5, category: "Морепродукты", color: "#1e3a5f", image: "p23" },
  { id: 24, name: "Щупальца кальмара с/в", price: "4 395", unit: "кг", stock: 10, category: "Морепродукты", color: "#1e3a5f", image: "p24" },
  { id: 25, name: "Анчоус", price: "744", unit: "кг", stock: 15, category: "Закуски", color: "#7c2d12", image: "p25" },
  { id: 26, name: "Горбуша паутинка", price: "888", unit: "кг", stock: 4, category: "Закуски", color: "#7c2d12", image: "p26" },
  { id: 27, name: "Горбуша паутинка с перцем", price: "852", unit: "кг", stock: 8, category: "Закуски", color: "#7c2d12", image: "p27" },
  { id: 28, name: "Желтый полосатик", price: "984", unit: "кг", stock: 21, category: "Закуски", color: "#7c2d12", image: "p28" },
  { id: 29, name: "Икра минтая вяленая", price: "1 764", unit: "кг", stock: 10, category: "Закуски", color: "#7c2d12", image: "p29" },
  { id: 30, name: "Икра сельди вяленая", price: "2 709", unit: "кг", stock: 10, category: "Закуски", color: "#7c2d12", image: "p30" },
  { id: 31, name: "Кальмар вкус Красной икры", price: "1 440", unit: "кг", stock: 9, category: "Закуски", color: "#7c2d12", image: "p31" },
  { id: 32, name: "Кальмар по шанхайски", price: "1 152", unit: "кг", stock: 11, category: "Закуски", color: "#7c2d12", image: "p32" },
  { id: 33, name: "Камбала соломка Фишка", price: "1 440", unit: "кг", stock: 12, category: "Закуски", color: "#7c2d12", image: "p33" },
  { id: 34, name: "Кольца кальмара", price: "1 380", unit: "кг", stock: 22, category: "Закуски", color: "#7c2d12", image: "p34" },
  { id: 35, name: "Минтай филе с перцем", price: "1 032", unit: "кг", stock: 8, category: "Закуски", color: "#7c2d12", image: "p35" },
  { id: 36, name: "Минтай филе сушеный", price: "1 412", unit: "кг", stock: 1, category: "Закуски", color: "#7c2d12", image: "p36" },
  { id: 37, name: "Минтай филе Сушок", price: "1 074", unit: "кг", stock: 5, category: "Закуски", color: "#7c2d12", image: "p37" },
  { id: 38, name: "Мясо кальмара", price: "1 116", unit: "кг", stock: 4, category: "Закуски", color: "#7c2d12", image: "p38" },
  { id: 39, name: "Осьминог", price: "1 620", unit: "кг", stock: 15, category: "Закуски", color: "#7c2d12", image: "p39" },
  { id: 40, name: "Палочки Самурай", price: "876", unit: "кг", stock: 12, category: "Закуски", color: "#7c2d12", image: "p40" },
  { id: 41, name: "Песчанка", price: "1 259", unit: "кг", stock: 5, category: "Закуски", color: "#7c2d12", image: "p41" },
  { id: 42, name: "Семга паутинка", price: "768", unit: "кг", stock: 15, category: "Закуски", color: "#7c2d12", image: "p42" },
  { id: 43, name: "Стрелки кальмара красные перец", price: "1 680", unit: "кг", stock: 8, category: "Закуски", color: "#7c2d12", image: "p43" },
  { id: 44, name: "Стрелки кальмара светлые", price: "1 659", unit: "кг", stock: 17, category: "Закуски", color: "#7c2d12", image: "p44" },
  { id: 45, name: "Стружка кальмара", price: "1 380", unit: "кг", stock: 14, category: "Закуски", color: "#7c2d12", image: "p45" },
  { id: 46, name: "Стружка кальмара вкус Краба", price: "1 440", unit: "кг", stock: 9, category: "Закуски", color: "#7c2d12", image: "p46" },
  { id: 47, name: "Треска соломка без перца", price: "925", unit: "кг", stock: 3, category: "Закуски", color: "#7c2d12", image: "p47" },
  { id: 48, name: "Тунец без перца", price: "996", unit: "кг", stock: 2, category: "Закуски", color: "#7c2d12", image: "p48" },
  { id: 49, name: "Тунец кусочки с перцем", price: "1 039", unit: "кг", stock: 5, category: "Закуски", color: "#7c2d12", image: "p49" },
  { id: 50, name: "Форель паутинка", price: "768", unit: "кг", stock: 13, category: "Закуски", color: "#7c2d12", image: "p50" },
  { id: 51, name: "Хот-тейст", price: "1 680", unit: "кг", stock: 12, category: "Закуски", color: "#7c2d12", image: "p51" },
  { id: 52, name: "Щука соломка без перца", price: "936", unit: "кг", stock: 11, category: "Закуски", color: "#7c2d12", image: "p52" },
  { id: 53, name: "Янтарная кусочки с перцем", price: "1 038", unit: "кг", stock: 26, category: "Закуски", color: "#7c2d12", image: "p53" },
  { id: 54, name: "Арахис глазури сыр+чеснок", price: "385", unit: "кг", stock: 5, category: "Орехи и сухари", color: "#5c4813", image: "p54" },
  { id: 55, name: "Арахис глазурь 4 сыра", price: "385", unit: "кг", stock: 3, category: "Орехи и сухари", color: "#5c4813", image: "p55" },
  { id: 56, name: "Арахис глазурь бекон", price: "385", unit: "кг", stock: 7, category: "Орехи и сухари", color: "#5c4813", image: "p56" },
  { id: 57, name: "Арахис глазурь васаби", price: "385", unit: "кг", stock: 5, category: "Орехи и сухари", color: "#5c4813", image: "p57" },
  { id: 58, name: "Арахис глазурь краб", price: "385", unit: "кг", stock: 6, category: "Орехи и сухари", color: "#5c4813", image: "p58" },
  { id: 59, name: "Арахис глазурь креветка", price: "385", unit: "кг", stock: 4, category: "Орехи и сухари", color: "#5c4813", image: "p59" },
  { id: 60, name: "Арахис глазурь микс", price: "385", unit: "кг", stock: 15, category: "Орехи и сухари", color: "#5c4813", image: "p60" },
  { id: 61, name: "Арахис глазурь морской ассорти", price: "385", unit: "кг", stock: 10, category: "Орехи и сухари", color: "#5c4813", image: "p61" },
  { id: 62, name: "Арахис глазурь сметана зелень", price: "385", unit: "кг", stock: 12, category: "Орехи и сухари", color: "#5c4813", image: "p62" },
  { id: 63, name: "Арахис глазурь сыр", price: "385", unit: "кг", stock: 1, category: "Орехи и сухари", color: "#5c4813", image: "p63" },
  { id: 64, name: "Арахис глазурь холодец хрен", price: "385", unit: "кг", stock: 12, category: "Орехи и сухари", color: "#5c4813", image: "p64" },
  { id: 65, name: "Арахис глазурь чили /кг", price: "385", unit: "кг", stock: 6, category: "Орехи и сухари", color: "#5c4813", image: "p65" },
  { id: 66, name: "Арахис глазурь шашлык", price: "385", unit: "кг", stock: 8, category: "Орехи и сухари", color: "#5c4813", image: "p66" },
  { id: 67, name: "Арахис глузурь устрица", price: "385", unit: "кг", stock: 2, category: "Орехи и сухари", color: "#5c4813", image: "p67" },
  { id: 68, name: "Арахис барбекю", price: "467", unit: "кг", stock: 15, category: "Орехи и сухари", color: "#5c4813", image: "p68" },
  { id: 69, name: "Арахис грибы со сметаной", price: "467", unit: "кг", stock: 4, category: "Орехи и сухари", color: "#5c4813", image: "p69" },
  { id: 70, name: "Арахис сметана зелень", price: "467", unit: "кг", stock: 7, category: "Орехи и сухари", color: "#5c4813", image: "p70" },
  { id: 71, name: "Арахис сыр", price: "467", unit: "кг", stock: 7, category: "Орехи и сухари", color: "#5c4813", image: "p71" },
  { id: 72, name: "Арахис четыре сыра", price: "467", unit: "кг", stock: 8, category: "Орехи и сухари", color: "#5c4813", image: "p72" },
  { id: 73, name: "Арахис шашлык", price: "467", unit: "кг", stock: 3, category: "Орехи и сухари", color: "#5c4813", image: "p73" },
  { id: 74, name: "Микс васаби крекер арахис", price: "540", unit: "кг", stock: 4, category: "Орехи и сухари", color: "#5c4813", image: "p74" },
  { id: 75, name: "Микс сыра крекера и арахиса", price: "585", unit: "кг", stock: 5, category: "Орехи и сухари", color: "#5c4813", image: "p75" },
  { id: 76, name: "Лавашик барбекю", price: "89", unit: "шт", stock: 3, category: "Орехи и сухари", color: "#5c4813", image: "p76" },
  { id: 77, name: "Лавашик ветчина сыр", price: "89", unit: "шт", stock: 74, category: "Орехи и сухари", color: "#5c4813", image: "p77" },
  { id: 78, name: "Лавашик жареные грибы", price: "89", unit: "шт", stock: 70, category: "Орехи и сухари", color: "#5c4813", image: "p78" },
  { id: 79, name: "Лавашик сало с горчицей", price: "89", unit: "шт", stock: 56, category: "Орехи и сухари", color: "#5c4813", image: "p79" },
  { id: 80, name: "Лавашик сметана зелень", price: "89", unit: "шт", stock: 4, category: "Орехи и сухари", color: "#5c4813", image: "p80" },
  { id: 81, name: "Лавашик сыр", price: "89", unit: "шт", stock: 5, category: "Орехи и сухари", color: "#5c4813", image: "p81" },
  { id: 82, name: "Лавашик холодец хрен", price: "89", unit: "шт", stock: 3, category: "Орехи и сухари", color: "#5c4813", image: "p82" },
  { id: 83, name: "Лавашик чеснок", price: "89", unit: "шт", stock: 3, category: "Орехи и сухари", color: "#5c4813", image: "p83" },
  { id: 84, name: "Рисовые крекеры", price: "660", unit: "кг", stock: 8, category: "Орехи и сухари", color: "#5c4813", image: "p84" },
  { id: 85, name: "Рисовые крекеры Васаби /кг", price: "700", unit: "кг", stock: 8, category: "Орехи и сухари", color: "#5c4813", image: "p85" },
  { id: 86, name: "Рисовые крекеры Креветка", price: "624", unit: "кг", stock: 1, category: "Орехи и сухари", color: "#5c4813", image: "p86" },
  { id: 87, name: "Рисовые крекеры Микс", price: "702", unit: "кг", stock: 8, category: "Орехи и сухари", color: "#5c4813", image: "p87" },
  { id: 88, name: "Рисовые крекеры Сыр /кг", price: "685", unit: "кг", stock: 8, category: "Орехи и сухари", color: "#5c4813", image: "p88" },
  { id: 89, name: "Сухари бородинские 1/10кг", price: "486", unit: "кг", stock: 45, category: "Орехи и сухари", color: "#5c4813", image: "p89" },
  { id: 90, name: "Сухари ветчина 1/12кг", price: "493", unit: "кг", stock: 14, category: "Орехи и сухари", color: "#5c4813", image: "p90" },
  { id: 91, name: "Сухари грибные 1/12кг", price: "493", unit: "кг", stock: 28, category: "Орехи и сухари", color: "#5c4813", image: "p91" },
  { id: 92, name: "Сухари домашние 1/12кг", price: "505", unit: "кг", stock: 78, category: "Орехи и сухари", color: "#5c4813", image: "p92" },
  { id: 93, name: "Сухари красная икра 1/12кг", price: "493", unit: "кг", stock: 12, category: "Орехи и сухари", color: "#5c4813", image: "p93" },
  { id: 94, name: "Сухари малосольный огурчик 1/12кг", price: "493", unit: "кг", stock: 16, category: "Орехи и сухари", color: "#5c4813", image: "p94" },
  { id: 95, name: "Сухари сырные 1/12кг", price: "493", unit: "кг", stock: 18, category: "Орехи и сухари", color: "#5c4813", image: "p95" },
  { id: 96, name: "Сухари холодец хрен 1/12кг", price: "493", unit: "кг", stock: 12, category: "Орехи и сухари", color: "#5c4813", image: "p96" },
  { id: 97, name: "Арахис ж/с голд", price: "445", unit: "кг", stock: 34, category: "Орехи и сухари", color: "#5c4813", image: "p97" },
  { id: 98, name: "Соя фри /кг", price: "195", unit: "кг", stock: 4, category: "Орехи и сухари", color: "#5c4813", image: "p98" },
  { id: 99, name: "Фисташка в/с", price: "1 260", unit: "кг", stock: 7, category: "Орехи и сухари", color: "#5c4813", image: "p99" },
  { id: 100, name: "Чипсы курица Корбан", price: "1 740", unit: "кг", stock: 7, category: "Мясо вяленое", color: "#6b1c1c", image: "p100" },
  { id: 101, name: "Чипсы курицы круглые Корбан", price: "1 660", unit: "кг", stock: 6, category: "Мясо вяленое", color: "#6b1c1c", image: "p101" },
  { id: 102, name: "Чипсы свинина Корбан", price: "2 220", unit: "кг", stock: 18, category: "Мясо вяленое", color: "#6b1c1c", image: "p102" },
  { id: 103, name: "Чипсы курицы ДВРК", price: "1 560", unit: "кг", stock: 8, category: "Мясо вяленое", color: "#6b1c1c", image: "p103" },
  { id: 104, name: "Чипсы свинина ДВРК", price: "2 100", unit: "кг", stock: 10, category: "Мясо вяленое", color: "#6b1c1c", image: "p104" },
  { id: 105, name: "Чипсы из индейки Л", price: "1 260", unit: "кг", stock: 2, category: "Мясо вяленое", color: "#6b1c1c", image: "p105" },
  { id: 106, name: "Чипсы из курицы Л", price: "1 219", unit: "кг", stock: 2, category: "Мясо вяленое", color: "#6b1c1c", image: "p106" },
  { id: 107, name: "Чипсы свинины Л", price: "1 340", unit: "кг", stock: 1, category: "Мясо вяленое", color: "#6b1c1c", image: "p107" },
  { id: 108, name: "Брусочки из свинины с чесноком -", price: "1 430", unit: "кг", stock: 5, category: "Мясо вяленое", color: "#6b1c1c", image: "p108" },
  { id: 109, name: "Карпаччо из курицы", price: "1 175", unit: "кг", stock: 1, category: "Мясо вяленое", color: "#6b1c1c", image: "p109" },
  { id: 110, name: "Колбаса Неаполитанские", price: "840", unit: "кг", stock: 7, category: "Мясо вяленое", color: "#6b1c1c", image: "p110" },
  { id: 111, name: "Колбаса Охотнячьи", price: "840", unit: "кг", stock: 5, category: "Мясо вяленое", color: "#6b1c1c", image: "p111" },
  { id: 112, name: "Колбаски Баварские", price: "1 590", unit: "кг", stock: 1, category: "Мясо вяленое", color: "#6b1c1c", image: "p112" },
  { id: 113, name: "Колбаски Салями", price: "1 500", unit: "кг", stock: 6, category: "Мясо вяленое", color: "#6b1c1c", image: "p113" },
  { id: 114, name: "Колбаски Чоризо", price: "1 500", unit: "кг", stock: 9, category: "Мясо вяленое", color: "#6b1c1c", image: "p114" },
  { id: 115, name: "Соломка из свинины с чесноком", price: "1 500", unit: "кг", stock: 6, category: "Мясо вяленое", color: "#6b1c1c", image: "p115" },
  { id: 116, name: "Строганина из курицы -", price: "1 500", unit: "кг", stock: 1, category: "Мясо вяленое", color: "#6b1c1c", image: "p116" },
  { id: 117, name: "Строганина из курицы 100гр", price: "150", unit: "шт", stock: 5, category: "Мясо вяленое", color: "#6b1c1c", image: "p117" },
  { id: 118, name: "Чипсы из свинины классика -", price: "1 430", unit: "кг", stock: 7, category: "Мясо вяленое", color: "#6b1c1c", image: "p118" },
  { id: 119, name: "Чипсы из свинины с перцем", price: "1 596", unit: "кг", stock: 4, category: "Мясо вяленое", color: "#6b1c1c", image: "p119" },
  { id: 120, name: "Балаганчики из птицы", price: "1 956", unit: "кг", stock: 17, category: "Мясо вяленое", color: "#6b1c1c", image: "p120" },
  { id: 121, name: "Колбаски из птицы БиФи", price: "1 872", unit: "кг", stock: 6, category: "Мясо вяленое", color: "#6b1c1c", image: "p121" },
  { id: 122, name: "Малявки из птицы", price: "1 860", unit: "кг", stock: 12, category: "Мясо вяленое", color: "#6b1c1c", image: "p122" },
  { id: 123, name: "Кальмар вкус Краба", price: "1 500", unit: "кг", stock: 10, category: "Сыр", color: "#6b5c10", image: "p123" },
  { id: 124, name: "Сыр бочонок копченый", price: "1 356", unit: "кг", stock: 8, category: "Сыр", color: "#6b5c10", image: "p124" },
  { id: 125, name: "Сыр бочонок сливочный", price: "1 395", unit: "кг", stock: 1, category: "Сыр", color: "#6b5c10", image: "p125" },
  { id: 126, name: "Сыр бочонок сметана зелень", price: "1 356", unit: "кг", stock: 4, category: "Сыр", color: "#6b5c10", image: "p126" },
  { id: 127, name: "Сыр бочонок томат базилик", price: "1 375", unit: "кг", stock: 4, category: "Сыр", color: "#6b5c10", image: "p127" },
  { id: 128, name: "Сыр косичка копченая /кг", price: "642", unit: "кг", stock: 4, category: "Сыр", color: "#6b5c10", image: "p128" },
  { id: 129, name: "Сыр косичка сливочная /кг", price: "642", unit: "кг", stock: 2, category: "Сыр", color: "#6b5c10", image: "p129" },
  { id: 130, name: "Сыр паутинка копченая", price: "648", unit: "кг", stock: 17, category: "Сыр", color: "#6b5c10", image: "p130" },
  { id: 131, name: "Сыр паутинка пармезан /кг", price: "648", unit: "кг", stock: 1, category: "Сыр", color: "#6b5c10", image: "p131" },
  { id: 132, name: "Сыр паутинка сливочная", price: "648", unit: "кг", stock: 13, category: "Сыр", color: "#6b5c10", image: "p132" },
  { id: 133, name: "Сыр паутинка сметана зелень /кг", price: "648", unit: "кг", stock: 9, category: "Сыр", color: "#6b5c10", image: "p133" },
  { id: 134, name: "Сыр косичка копч Элазан 120гр", price: "158", unit: "шт", stock: 425, category: "Сыр", color: "#6b5c10", image: "p134" },
  { id: 135, name: "Сыр косичка слив Элазан 125гр", price: "158", unit: "шт", stock: 385, category: "Сыр", color: "#6b5c10", image: "p135" },
  { id: 136, name: "Спагетти жареные Крылышки терияки", price: "1 500", unit: "кг", stock: 7, category: "Сыр", color: "#6b5c10", image: "p136" },
  { id: 137, name: "Спагетти жареный Классика", price: "1 500", unit: "кг", stock: 3, category: "Сыр", color: "#6b5c10", image: "p137" },
  { id: 138, name: "Спагетти жареный Сметана с травами", price: "1 500", unit: "кг", stock: 6, category: "Сыр", color: "#6b5c10", image: "p138" },
  { id: 139, name: "Спагетти жареный Шашлык", price: "1 500", unit: "кг", stock: 8, category: "Сыр", color: "#6b5c10", image: "p139" },
  { id: 140, name: "Кальмар гигас г/к Вольт", price: "1 738", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "p140" },
  { id: 141, name: "Кальмар тушка г/к Вольт", price: "1 104", unit: "кг", stock: 8, category: "Цех", color: "#1e293b", image: "p141" },
  { id: 142, name: "Камбала х/к Вольт", price: "756", unit: "кг", stock: 0, category: "Цех", color: "#1e293b", image: "p142" },
  { id: 143, name: "Креветка г/к Вольт", price: "2 400", unit: "кг", stock: 0, category: "Цех", color: "#1e293b", image: "p143" },
  { id: 144, name: "Ребра г/к Вольт", price: "924", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "p144" },
  { id: 145, name: "Карамелька из кеты", price: "2 350", unit: "кг", stock: 9, category: "Цех", color: "#1e293b", image: "p145" },
  { id: 146, name: "Кета брюшки хк", price: "1 078", unit: "кг", stock: 2, category: "Цех", color: "#1e293b", image: "p146" },
  { id: 147, name: "Кета полуспинка хк", price: "1 470", unit: "кг", stock: 10, category: "Цех", color: "#1e293b", image: "p147" },
  { id: 148, name: "Соломка кеты", price: "2 220", unit: "кг", stock: 4, category: "Цех", color: "#1e293b", image: "p148" },
  { id: 149, name: "Юкола кеты", price: "1 300", unit: "кг", stock: 5, category: "Цех", color: "#1e293b", image: "p149" },
  { id: 150, name: "Икра минтая г/к", price: "1 695", unit: "кг", stock: 14, category: "Цех", color: "#1e293b", image: "p150" },
  { id: 151, name: "Терпуг х/к", price: "885", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "p151" },
  { id: 152, name: "Форели палочки хк", price: "2 780", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "p152" },
  { id: 153, name: "Юкола горбуша", price: "1 515", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "p153" },
  { id: 154, name: "Юкола форели", price: "2 780", unit: "кг", stock: 3, category: "Цех", color: "#1e293b", image: "p154" },
  { id: 155, name: "Хе из сельди (2кг ведро) Океан", price: "975", unit: "шт", stock: 16, category: "Цех", color: "#1e293b", image: "p155" },
  { id: 156, name: "Хе из сельди (500 гр.банка)", price: "300", unit: "шт", stock: 5, category: "Цех", color: "#1e293b", image: "p156" },
  { id: 157, name: "Горбуша палочки ДальМ", price: "1 840", unit: "кг", stock: 6, category: "Цех", color: "#1e293b", image: "p157" },
  { id: 158, name: "Кета палочки ДальМ", price: "2 675", unit: "кг", stock: 4, category: "Цех", color: "#1e293b", image: "p158" },
  { id: 159, name: "Набор к пиву Палтус", price: "990", unit: "кг", stock: 5, category: "Цех", color: "#1e293b", image: "p159" },
  { id: 160, name: "Форель карамелька", price: "2 500", unit: "кг", stock: 3, category: "Цех", color: "#1e293b", image: "p160" },
  { id: 161, name: "Нерка филе с/с в/у Трим", price: "1 860", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "p161" },
  { id: 162, name: "Филе форели с травами", price: "2 630", unit: "кг", stock: 1, category: "Цех", color: "#1e293b", image: "p162" },
  { id: 163, name: "Икра нерки", price: "7 400", unit: "кг", stock: 20, category: "Икра", color: "#991b1b", image: "p163" },
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>&nbsp;Поиск
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
