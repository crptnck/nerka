#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  nerka.pro — Обработка фотографий товаров
#  Двойной клик → обработка всех фото из raw/ → деплой
# ═══════════════════════════════════════════════════════════

cd "$(dirname "$0")"
RAW="public/images/products/raw"

clear
echo "═══════════════════════════════════════════════════════"
echo "  🐟 nerka.pro — Обработка фотографий"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  📂 Папка для фото: $RAW"
echo "  📋 Справочник:     ФОТО_СПРАВКА.txt"
echo ""
echo "  Как пользоваться:"
echo "  1. Открой ФОТО_СПРАВКА.txt — найди нужный slug"
echo "  2. Назови файл как slug (напр. dried-whole-fish.jpg)"
echo "  3. Положи в папку $RAW"
echo "  4. Запусти этот файл двойным кликом"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# Открываем папку raw/ в Finder
open "$RAW"

# Считаем файлы
COUNT=$(find "$RAW" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.heic" \) | wc -l | tr -d ' ')
echo "  📷 Файлов в raw/: $COUNT"
echo ""

if [ "$COUNT" -eq 0 ]; then
    echo "  ⚠ Папка raw/ пуста. Положи фото и запусти снова."
    echo ""
    read -p "  Нажми Enter чтобы закрыть..."
    exit 0
fi

# Проверяем Python и Pillow
if ! command -v python3 &> /dev/null; then
    echo "  ❌ Python3 не найден. Установи: brew install python3"
    read -p "  Нажми Enter чтобы закрыть..."
    exit 1
fi

python3 -c "from PIL import Image" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "  📦 Устанавливаю Pillow..."
    pip3 install Pillow --quiet
fi

# Обрабатываем
echo "  🔄 Обработка..."
echo ""
python3 scripts/process_images.py --force
echo ""

# Спрашиваем про деплой
echo "═══════════════════════════════════════════════════════"
read -p "  Закоммитить и задеплоить? (y/n): " DEPLOY

if [ "$DEPLOY" = "y" ] || [ "$DEPLOY" = "Y" ] || [ "$DEPLOY" = "д" ] || [ "$DEPLOY" = "Д" ]; then
    git add public/images/
    git commit -m "images: update product photos

Co-Authored-By: Oz <oz-agent@warp.dev>"
    git push origin main
    echo ""
    echo "  ✅ Задеплоено!"
else
    echo "  ℹ Фото обработаны локально. Коммит не сделан."
fi

echo ""
read -p "  Нажми Enter чтобы закрыть..."
