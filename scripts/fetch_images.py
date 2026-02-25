#!/usr/bin/env python3
"""
Скачивание и обработка фотографий продуктов для nerka.pro
Источники: Wikimedia Commons API (свободные изображения)
Обработка: PIL — crop, resize, чёрный фон, WebP сжатие
"""

import os
import sys
import json
import time
import requests
from io import BytesIO
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("pip install Pillow")
    sys.exit(1)

# ─── Директории ────────────────────────────────────────────────
BASE = Path(__file__).resolve().parent.parent / "public" / "images" / "products"
RAW_DIR = BASE / "raw"
THUMB_DIR = BASE / "thumb"
FULL_DIR = BASE / "full"
for d in (RAW_DIR, THUMB_DIR, FULL_DIR):
    d.mkdir(parents=True, exist_ok=True)

# ─── Цвет фона сайта ──────────────────────────────────────────
BG_COLOR = (10, 10, 10)  # #0a0a0a

# ─── Размеры ───────────────────────────────────────────────────
THUMB_SIZE = (120, 120)   # ~5KB цель
FULL_SIZE  = (400, 400)   # ~15KB цель

# ─── Маппинг фото-групп → поисковые запросы ────────────────────
# Каждая группа: slug → (запрос_en, запрос_fallback)
# Порядок: сначала Wikimedia API, потом фоллбэк-генерация
PHOTO_GROUPS = {
    # Рыба вяленая
    "dried-whole-fish":    ("dried salted fish",       "dried fish food"),
    "fish-strips":         ("dried fish strips sticks", "fish jerky strips"),
    "fish-fillet":         ("fish fillet raw",          "white fish fillet"),
    "fish-caramel":        ("glazed fish snack",        "candied fish"),
    "anchovy":             ("dried anchovy fish",       "anchovy"),
    "yellowtail":          ("dried yellow fish",        "small dried fish"),
    
    # Кальмар
    "squid-tentacles":     ("squid tentacles food",     "squid tentacles"),
    "squid-rings":         ("dried squid rings",        "squid rings snack"),
    
    # Лосось
    "salmon-jerky":        ("salmon jerky strips",      "dried salmon"),
    "smoked-salmon":       ("smoked salmon fillet",     "smoked salmon fish"),
    
    # Морепродукты прочие
    "fish-roe":            ("fish roe caviar",          "fish roe eggs"),
    "red-caviar":          ("red salmon caviar",        "salmon roe ikura"),
    "tuna":                ("dried tuna fish",          "tuna fillet"),
    "octopus":             ("dried octopus food",       "octopus tentacle"),
    "shrimp":              ("smoked shrimp prawn",      "cooked shrimp"),
    "smoked-fish-misc":    ("smoked fish food",         "hot smoked fish"),
    "fish-snack-misc":     ("fish snack beer",          "fish snack plate"),
    
    # Орехи и снеки
    "glazed-peanuts":      ("glazed coated peanuts",    "candy coated peanuts"),
    "roasted-peanuts":     ("roasted salted peanuts",   "peanuts"),
    "pistachios":          ("pistachio nuts",           "pistachios"),
    "snack-mix":           ("asian snack mix",          "trail mix snack"),
    "lavash-chips":        ("pita chips lavash",        "flatbread chips"),
    "rice-crackers":       ("rice crackers senbei",     "rice crackers"),
    "bread-crackers":      ("rye bread croutons",       "bread crackers"),
    "soy-snack":           ("fried soybeans snack",     "roasted soybeans"),
    
    # Мясо
    "chicken-jerky":       ("chicken jerky dried",      "chicken chips meat"),
    "pork-jerky":          ("pork jerky dried",         "dried pork meat"),
    "sausages":            ("dried sausage salami",     "mini salami sausages"),
    
    # Сыр
    "cheese-strings":      ("smoked string cheese",     "cheese strings braided"),
    "cheese-sticks":       ("fried cheese sticks",      "cheese sticks snack"),
}

# ─── Wikimedia Commons API ─────────────────────────────────────

