#!/bin/bash
set -e

# Sempre trabalhar a partir da pasta onde este script está localizado.
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Matar processos antigos se existirem.
pkill -f "php -S localhost:8000" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

cd "$PROJECT_DIR"

# Instalar dependências somente se node_modules ainda não existir.
if [ ! -d "node_modules" ]; then
  npm install
fi

# Iniciar servidor PHP em segundo plano servindo a pasta api diretamente.
php -S localhost:8000 -t api &
PHP_PID=$!

# Aguardar um pouco para o servidor PHP subir.
sleep 2

# Encerrar o PHP quando o script terminar.
trap 'kill "$PHP_PID" 2>/dev/null || true' EXIT

# Iniciar o frontend.
npm run dev
