#!/bin/bash
set -euo pipefail

# ── Конфигурация ──
REMOTE_USER="cz188942"
REMOTE_HOST="vh440.timeweb.ru"
REMOTE_PATH="~/nerka/public_html/"

echo "▸ Сборка..."
npm run build

echo "▸ Деплой на $REMOTE_HOST..."
rsync -avz --delete \
  --exclude='.DS_Store' \
  out/ "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

echo "✓ Готово! https://nerka.pro"
