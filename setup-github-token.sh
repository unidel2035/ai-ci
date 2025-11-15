#!/bin/bash

# Скрипт для настройки GitHub токена
# Использование: ./setup-github-token.sh

echo "=========================================="
echo "  Настройка GitHub Token для AI-CI"
echo "=========================================="
echo ""
echo "Для работы с GitHub API нужен Personal Access Token."
echo ""
echo "Шаги для создания токена:"
echo "1. Откройте https://github.com/settings/tokens"
echo "2. Нажмите 'Generate new token' → 'Generate new token (classic)'"
echo "3. Введите название: 'AI-CI Automation'"
echo "4. Выберите срок действия (рекомендуется: 90 days)"
echo "5. Выберите scope: 'repo' (полный доступ к репозиториям)"
echo "6. Нажмите 'Generate token'"
echo "7. Скопируйте токен (он показывается только один раз!)"
echo ""
echo "=========================================="
echo ""

read -p "Введите ваш GitHub token (или нажмите Ctrl+C для отмены): " TOKEN

if [ -z "$TOKEN" ]; then
  echo "Ошибка: Токен не может быть пустым"
  exit 1
fi

# Проверяем, какой shell использует пользователь
SHELL_RC=""
if [ -n "$BASH_VERSION" ]; then
  SHELL_RC="$HOME/.bashrc"
elif [ -n "$ZSH_VERSION" ]; then
  SHELL_RC="$HOME/.zshrc"
else
  SHELL_RC="$HOME/.profile"
fi

echo ""
echo "Токен будет добавлен в $SHELL_RC"
echo ""

# Проверяем, не добавлен ли уже токен
if grep -q "export GITHUB_TOKEN=" "$SHELL_RC" 2>/dev/null; then
  echo "⚠️  GITHUB_TOKEN уже установлен в $SHELL_RC"
  read -p "Перезаписать? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Удаляем старую строку
    sed -i.bak '/export GITHUB_TOKEN=/d' "$SHELL_RC"
    echo "✓ Старый токен удален"
  else
    echo "Отменено"
    exit 0
  fi
fi

# Добавляем токен
echo "" >> "$SHELL_RC"
echo "# GitHub token for AI-CI automation" >> "$SHELL_RC"
echo "export GITHUB_TOKEN=$TOKEN" >> "$SHELL_RC"

echo "✓ Токен добавлен в $SHELL_RC"
echo ""
echo "Для применения изменений выполните:"
echo "  source $SHELL_RC"
echo ""
echo "Или просто откройте новый терминал."
echo ""
echo "Проверить токен можно командой:"
echo "  echo \$GITHUB_TOKEN"
echo ""

# Устанавливаем токен для текущей сессии
export GITHUB_TOKEN=$TOKEN
echo "✓ Токен установлен для текущей сессии"
echo ""
echo "Готово! Теперь можно запускать:"
echo "  ./run-dronedoc.sh <номер_issue>"
echo ""
