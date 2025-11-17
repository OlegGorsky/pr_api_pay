# Docker Guide

Полное руководство по использованию Docker для Prodamus API Wrapper.

## Содержание

- [Быстрый старт](#быстрый-старт)
- [Docker Compose](#docker-compose)
- [Ручная сборка и запуск](#ручная-сборка-и-запуск)
- [Переменные окружения](#переменные-окружения)
- [Health Check](#health-check)
- [Логи](#логи)
- [Обновление контейнера](#обновление-контейнера)
- [Очистка](#очистка)
- [Продакшн развертывание](#продакшн-развертывание)

---

## Быстрый старт

### С Docker Compose (рекомендуется)

```bash
# 1. Сборка и запуск
docker-compose up -d

# 2. Проверка статуса
docker-compose ps

# 3. Просмотр логов
docker-compose logs -f

# 4. Тестирование API
curl http://localhost:3001/health
```

### Без Docker Compose

```bash
# 1. Сборка образа
docker build -t prodamus-api-wrapper .

# 2. Запуск контейнера
docker run -d --name prodamus-api-wrapper -p 3001:3001 prodamus-api-wrapper

# 3. Проверка статуса
docker ps | grep prodamus-api-wrapper

# 4. Просмотр логов
docker logs -f prodamus-api-wrapper
```

---

## Docker Compose

### Основные команды

```bash
# Запустить контейнер (в фоне)
docker-compose up -d

# Запустить с пересборкой
docker-compose up -d --build

# Остановить контейнер
docker-compose stop

# Остановить и удалить контейнер
docker-compose down

# Остановить, удалить контейнер и volumes
docker-compose down -v

# Просмотр логов
docker-compose logs -f

# Просмотр последних 100 строк логов
docker-compose logs --tail=100

# Перезапуск контейнера
docker-compose restart
```

### Конфигурация docker-compose.yml

Базовая конфигурация:

```yaml
version: '3.8'

services:
  prodamus-api-wrapper:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: prodamus-api-wrapper
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
```

С переменными из .env файла:

```yaml
version: '3.8'

services:
  prodamus-api-wrapper:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: prodamus-api-wrapper
    restart: unless-stopped
    ports:
      - "${PORT:-3001}:3001"
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - PORT=3001
    env_file:
      - .env
```

С монтированием логов:

```yaml
version: '3.8'

services:
  prodamus-api-wrapper:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: prodamus-api-wrapper
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - ./logs:/app/logs
```

---

## Ручная сборка и запуск

### Сборка образа

```bash
# Базовая сборка
docker build -t prodamus-api-wrapper .

# Сборка с тегом версии
docker build -t prodamus-api-wrapper:1.0.0 .

# Сборка с кастомным именем
docker build -t my-custom-name .

# Сборка без кеша
docker build --no-cache -t prodamus-api-wrapper .
```

### Запуск контейнера

```bash
# Простой запуск
docker run -d --name prodamus-api-wrapper -p 3001:3001 prodamus-api-wrapper

# Запуск с переменными окружения
docker run -d \
  --name prodamus-api-wrapper \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  prodamus-api-wrapper

# Запуск с монтированием логов
docker run -d \
  --name prodamus-api-wrapper \
  -p 3001:3001 \
  -v $(pwd)/logs:/app/logs \
  prodamus-api-wrapper

# Запуск с автоперезапуском
docker run -d \
  --name prodamus-api-wrapper \
  --restart unless-stopped \
  -p 3001:3001 \
  prodamus-api-wrapper
```

### Управление контейнером

```bash
# Просмотр запущенных контейнеров
docker ps

# Просмотр всех контейнеров (включая остановленные)
docker ps -a

# Остановка контейнера
docker stop prodamus-api-wrapper

# Запуск остановленного контейнера
docker start prodamus-api-wrapper

# Перезапуск контейнера
docker restart prodamus-api-wrapper

# Удаление контейнера (должен быть остановлен)
docker rm prodamus-api-wrapper

# Принудительное удаление запущенного контейнера
docker rm -f prodamus-api-wrapper

# Вход в контейнер (shell)
docker exec -it prodamus-api-wrapper sh
```

---

## Переменные окружения

### Доступные переменные

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `PORT` | Порт сервера | 3001 |
| `NODE_ENV` | Окружение Node.js | production |

### Передача через docker run

```bash
docker run -d \
  --name prodamus-api-wrapper \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  prodamus-api-wrapper
```

### Передача через .env файл

Создайте файл `.env`:

```env
NODE_ENV=production
PORT=3001
```

Запустите с --env-file:

```bash
docker run -d \
  --name prodamus-api-wrapper \
  -p 3001:3001 \
  --env-file .env \
  prodamus-api-wrapper
```

---

## Health Check

Docker контейнер включает встроенную проверку здоровья.

### Проверка статуса

```bash
# Простая проверка
docker inspect --format='{{.State.Health.Status}}' prodamus-api-wrapper

# Детальная информация
docker inspect --format='{{json .State.Health}}' prodamus-api-wrapper | jq

# Последний результат health check
docker inspect --format='{{json .State.Health.Log}}' prodamus-api-wrapper | jq
```

### Возможные статусы

- `starting` - Контейнер запускается, health check еще не выполнялся
- `healthy` - Health check успешен
- `unhealthy` - Health check провален

### Конфигурация Health Check

В Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

Параметры:
- `interval` - интервал проверки (30 секунд)
- `timeout` - таймаут запроса (3 секунды)
- `start-period` - период ожидания перед первой проверкой (5 секунд)
- `retries` - количество попыток перед пометкой как unhealthy (3)

---

## Логи

### Просмотр логов

```bash
# Все логи
docker logs prodamus-api-wrapper

# Последние 100 строк
docker logs --tail=100 prodamus-api-wrapper

# Логи в реальном времени
docker logs -f prodamus-api-wrapper

# Логи с временными метками
docker logs -t prodamus-api-wrapper

# Логи с определенного времени
docker logs --since="2025-11-17T10:00:00" prodamus-api-wrapper
```

### Экспорт логов

```bash
# Экспорт в файл
docker logs prodamus-api-wrapper > app.log

# Экспорт последних 1000 строк
docker logs --tail=1000 prodamus-api-wrapper > app-last-1000.log
```

---

## Обновление контейнера

### Обновление кода

1. Остановите и удалите старый контейнер:
```bash
docker-compose down
# или
docker stop prodamus-api-wrapper && docker rm prodamus-api-wrapper
```

2. Пересоберите образ:
```bash
docker-compose build --no-cache
# или
docker build --no-cache -t prodamus-api-wrapper .
```

3. Запустите новый контейнер:
```bash
docker-compose up -d
# или
docker run -d --name prodamus-api-wrapper -p 3001:3001 prodamus-api-wrapper
```

### Zero-downtime обновление

```bash
# 1. Соберите новый образ с новым тегом
docker build -t prodamus-api-wrapper:new .

# 2. Запустите новый контейнер на другом порту
docker run -d --name prodamus-api-wrapper-new -p 3002:3001 prodamus-api-wrapper:new

# 3. Проверьте работоспособность
curl http://localhost:3002/health

# 4. Переключите балансировщик/прокси на новый порт

# 5. Остановите старый контейнер
docker stop prodamus-api-wrapper && docker rm prodamus-api-wrapper

# 6. Переименуйте новый контейнер
docker rename prodamus-api-wrapper-new prodamus-api-wrapper
```

---

## Очистка

### Удаление контейнеров

```bash
# Остановить и удалить контейнер
docker-compose down

# Удалить все остановленные контейнеры
docker container prune -f

# Удалить конкретный контейнер
docker rm prodamus-api-wrapper
```

### Удаление образов

```bash
# Удалить конкретный образ
docker rmi prodamus-api-wrapper

# Удалить все неиспользуемые образы
docker image prune -a -f
```

### Полная очистка

```bash
# Удалить все неиспользуемые ресурсы (контейнеры, сети, образы, volumes)
docker system prune -a --volumes -f
```

---

## Продакшн развертывание

### Docker Swarm

```bash
# Инициализация swarm
docker swarm init

# Создание stack
docker stack deploy -c docker-compose.yml prodamus

# Просмотр сервисов
docker stack services prodamus

# Масштабирование
docker service scale prodamus_prodamus-api-wrapper=3

# Удаление stack
docker stack rm prodamus
```

### Рекомендации для продакшна

1. **Используйте специфичные теги версий:**
```bash
docker build -t prodamus-api-wrapper:1.0.0 .
```

2. **Настройте логирование:**
```yaml
services:
  prodamus-api-wrapper:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

3. **Ограничьте ресурсы:**
```yaml
services:
  prodamus-api-wrapper:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

4. **Используйте secrets для чувствительных данных:**
```yaml
services:
  prodamus-api-wrapper:
    secrets:
      - prodamus_secret
secrets:
  prodamus_secret:
    external: true
```

5. **Настройте автоперезапуск:**
```yaml
services:
  prodamus-api-wrapper:
    restart: unless-stopped
    # или для swarm:
    deploy:
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

---

## Отладка

### Проверка конфигурации

```bash
# Проверить информацию о контейнере
docker inspect prodamus-api-wrapper

# Проверить переменные окружения
docker exec prodamus-api-wrapper env

# Проверить процессы в контейнере
docker top prodamus-api-wrapper

# Проверить использование ресурсов
docker stats prodamus-api-wrapper
```

### Вход в контейнер

```bash
# Войти в shell
docker exec -it prodamus-api-wrapper sh

# Выполнить команду
docker exec prodamus-api-wrapper node -v

# Проверить структуру файлов
docker exec prodamus-api-wrapper ls -la /app
```

### Проблемы и решения

**Контейнер не запускается:**
```bash
# Проверьте логи
docker logs prodamus-api-wrapper

# Проверьте статус
docker ps -a | grep prodamus-api-wrapper
```

**Health check провален:**
```bash
# Проверьте health check логи
docker inspect --format='{{json .State.Health}}' prodamus-api-wrapper | jq

# Проверьте доступность endpoint
docker exec prodamus-api-wrapper wget -O- http://localhost:3001/health
```

**Порт уже занят:**
```bash
# Найдите процесс на порту 3001
lsof -i :3001
# или
netstat -tulpn | grep 3001

# Используйте другой порт
docker run -p 3002:3001 prodamus-api-wrapper
```

---

## Полезные команды

```bash
# Размер образа
docker images prodamus-api-wrapper

# История слоев образа
docker history prodamus-api-wrapper

# Экспорт образа
docker save prodamus-api-wrapper | gzip > prodamus-api-wrapper.tar.gz

# Импорт образа
docker load < prodamus-api-wrapper.tar.gz

# Копирование файлов из контейнера
docker cp prodamus-api-wrapper:/app/logs/app.log ./local-logs/

# Копирование файлов в контейнер
docker cp ./config.json prodamus-api-wrapper:/app/config.json
```

---

**Документация обновлена:** 2025-11-17
