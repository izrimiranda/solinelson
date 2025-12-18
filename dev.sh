#!/bin/bash

# 🚀 Script para rodar Frontend React + Backend PHP simultaneamente
# Uso: ./dev.sh

echo "🚀 Iniciando servidores de desenvolvimento..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para matar processos ao sair
cleanup() {
    echo ""
    echo -e "${RED}🛑 Parando servidores...${NC}"
    
    # Matar processo do PHP
    if [ ! -z "$PHP_PID" ]; then
        kill $PHP_PID 2>/dev/null
        echo -e "${YELLOW}   ✓ PHP Server parado (PID: $PHP_PID)${NC}"
    fi
    
    # Matar processo do Vite
    if [ ! -z "$VITE_PID" ]; then
        kill $VITE_PID 2>/dev/null
        echo -e "${YELLOW}   ✓ Vite Server parado (PID: $VITE_PID)${NC}"
    fi
    
    echo -e "${GREEN}✅ Servidores finalizados${NC}"
    exit 0
}

# Capturar Ctrl+C e outros sinais
trap cleanup SIGINT SIGTERM EXIT

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado!${NC}"
    echo "Execute este script na raiz do projeto Solinelson"
    exit 1
fi

if [ ! -d "api" ]; then
    echo -e "${RED}❌ Erro: pasta /api/ não encontrada!${NC}"
    exit 1
fi

# 1️⃣ Iniciar Backend PHP
echo -e "${BLUE}📦 Iniciando Backend PHP...${NC}"
php -S localhost:8000 > /tmp/solinelson-php.log 2>&1 &
PHP_PID=$!

# Aguardar PHP iniciar
sleep 2

# Verificar se PHP está rodando
if ps -p $PHP_PID > /dev/null; then
    echo -e "${GREEN}   ✓ PHP Server rodando em http://localhost:8000${NC}"
    echo -e "${GREEN}   ✓ API disponível em http://localhost:8000/api/${NC}"
    echo -e "   📋 PID: $PHP_PID"
else
    echo -e "${RED}   ✗ Erro ao iniciar PHP Server${NC}"
    cat /tmp/solinelson-php.log
    exit 1
fi

echo ""

# 2️⃣ Iniciar Frontend Vite
echo -e "${BLUE}⚡ Iniciando Frontend Vite (React)...${NC}"
npm run dev > /tmp/solinelson-vite.log 2>&1 &
VITE_PID=$!

# Aguardar Vite iniciar
sleep 3

# Verificar se Vite está rodando
if ps -p $VITE_PID > /dev/null; then
    echo -e "${GREEN}   ✓ Vite Server rodando em http://localhost:3000${NC}"
    echo -e "   📋 PID: $VITE_PID"
else
    echo -e "${RED}   ✗ Erro ao iniciar Vite${NC}"
    cat /tmp/solinelson-vite.log
    kill $PHP_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Servidores rodando com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC}  http://localhost:3000"
echo -e "${BLUE}🔧 Backend:${NC}   http://localhost:8000"
echo -e "${BLUE}🔌 API:${NC}       http://localhost:8000/api/"
echo ""
echo -e "${YELLOW}💡 Dica: Ajuste API_BASE no index.tsx para 'http://localhost:8000/api'${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${RED}Pressione Ctrl+C para parar os servidores${NC}"
echo ""

# Mostrar logs em tempo real (alternando entre PHP e Vite)
echo -e "${BLUE}📊 Logs dos servidores:${NC}"
echo ""

# Fazer tail dos logs de ambos
tail -f /tmp/solinelson-php.log /tmp/solinelson-vite.log &
TAIL_PID=$!

# Aguardar indefinidamente (até Ctrl+C)
wait $VITE_PID $PHP_PID