def search_wikimedia(query, limit=5):
    """Поиск изображений в Wikimedia Commons по запросу"""
    api_url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": f"filetype:bitmap {query}",
        "gsrnamespace": "6",
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|size|mime",
        "iiurlwidth": "640",
        "format": "json",
    }
    headers = {"User-Agent": "NerkaProBot/1.0 (https://nerka.pro)"}
    
    try:
        resp = requests.get(api_url, params=params, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"  ⚠ Wikimedia API error: {e}")
        return []
    
    pages = data.get("query", {}).get("pages", {})
    results = []
    for page in pages.values():
        info = page.get("imageinfo", [{}])[0]
        mime = info.get("mime", "")
        if mime.startswith("image/") and "svg" not in mime:
            thumb_url = info.get("thumburl") or info.get("url")
            if thumb_url:
                results.append({
                    "url": thumb_url,
                    "width": info.get("thumbwidth", 0),
                    "height": info.get("thumbheight", 0),
                })
    return results


def download_image(url):
    """Скачивание изображения по URL"""
    headers = {"User-Agent": "NerkaProBot/1.0 (https://nerka.pro)"}
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        img = Image.open(BytesIO(resp.content))
        return img.convert("RGB")
    except Exception as e:
        print(f"  ⚠ Download error: {e}")
        return None


# ─── Обработка изображений ─────────────────────────────────────

def crop_center_square(img):
    """Обрезка до квадрата из центра"""
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def place_on_dark_bg(img, target_size):
    """
    Размещение изображения на тёмном фоне.
    Изображение занимает 85% площади, центрировано.
    """
    bg = Image.new("RGB", target_size, BG_COLOR)
    
    # Вписываем изображение в 85% площади фона
    max_w = int(target_size[0] * 0.85)
    max_h = int(target_size[1] * 0.85)
    
    img_resized = img.copy()
    img_resized.thumbnail((max_w, max_h), Image.LANCZOS)
    
    # Центрируем
    x = (target_size[0] - img_resized.width) // 2
    y = (target_size[1] - img_resized.height) // 2
    bg.paste(img_resized, (x, y))
    
    return bg


def generate_placeholder(slug, target_size):
    """
    Генерация плейсхолдер-изображения если фото не найдено.
    Тёмный фон + иконка + текст.
    """
    bg = Image.new("RGB", target_size, BG_COLOR)
    draw = ImageDraw.Draw(bg)
    
    # Иконка по категории
    icons = {
        "fish": "🐟", "squid": "🦑", "salmon": "🐟", "smoked": "🐟",
        "shrimp": "🦐", "octopus": "🐙", "caviar": "🔴", "roe": "🔴",
        "tuna": "🐟", "anchovy": "🐟", "yellowtail": "🐟",
        "peanut": "🥜", "pistachio": "🥜", "soy": "🫘",
        "cracker": "🍘", "lavash": "🍘", "bread": "🍞",
        "chicken": "🍗", "pork": "🥩", "sausage": "🌭",
        "cheese": "🧀", "snack": "🍿", "mix": "🍿",
    }
    
    icon = "🐟"
    for key, emoji in icons.items():
        if key in slug:
            icon = emoji
            break
    
    # Рисуем простой круг с цветом категории
    cx, cy = target_size[0] // 2, target_size[1] // 2
    r = int(min(target_size) * 0.3)
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(30, 30, 30))
    
    return bg


def save_webp(img, path, target_kb, min_quality=10, max_quality=85):
    """
    Сохранение в WebP с подбором quality для целевого размера.
    Бинарный поиск по quality.
    """
    lo, hi = min_quality, max_quality
    best_quality = lo
    best_buf = None
    
    for _ in range(8):  # до 8 итераций бинарного поиска
        mid = (lo + hi) // 2
        buf = BytesIO()
        img.save(buf, format="WEBP", quality=mid, method=4)
        size_kb = buf.tell() / 1024
        
        if size_kb <= target_kb:
            best_quality = mid
            best_buf = buf.getvalue()
            lo = mid + 1
        else:
            hi = mid - 1
    
    if best_buf is None:
        # Даже с минимальным quality слишком большой — сохраняем как есть
        buf = BytesIO()
        img.save(buf, format="WEBP", quality=min_quality, method=6)
        best_buf = buf.getvalue()
    
    with open(path, "wb") as f:
        f.write(best_buf)
    
    return len(best_buf) / 1024


