# DroneDoc 2025 - Автоматизация Issues

Инструкция по использованию AI-CI для автоматической обработки issues из репозитория [unidel2035/dronedoc2025](https://github.com/unidel2035/dronedoc2025).

## Быстрый старт

### 1. Установка (только первый раз)

```bash
# Установить зависимости
npm install

# Установить браузер Playwright (только первый раз)
npx playwright install chromium

# Сделать скрипт исполняемым
chmod +x run-dronedoc.sh
```

### 2. Настройка GitHub токена (рекомендуется)

Создайте Personal Access Token на GitHub:
1. Откройте https://github.com/settings/tokens
2. Нажмите "Generate new token" → "Generate new token (classic)"
3. Выберите scope: `repo` (полный доступ к репозиториям)
4. Скопируйте токен

Установите токен в переменную окружения:

```bash
export GITHUB_TOKEN=your_token_here
```

Чтобы токен сохранялся между сессиями, добавьте в `~/.bashrc` или `~/.zshrc`:

```bash
echo 'export GITHUB_TOKEN=your_token_here' >> ~/.bashrc
source ~/.bashrc
```

### 3. Запуск автоматизации

**Простой способ (рекомендуется):**

```bash
./run-dronedoc.sh <номер_issue>
```

Примеры:
```bash
./run-dronedoc.sh 1    # Обработать issue #1
./run-dronedoc.sh 42   # Обработать issue #42
```

**Полный способ (с дополнительными опциями):**

```bash
npm run playwright -- --repo unidel2035/dronedoc2025 --issue <номер>
```

Примеры:
```bash
# С токеном в переменной окружения
npm run playwright -- --repo unidel2035/dronedoc2025 --issue 5

# С токеном в параметре
npm run playwright -- --repo unidel2035/dronedoc2025 --issue 5 --github-token YOUR_TOKEN

# В headless режиме (без видимого браузера)
npm run playwright -- --repo unidel2035/dronedoc2025 --issue 5 --headless
```

## Как это работает

1. **Получение issue**: Скрипт загружает данные issue через GitHub API
2. **Запуск браузера**: Открывается Chromium с сохранением сессии
3. **Переход на Claude Code**: Открывается https://claude.ai/code
4. **Авторизация**: При первом запуске нужно войти в Claude.ai вручную (сессия сохраняется)
5. **Вставка issue**: Автоматически вставляется URL, заголовок и описание issue
6. **Отправка задачи**: Автоматически отправляется задача Claude Code
7. **Мониторинг**: Скрипт ждет завершения обработки (до 30 минут)
8. **Создание PR**: Автоматически нажимается кнопка "Create PR"
9. **Готово**: Pull Request создан в репозитории!

## Интерактивный режим

При первом запуске:

1. Браузер откроется автоматически
2. Скрипт попросит вас войти в Claude.ai
3. После входа нажмите Enter в терминале
4. Дальше все произойдет автоматически

Сессия сохраняется в папке `playwright-user-data`, поэтому при следующих запусках входить заново не нужно.

## Сброс сессии

Если нужно войти заново под другим аккаунтом:

```bash
rm -rf playwright-user-data
```

## Примеры использования

### Обработка одного issue

```bash
./run-dronedoc.sh 1
```

### Обработка нескольких issues подряд

```bash
./run-dronedoc.sh 1
./run-dronedoc.sh 2
./run-dronedoc.sh 3
```

### Проверка статуса без токена

```bash
# Без токена GitHub API позволяет 60 запросов в час
npm run playwright -- --repo unidel2035/dronedoc2025 --issue 1
```

## Решение проблем

### Ошибка "404 Not Found"

**Причины:**
- Неправильный номер issue
- Issue не существует в репозитории
- Репозиторий приватный, но токен не установлен

**Решение:**
1. Проверьте, что issue существует: https://github.com/unidel2035/dronedoc2025/issues
2. Установите GITHUB_TOKEN для приватных репозиториев

### Ошибка "Could not find input area"

**Причина:** Интерфейс Claude.ai изменился

**Решение:**
1. Скрипт покажет текст для ручной вставки
2. Скопируйте и вставьте в Claude Code вручную
3. Нажмите Enter в терминале

### Timeout при обработке

**Причина:** Сложная задача требует больше времени

**Решение:**
- Подождите завершения обработки в браузере
- Вручную нажмите "Create PR" когда готово
- Скрипт ждет до 30 минут автоматически

### Лимиты GitHub API

**Без токена:** 60 запросов в час
**С токеном:** 5000 запросов в час

**Решение:** Установите GITHUB_TOKEN (см. раздел "Настройка GitHub токена")

## Полезные команды

```bash
# Проверить синтаксис скриптов
npm run check

# Запустить линтер
npm run lint

# Исправить ошибки линтера автоматически
npm run lint:fix

# Посмотреть список issues в репозитории
gh issue list --repo unidel2035/dronedoc2025

# Создать новый issue
gh issue create --repo unidel2035/dronedoc2025
```

## Дополнительные опции

```bash
# Все доступные опции
npm run playwright -- --help

# Основные опции:
--repo, -r        GitHub репозиторий (формат: owner/repo)
--issue, -i       Номер issue
--github-token, -t  GitHub токен (или используйте GITHUB_TOKEN)
--manual-login    Ждать ручного входа (по умолчанию: true)
--headless        Запустить браузер в фоновом режиме (по умолчанию: false)
```

## Безопасность

⚠️ **Важно:**
- Никогда не коммитьте GitHub токен в репозиторий
- Используйте переменные окружения для токенов
- Сессия браузера хранится локально в `playwright-user-data`
- Проверьте код перед запуском

## Поддержка

Если возникли проблемы:
1. Проверьте [основной README](README.md)
2. Создайте issue: https://github.com/unidel2035/ai-ci/issues
3. Проверьте логи в консоли для деталей ошибки
