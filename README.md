# Prodamus API Wrapper

Простая обертка API для управления подписками в платежной системе Prodamus. Предоставляет три основных метода для работы с подписками.

## Содержание

- [Установка](#установка)
- [Запуск](#запуск)
  - [Локальный запуск](#локальный-запуск)
  - [Docker](#docker)
- [API Endpoints](#api-endpoints)
  - [setActivity](#setactivity)
  - [setSubscriptionDiscount](#setsubscriptiondiscount)
  - [setSubscriptionPaymentDate](#setsubscriptionpaymentdate)
- [Примеры использования](#примеры-использования)
- [Формат подписи](#формат-подписи)
- [Обработка ошибок](#обработка-ошибок)

---

## Установка

```bash
cd prodamus-api-wrapper
npm install
```

## Конфигурация

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Отредактируйте `.env` при необходимости:
```env
PORT=3001
NODE_ENV=development
```

**Примечание:** Этот wrapper не требует фиксированных учетных данных Prodamus. URL и секретный ключ передаются динамически в каждом запросе.

## Запуск

### Локальный запуск

#### Режим разработки (с автоперезагрузкой):
```bash
npm run dev
```

#### Продакшн режим:
```bash
npm start
```

Сервер запустится на порту 3001 (по умолчанию).

---

### Docker

Проект полностью поддерживает Docker для изолированного и воспроизводимого развертывания.

#### Быстрый старт с Docker Compose

1. **Сборка и запуск контейнера:**
```bash
docker-compose up -d
```

2. **Просмотр логов:**
```bash
docker-compose logs -f
```

3. **Остановка контейнера:**
```bash
docker-compose down
```

#### Использование Docker напрямую

1. **Сборка образа:**
```bash
docker build -t prodamus-api-wrapper .
```

2. **Запуск контейнера:**
```bash
docker run -d \
  --name prodamus-api-wrapper \
  -p 3001:3001 \
  -e NODE_ENV=production \
  prodamus-api-wrapper
```

3. **Просмотр логов:**
```bash
docker logs -f prodamus-api-wrapper
```

4. **Остановка и удаление контейнера:**
```bash
docker stop prodamus-api-wrapper
docker rm prodamus-api-wrapper
```

#### Переменные окружения для Docker

Вы можете передать переменные окружения при запуске:

```bash
docker run -d \
  --name prodamus-api-wrapper \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  prodamus-api-wrapper
```

Или через docker-compose.yml:

```yaml
services:
  prodamus-api-wrapper:
    environment:
      - NODE_ENV=production
      - PORT=3001
```

#### Health Check

Docker контейнер включает встроенную проверку здоровья (health check):

```bash
# Проверить статус health check
docker inspect --format='{{.State.Health.Status}}' prodamus-api-wrapper

# Просмотреть последние результаты health check
docker inspect --format='{{json .State.Health}}' prodamus-api-wrapper | jq
```

#### Особенности Docker образа

- **Multi-stage build** - оптимизированный размер образа
- **Alpine Linux** - минимальный базовый образ
- **Non-root user** - повышенная безопасность
- **Dumb-init** - правильная обработка сигналов
- **Health check** - автоматическая проверка работоспособности
- **Минимальные слои** - быстрая сборка и развертывание

---

## API Endpoints

Все endpoints принимают JSON и возвращают JSON. Все параметры передаются без вложенности (flat structure).

### Общие параметры

Следующие параметры обязательны для всех endpoints:

| Параметр | Тип | Описание |
|----------|-----|----------|
| `prodamusUrl` | string | URL домена Prodamus (например: `"https://example.payform.ru"`) |
| `secretKey` | string | Секретный ключ для подписи запросов |
| `subscription` | string | ID подписки |

### Идентификаторы клиента

Все endpoints, требующие идентификацию клиента, поддерживают три типа идентификаторов:

- **`phone`** - Номер телефона в формате `+79001234567`
- **`email`** - Email адрес клиента
- **`profile`** - ID профиля клиента

**Важно:** Передайте только один идентификатор: `phone`, `email` или `profile`.

---

## setActivity

**Endpoint:** `POST /setActivity`

**Описание:** Активация или деактивация подписки

### Параметры запроса

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `prodamusUrl` | string | Да | URL Prodamus домена |
| `secretKey` | string | Да | Секретный ключ |
| `subscription` | string | Да | ID подписки |
| `phone` | string | Нет* | Телефон клиента (формат: +79001234567) |
| `email` | string | Нет* | Email клиента |
| `profile` | string | Нет* | ID профиля клиента |
| `isActive` | boolean | Да | `true` для активации, `false` для деактивации |

\* Обязателен один из параметров: `phone`, `email` или `profile`

### Пример запроса

```bash
curl -X POST http://localhost:3001/setActivity \
  -H "Content-Type: application/json" \
  -d '{
    "prodamusUrl": "https://example.payform.ru",
    "secretKey": "your_secret_key",
    "subscription": "123456",
    "phone": "+79001234567",
    "isActive": false
  }'
```

С использованием email:

```bash
curl -X POST http://localhost:3001/setActivity \
  -H "Content-Type: application/json" \
  -d '{
    "prodamusUrl": "https://example.payform.ru",
    "secretKey": "your_secret_key",
    "subscription": "123456",
    "email": "user@example.com",
    "isActive": true
  }'
```

С использованием profile:

```bash
curl -X POST http://localhost:3001/setActivity \
  -H "Content-Type: application/json" \
  -d '{
    "prodamusUrl": "https://example.payform.ru",
    "secretKey": "your_secret_key",
    "subscription": "123456",
    "profile": "user_profile_12345",
    "isActive": true
  }'
```

### Пример ответа (успех)

```json
{
  "success": true,
  "message": "Subscription deactivated successfully",
  "data": {
    "status": "ok",
    "subscription_id": "123456"
  },
  "request": {
    "subscription": "123456",
    "identifier": "+79001234567",
    "identifierType": "phone",
    "isActive": false
  }
}
```

### Пример ответа (ошибка)

```json
{
  "success": false,
  "error": "Missing required parameters",
  "missing": ["phone or email"],
  "example": {
    "prodamusUrl": "https://example.payform.ru",
    "secretKey": "your_secret_key",
    "subscription": "123456",
    "phone": "+79001234567",
    "email": "user@example.com",
    "isActive": false
  }
}
```

---

## setSubscriptionDiscount

**Endpoint:** `POST /setSubscriptionDiscount`

**Описание:** Установка скидки на будущие списания по подписке

### Параметры запроса

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `prodamusUrl` | string | Да | URL Prodamus домена |
| `secretKey` | string | Да | Секретный ключ |
| `subscription` | string | Да | ID подписки |
| `discount` | number | Да | Скидка в процентах (0-100) |

### Пример запроса

```bash
curl -X POST http://localhost:3001/setSubscriptionDiscount \
  -H "Content-Type: application/json" \
  -d '{
    "prodamusUrl": "https://example.payform.ru",
    "secretKey": "your_secret_key",
    "subscription": "123456",
    "discount": 25
  }'
```

### Пример ответа (успех)

```json
{
  "success": true,
  "message": "Subscription discount updated successfully",
  "data": {
    "status": "ok",
    "subscription_id": "123456",
    "discount": 25
  },
  "request": {
    "subscription": "123456",
    "discount": 25
  }
}
```

### Пример ответа (ошибка валидации)

```json
{
  "success": false,
  "error": "Discount must be between 0 and 100"
}
```

---

## setSubscriptionPaymentDate

**Endpoint:** `POST /setSubscriptionPaymentDate`

**Описание:** Установка даты следующего списания по подписке

### Параметры запроса

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `prodamusUrl` | string | Да | URL Prodamus домена |
| `secretKey` | string | Да | Секретный ключ |
| `subscription` | string | Да | ID подписки |
| `date` | string | Да | Дата следующего платежа (формат: `"YYYY-MM-DD HH:MM"`) |
| `phone` | string | Нет* | Телефон клиента (формат: +79001234567) |
| `email` | string | Нет* | Email клиента |
| `profile` | string | Нет* | ID профиля клиента |

\* Обязателен один из параметров: `phone`, `email` или `profile`

### Важно

- Дата должна быть в формате `YYYY-MM-DD HH:MM`
- Дата не может быть в прошлом
- Примеры валидных дат: `2025-12-31 23:59`, `2026-01-15 12:00`

### Пример запроса

```bash
curl -X POST http://localhost:3001/setSubscriptionPaymentDate \
  -H "Content-Type: application/json" \
  -d '{
    "prodamusUrl": "https://example.payform.ru",
    "secretKey": "your_secret_key",
    "subscription": "123456",
    "date": "2025-12-31 23:59",
    "phone": "+79001234567"
  }'
```

С использованием email:

```bash
curl -X POST http://localhost:3001/setSubscriptionPaymentDate \
  -H "Content-Type: application/json" \
  -d '{
    "prodamusUrl": "https://example.payform.ru",
    "secretKey": "your_secret_key",
    "subscription": "123456",
    "date": "2025-12-31 23:59",
    "email": "user@example.com"
  }'
```

С использованием profile:

```bash
curl -X POST http://localhost:3001/setSubscriptionPaymentDate \
  -H "Content-Type: application/json" \
  -d '{
    "prodamusUrl": "https://example.payform.ru",
    "secretKey": "your_secret_key",
    "subscription": "123456",
    "date": "2025-12-31 23:59",
    "profile": "user_profile_12345"
  }'
```

### Пример ответа (успех)

```json
{
  "success": true,
  "message": "Subscription payment date updated successfully",
  "data": {
    "status": "ok",
    "subscription_id": "123456",
    "next_payment_date": "2025-12-31 23:59"
  },
  "request": {
    "subscription": "123456",
    "newDate": "2025-12-31 23:59",
    "identifier": "+79001234567",
    "identifierType": "phone"
  }
}
```

### Пример ответа (ошибка формата даты)

```json
{
  "success": false,
  "error": "Date must be in YYYY-MM-DD HH:MM format",
  "example": "2025-12-31 23:59"
}
```

### Пример ответа (ошибка - дата в прошлом)

```json
{
  "success": false,
  "error": "Date cannot be in the past"
}
```

---

## Примеры использования

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Деактивация подписки
async function deactivateSubscription() {
  try {
    const response = await axios.post(`${API_URL}/setActivity`, {
      prodamusUrl: 'https://example.payform.ru',
      secretKey: 'your_secret_key',
      subscription: '123456',
      phone: '+79001234567',
      isActive: false
    });

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Установка скидки 30%
async function setDiscount() {
  try {
    const response = await axios.post(`${API_URL}/setSubscriptionDiscount`, {
      prodamusUrl: 'https://example.payform.ru',
      secretKey: 'your_secret_key',
      subscription: '123456',
      discount: 30
    });

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Установка даты следующего платежа
async function setPaymentDate() {
  try {
    const response = await axios.post(`${API_URL}/setSubscriptionPaymentDate`, {
      prodamusUrl: 'https://example.payform.ru',
      secretKey: 'your_secret_key',
      subscription: '123456',
      date: '2025-12-31 23:59',
      email: 'user@example.com'
    });

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

### Python

```python
import requests

API_URL = 'http://localhost:3001'

# Деактивация подписки
def deactivate_subscription():
    response = requests.post(f'{API_URL}/setActivity', json={
        'prodamusUrl': 'https://example.payform.ru',
        'secretKey': 'your_secret_key',
        'subscription': '123456',
        'phone': '+79001234567',
        'isActive': False
    })

    if response.ok:
        print('Success:', response.json())
    else:
        print('Error:', response.json())

# Установка скидки
def set_discount():
    response = requests.post(f'{API_URL}/setSubscriptionDiscount', json={
        'prodamusUrl': 'https://example.payform.ru',
        'secretKey': 'your_secret_key',
        'subscription': '123456',
        'discount': 30
    })

    if response.ok:
        print('Success:', response.json())
    else:
        print('Error:', response.json())

# Установка даты платежа
def set_payment_date():
    response = requests.post(f'{API_URL}/setSubscriptionPaymentDate', json={
        'prodamusUrl': 'https://example.payform.ru',
        'secretKey': 'your_secret_key',
        'subscription': '123456',
        'date': '2025-12-31 23:59',
        'email': 'user@example.com'
    })

    if response.ok:
        print('Success:', response.json())
    else:
        print('Error:', response.json())
```

### PHP

```php
<?php

$apiUrl = 'http://localhost:3001';

// Деактивация подписки
function deactivateSubscription() {
    global $apiUrl;

    $data = [
        'prodamusUrl' => 'https://example.payform.ru',
        'secretKey' => 'your_secret_key',
        'subscription' => '123456',
        'phone' => '+79001234567',
        'isActive' => false
    ];

    $ch = curl_init("$apiUrl/setActivity");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    curl_close($ch);

    echo $response;
}

// Установка скидки
function setDiscount() {
    global $apiUrl;

    $data = [
        'prodamusUrl' => 'https://example.payform.ru',
        'secretKey' => 'your_secret_key',
        'subscription' => '123456',
        'discount' => 30
    ];

    $ch = curl_init("$apiUrl/setSubscriptionDiscount");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    curl_close($ch);

    echo $response;
}

// Установка даты платежа
function setPaymentDate() {
    global $apiUrl;

    $data = [
        'prodamusUrl' => 'https://example.payform.ru',
        'secretKey' => 'your_secret_key',
        'subscription' => '123456',
        'date' => '2025-12-31 23:59',
        'email' => 'user@example.com'
    ];

    $ch = curl_init("$apiUrl/setSubscriptionPaymentDate");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    curl_close($ch);

    echo $response;
}
```

---

## Формат подписи

Все запросы к Prodamus API подписываются с использованием **HMAC SHA-256** по методу **PHP Hmac::create**:

### Алгоритм генерации подписи

1. **Конвертация значений в строки** - Все значения объекта конвертируются в строковый формат
2. **Сортировка ключей** - Ключи сортируются по алфавиту
3. **JSON кодирование** - Создается JSON строка без экранирования unicode
4. **HMAC SHA-256** - Генерируется HMAC подпись с использованием секретного ключа

### Пример генерации подписи

```javascript
const crypto = require('crypto');

const data = {
  subscription: "123456",
  active_user: "0",
  customer_phone: "+79001234567"
};

// Шаг 1: Конвертация в строки
const processedData = {
  subscription: "123456",
  active_user: "0",
  customer_phone: "+79001234567"
};

// Шаг 2: Сортировка ключей
const sortedData = {
  active_user: "0",
  customer_phone: "+79001234567",
  subscription: "123456"
};

// Шаг 3: JSON строка
const jsonString = '{"active_user":"0","customer_phone":"+79001234567","subscription":"123456"}';

// Шаг 4: HMAC SHA-256
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(jsonString, 'utf8')
  .digest('hex');
```

---

## Обработка ошибок

### Структура ответа при ошибке

Все ошибки возвращаются в едином формате:

```json
{
  "success": false,
  "error": "Error type",
  "details": "Detailed error message",
  "prodamusError": { /* Prodamus API error (если есть) */ }
}
```

### Типы ошибок

| HTTP Код | Тип ошибки | Описание |
|----------|------------|----------|
| 400 | Bad Request | Отсутствуют обязательные параметры или неверный формат |
| 404 | Not Found | Endpoint не найден |
| 500 | Internal Server Error | Ошибка сервера или API Prodamus |

### Примеры обработки ошибок

**Missing parameters:**
```json
{
  "success": false,
  "error": "Missing required parameters",
  "missing": ["prodamusUrl", "secretKey"]
}
```

**Invalid discount:**
```json
{
  "success": false,
  "error": "Discount must be between 0 and 100"
}
```

**Invalid date format:**
```json
{
  "success": false,
  "error": "Date must be in YYYY-MM-DD HH:MM format",
  "example": "2025-12-31 23:59"
}
```

**Date in the past:**
```json
{
  "success": false,
  "error": "Date cannot be in the past"
}
```

**Both phone and email provided:**
```json
{
  "success": false,
  "error": "Provide either phone or email, not both"
}
```

**Prodamus API error:**
```json
{
  "success": false,
  "error": "Failed to update subscription activity",
  "details": "Request failed with status code 401",
  "prodamusError": {
    "error": "Invalid signature"
  }
}
```

---

## Логирование

Сервер логирует:
- Все HTTP запросы (метод, URL, статус, время выполнения)
- Генерацию подписей (данные, JSON строка, подпись)
- Запросы к Prodamus API (URL, параметры)
- Ответы от Prodamus API
- Все ошибки с полным стектрейсом

Пример лога:
```
[2025-11-17T10:30:45.123Z] POST /setActivity - 200 - 245ms
[Signature] Data: { active_user: '0', customer_phone: '+79001234567', subscription: '123456' }
[Signature] JSON string: {"active_user":"0","customer_phone":"+79001234567","subscription":"123456"}
[Signature] Generated: a1b2c3d4e5f6...
[API Request] URL: https://example.payform.ru/rest/setActivity/
[API Response]: { status: 'ok', subscription_id: '123456' }
```

---

## Структура проекта

```
prodamus-api-wrapper/
├── src/
│   ├── server.js                 # Главный файл сервера
│   ├── routes/
│   │   └── api.js                # API endpoints (все 3 метода)
│   ├── services/
│   │   └── prodamus.js           # Сервис для работы с Prodamus API
│   └── middleware/
│       ├── logger.js             # Middleware логирования
│       └── errorHandler.js       # Middleware обработки ошибок
├── package.json                  # Зависимости проекта
├── .env.example                  # Пример файла окружения
├── .gitignore                    # Git ignore файл
└── README.md                     # Документация
```

---

## Безопасность

- **Helmet.js** - Защита от распространенных веб-уязвимостей
- **CORS** - Настроен для всех origins
- **HMAC подписи** - Все запросы к Prodamus подписываются
- **Валидация** - Строгая проверка всех входных параметров
- **Отсутствие хардкода** - Нет фиксированных секретных ключей в коде

---

## Системные endpoints

### GET /

Информация о сервере и доступных endpoints

**Ответ:**
```json
{
  "name": "Prodamus API Wrapper",
  "version": "1.0.0",
  "description": "Simple API wrapper for Prodamus subscription management",
  "status": "running",
  "timestamp": "2025-11-17T10:30:45.123Z",
  "endpoints": {
    "setActivity": {
      "method": "POST",
      "path": "/setActivity",
      "description": "Activate or deactivate subscription"
    },
    "setSubscriptionDiscount": {
      "method": "POST",
      "path": "/setSubscriptionDiscount",
      "description": "Set discount for future subscription payments"
    },
    "setSubscriptionPaymentDate": {
      "method": "POST",
      "path": "/setSubscriptionPaymentDate",
      "description": "Set next subscription payment date"
    }
  }
}
```

### GET /health

Health check endpoint

**Ответ:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-17T10:30:45.123Z",
  "uptime": 12345.67
}
```

---

## FAQ

### Почему только три метода?

Этот wrapper создан как упрощенная обертка для базовых операций с подписками Prodamus. Он фокусируется на трех наиболее используемых методах с простым и понятным интерфейсом. Для более сложных сценариев (замена карт, создание платежных ссылок, вебхуки) можно расширить функциональность.

### Нужно ли указывать фиксированный домен Prodamus?

Нет. Этот wrapper поддерживает динамическую передачу `prodamusUrl` и `secretKey` в каждом запросе, что позволяет работать с разными доменами Prodamus без изменения конфигурации.

### Можно ли передавать и phone, и email одновременно?

Нет. API требует передачи либо `phone`, либо `email`, но не обоих. Это сделано для четкой идентификации клиента.

### Что произойдет если передать дату в прошлом?

API вернет ошибку 400 с сообщением "Date cannot be in the past". Дата должна быть в будущем.

### Поддерживается ли другие идентификаторы кроме phone и email?

Текущая версия поддерживает только `phone` и `email` для упрощения API. Если вам нужны дополнительные идентификаторы (tg_user_id, vk_user_id, profile), вы можете легко расширить сервис `src/services/prodamus.js`, добавив соответствующие параметры по аналогии с существующими методами.

---

## Лицензия

MIT

---

**Версия:** 1.0.0
**Дата:** 2025-11-17
