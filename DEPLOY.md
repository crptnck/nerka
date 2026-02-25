# Развёртывание nerka.pro

## Быстрый старт (локально)

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Продакшн-билд

```bash
npm run build
# Статика генерируется в out/
```

## Деплой на GitHub Pages

Деплой автоматический — push в `main` запускает GitHub Actions:

1. `.github/workflows/deploy.yml` делает `npm ci && npm run build`
2. Содержимое `out/` деплоится на GitHub Pages
3. Домен `nerka.pro` привязан через `public/CNAME`

### Привязка домена вручную

1. В DNS домена: A-записи на GitHub Pages IPs (185.199.108-111.153)
2. В репозитории Settings → Pages → Custom domain: `nerka.pro`
3. Файл `public/CNAME` содержит `nerka.pro`

## Обновление каталога

1. Обновить массив `products` в `app/page.tsx` (можно через `scripts/gen_page.py`)
2. Для новых фото-групп: положить оригинал в `public/images/products/raw/slug.jpg`
3. Запустить `python3 scripts/process_images.py` — сгенерирует 4 размера
4. Push в main → автодеплой

## Обновление фотографий

```bash
# Скачать новые фото с Wikimedia Commons
python3 scripts/fetch_images.py

# Перегенерировать все 4 размера из raw/
python3 scripts/process_images.py --force
```

## Требования

- Node.js 20+
- Python 3 + Pillow + requests (только для скриптов обработки фото)
