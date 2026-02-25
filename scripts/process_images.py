#!/usr/bin/env python3
"""
Генерация 4 размеров фотографий из raw/ оригиналов.

Структура (на каждый slug):
  micro/slug.webp     — ~1KB,  32×32   blur-placeholder (мгновенная загрузка)
  thumb/slug.webp     — ~5KB,  120×120 превью в списке
  full/slug.webp      — ~15KB, 400×400 детальная карточка
  fallback/slug.jpg   — ~20KB, 400×400 совместимость (iPhone 5, старые браузеры)

Запуск:
  python3 scripts/process_images.py          — обработать все
  python3 scripts/process_images.py --force  — перезаписать существующие
"""

import sys
from io import BytesIO
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("pip install Pillow")
    sys.exit(1)

# ─── Конфиг ─────────────────────────────────────────────────────
BASE = Path(__file__).resolve().parent.parent / "public" / "images" / "products"
RAW_DIR      = BASE / "raw"
MICRO_DIR    = BASE / "micro"      # 32×32 webp blur placeholder
THUMB_DIR    = BASE / "thumb"      # 120×120 webp
FULL_DIR     = BASE / "full"       # 400×400 webp
FALLBACK_DIR = BASE / "fallback"   # 400×400 jpeg

BG_COLOR = (10, 10, 10)  # #0a0a0a — цвет фона сайта

# Размер → (dir, extension, target_size, target_kb, format)
SIZES = {
    "micro":    (MICRO_DIR,    "webp", (32, 32),   1.5, "WEBP"),
    "thumb":    (THUMB_DIR,    "webp", (120, 120),  5,  "WEBP"),
    "full":     (FULL_DIR,     "webp", (400, 400), 15,  "WEBP"),
    "fallback": (FALLBACK_DIR, "jpg",  (400, 400), 25,  "JPEG"),
}

# ─── Обработка ──────────────────────────────────────────────────

def crop_center_square(img):
    """Обрезка до квадрата из центра"""
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def place_on_dark_bg(img, target_size):
    """Размещение на тёмном фоне, 85% площади, центрировано"""
    bg = Image.new("RGB", target_size, BG_COLOR)
    max_dim = int(min(target_size) * 0.85)
    resized = img.copy()
    resized.thumbnail((max_dim, max_dim), Image.LANCZOS)
    x = (target_size[0] - resized.width) // 2
    y = (target_size[1] - resized.height) // 2
    bg.paste(resized, (x, y))
    return bg


def save_optimized(img, path, target_kb, fmt, min_q=10, max_q=85):
    """Сохранение с подбором quality бинарным поиском"""
    lo, hi = min_q, max_q
    best_buf = None

    for _ in range(8):
        mid = (lo + hi) // 2
        buf = BytesIO()
        if fmt == "WEBP":
            img.save(buf, format="WEBP", quality=mid, method=4)
        else:
            img.save(buf, format="JPEG", quality=mid, optimize=True)
        size_kb = buf.tell() / 1024

        if size_kb <= target_kb:
            best_buf = buf.getvalue()
            lo = mid + 1
        else:
            hi = mid - 1

    if best_buf is None:
        buf = BytesIO()
        if fmt == "WEBP":
            img.save(buf, format="WEBP", quality=min_q, method=6)
        else:
            img.save(buf, format="JPEG", quality=min_q, optimize=True)
        best_buf = buf.getvalue()

    with open(path, "wb") as f:
        f.write(best_buf)
    return len(best_buf) / 1024


def process_one(raw_path, force=False):
    """Обработка одного raw-файла → 4 размера"""
    slug = raw_path.stem
    img = Image.open(raw_path).convert("RGB")
    img_sq = crop_center_square(img)

    results = {}
    for size_name, (out_dir, ext, dimensions, target_kb, fmt) in SIZES.items():
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / f"{slug}.{ext}"

        if out_path.exists() and not force:
            results[size_name] = out_path.stat().st_size / 1024
            continue

        composed = place_on_dark_bg(img_sq, dimensions)
        kb = save_optimized(composed, out_path, target_kb, fmt)
        results[size_name] = kb

    return results


def main():
    force = "--force" in sys.argv

    raw_files = sorted(RAW_DIR.glob("*.jpg"))
    if not raw_files:
        print(f"⚠ Нет файлов в {RAW_DIR}")
        sys.exit(1)

    print(f"{'='*60}")
    print(f"🐟 Nerka.pro — Генерация 4 размеров из {len(raw_files)} оригиналов")
    print(f"   micro (32×32 webp) → thumb (120×120 webp) → full (400×400 webp) → fallback (400×400 jpg)")
    if force:
        print(f"   --force: перезаписываем всё")
    print(f"{'='*60}")

    for raw_path in raw_files:
        slug = raw_path.stem
        sizes = process_one(raw_path, force)
        parts = " | ".join(f"{k}:{v:.1f}KB" for k, v in sizes.items())
        print(f"  ✓ {slug:24s} → {parts}")

    # Итого
    print(f"\n{'='*60}")
    for size_name, (out_dir, ext, *_) in SIZES.items():
        files = list(out_dir.glob(f"*.{ext}"))
        total = sum(f.stat().st_size for f in files)
        avg = total / len(files) if files else 0
        print(f"  {size_name:10s}: {len(files)} файлов, {total/1024:.0f}KB всего, {avg/1024:.1f}KB средн.")

    all_total = sum(
        sum(f.stat().st_size for f in d.glob(f"*.{ext}"))
        for _, (d, ext, *_) in SIZES.items()
    )
    print(f"  {'ИТОГО':10s}: {all_total/1024:.0f}KB")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
