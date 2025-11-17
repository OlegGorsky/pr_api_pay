# Quick Start Guide

## Вариант 1: Docker (рекомендуется)

### 1. Запуск с Docker Compose

```bash
cd prodamus-api-wrapper
docker-compose up -d
```

### 2. Проверка статуса

```bash
docker-compose ps
docker-compose logs -f
```

Сервер запустится на `http://localhost:3001`

### Остановка

```bash
docker-compose down
```

**Подробнее о Docker**: См. [DOCKER.md](./DOCKER.md)

---

## Вариант 2: Локальный запуск

### 1. Установка зависимостей

```bash
cd prodamus-api-wrapper
npm install
```

### 2. Запуск сервера

```bash
# Режим разработки
npm run dev

# Или продакшн
npm start
```

Сервер запустится на `http://localhost:3001`

## 3. Тестирование API

### Деактивация подписки

```bash
curl -X POST http://localhost:3001/setActivity \
  -H "Content-Type: application/json" \
  -d '{
    "prodamusUrl": "https://smartunity.payform.ru",
    "secretKey": "your_secret_key",
    "subscription": "2428120",
    "phone": "+79119985268",
    "isActive": false
  }'
```

### Установка скидки 30%

```bash
curl -X POST http://localhost:3001/setSubscriptionDiscount \
  -H "Content-Type: application/json" \
  -d '{
    "prodamusUrl": "https://smartunity.payform.ru",
    "secretKey": "your_secret_key",
    "subscription": "2428120",
    "discount": 30
  }'
```

### Установка даты следующего платежа

```bash
curl -X POST http://localhost:3001/setSubscriptionPaymentDate \
  -H "Content-Type: application/json" \
  -d '{
    "prodamusUrl": "https://smartunity.payform.ru",
    "secretKey": "your_secret_key",
    "subscription": "2428120",
    "date": "2025-12-31 23:59",
    "phone": "+79119985268"
  }'
```

## 4. Проверка здоровья сервера

```bash
curl http://localhost:3001/health
```

## Готово!

Полная документация доступна в [README.md](./README.md)