# ─── Основной пайплайн ─────────────────────────────────────────

def process_group(slug, queries):
    """Обработка одной фото-группы: поиск → скачивание → обработка → сохранение"""
    thumb_path = THUMB_DIR / f"{slug}.webp"
    full_path  = FULL_DIR / f"{slug}.webp"
    
    # Пропускаем если уже есть
    if thumb_path.exists() and full_path.exists():
        print(f"  ✓ {slug} — уже есть, пропускаем")
        return True
    
    print(f"  🔍 {slug} — ищем...")
    
    img = None
    
    # Пробуем каждый запрос
    for query in queries:
        results = search_wikimedia(query, limit=5)
        
        for result in results:
            downloaded = download_image(result["url"])
            if downloaded:
                # Проверяем что изображение достаточно большое
                w, h = downloaded.size
                if w >= 200 and h >= 200:
                    img = downloaded
                    print(f"    ✅ Найдено: {result['url'][:80]}...")
                    break
        
        if img:
            break
        
        time.sleep(0.5)  # Пауза между запросами
    
    # Если ничего не нашли — генерируем плейсхолдер
    if img is None:
        print(f"    ⚠ Не найдено, генерируем плейсхолдер")
        placeholder_full = generate_placeholder(slug, FULL_SIZE)
        placeholder_thumb = generate_placeholder(slug, THUMB_SIZE)
        save_webp(placeholder_full, full_path, 15)
        save_webp(placeholder_thumb, thumb_path, 5)
        return False
    
    # Сохраняем оригинал
    raw_path = RAW_DIR / f"{slug}.jpg"
    img.save(raw_path, "JPEG", quality=90)
    
    # Кроп до квадрата
    img_sq = crop_center_square(img)
    
    # Full версия (400x400, до 15KB)
    full_img = place_on_dark_bg(img_sq, FULL_SIZE)
    full_kb = save_webp(full_img, full_path, 15)
    
    # Thumb версия (120x120, до 5KB) 
    thumb_img = place_on_dark_bg(img_sq, THUMB_SIZE)
    thumb_kb = save_webp(thumb_img, thumb_path, 5)
    
    print(f"    📦 full: {full_kb:.1f}KB, thumb: {thumb_kb:.1f}KB")
    return True


def main():
    print("=" * 60)
    print("🐟 Nerka.pro — Загрузка фотографий продуктов")
    print("=" * 60)
    print(f"Фото-групп: {len(PHOTO_GROUPS)}")
    print(f"Директория: {BASE}")
    print()
    
    ok = 0
    fail = 0
    
    for slug, queries in PHOTO_GROUPS.items():
        success = process_group(slug, queries)
        if success:
            ok += 1
        else:
            fail += 1
        time.sleep(1)  # Вежливая пауза между группами
    
    print()
    print("=" * 60)
    print(f"✅ Готово: {ok} фото загружено, {fail} плейсхолдеров")
    
    # Итоговый размер
    total_thumb = sum(f.stat().st_size for f in THUMB_DIR.glob("*.webp"))
    total_full = sum(f.stat().st_size for f in FULL_DIR.glob("*.webp"))
    print(f"📦 Размер thumb/: {total_thumb/1024:.0f}KB ({total_thumb/1024/len(PHOTO_GROUPS):.1f}KB avg)")
    print(f"📦 Размер full/:  {total_full/1024:.0f}KB ({total_full/1024/len(PHOTO_GROUPS):.1f}KB avg)")
    print(f"📦 Итого:         {(total_thumb+total_full)/1024:.0f}KB")
    print("=" * 60)


if __name__ == "__main__":
    main()
