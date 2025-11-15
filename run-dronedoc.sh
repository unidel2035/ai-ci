#!/bin/bash

# Скрипт для автоматизации GitHub issues из репозитория dronedoc2025
# Использование: ./run-dronedoc.sh <номер_issue>

REPO="unidel2035/dronedoc2025"

if [ -z "$1" ]; then
  echo "Ошибка: Не указан номер issue"
  echo "Использование: ./run-dronedoc.sh <номер_issue>"
  echo "Пример: ./run-dronedoc.sh 5"
  exit 1
fi

ISSUE_NUMBER=$1

echo "=========================================="
echo "  AI-CI Automation для DroneDoc 2025"
echo "=========================================="
echo "Репозиторий: $REPO"
echo "Issue: #$ISSUE_NUMBER"
echo "=========================================="
echo ""

# Проверяем наличие GITHUB_TOKEN
if [ -z "$GITHUB_TOKEN" ]; then
  echo "⚠️  Предупреждение: GITHUB_TOKEN не установлен"
  echo "   Для приватных репозиториев и избежания лимитов API установите токен:"
  echo "   export GITHUB_TOKEN=your_token_here"
  echo ""
  read -p "Продолжить без токена? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Запускаем автоматизацию
npm run playwright -- --repo "$REPO" --issue "$ISSUE_NUMBER"
