# 🚀 Como Desenvolver Localmente

## Método Rápido (Recomendado)

Use o script `dev.sh` que inicia ambos os servidores automaticamente:

```bash
./dev.sh
```

**O que o script faz:**
- ✅ Inicia Backend PHP em `http://localhost:8000`
- ✅ Inicia Frontend React em `http://localhost:3000`
- ✅ Mostra logs de ambos em tempo real
- ✅ Para ambos os servidores com **Ctrl+C**

---

## Método Manual (Alternativo)

Se preferir controlar cada servidor separadamente:

### Terminal 1 - Backend PHP
```bash
php -S localhost:8000
```

### Terminal 2 - Frontend React
```bash
npm run dev
```

---

## 🔧 Configuração

### API_BASE no index.tsx

O arquivo já está configurado para desenvolvimento local:

```typescript
const API_BASE = 'http://localhost:8000/api';
```

**Antes de fazer deploy para produção**, alterar para:
```typescript
const API_BASE = '/api'; // Mesmo domínio
// OU
const API_BASE = 'https://codigo1615.com.br/solinelson/api'; // Domínio diferente
```

---

## 📋 Checklist de Desenvolvimento

1. ✅ Banco de dados rodando no servidor remoto
2. ✅ Credenciais corretas em `api/config.php`
3. ✅ `./dev.sh` executando sem erros
4. ✅ Frontend carrega em http://localhost:3000
5. ✅ API responde em http://localhost:8000/api/get_gallery.php

---

## 🐛 Problemas Comuns

### Erro: "port already in use"

**PHP (porta 8000):**
```bash
# Ver o que está usando a porta
lsof -i :8000

# Matar o processo
kill -9 [PID]
```

**Vite (porta 3000):**
```bash
# Ver o que está usando a porta
lsof -i :3000

# Matar o processo
kill -9 [PID]
```

### Erro: CORS

Verifique se `api/config.php` tem:
```php
header('Access-Control-Allow-Origin: http://localhost:3000');
```

### Erro: Banco de dados não conecta

```bash
# Testar conexão
php test_connection.php
```

---

## 📦 Estrutura de Desenvolvimento

```
solinelson/
├── dev.sh              ← Script para iniciar tudo
├── index.tsx           ← Frontend (API_BASE configurada)
├── api/
│   ├── config.php      ← Credenciais do banco
│   └── *.php           ← Endpoints da API
├── database.sql        ← Schema do banco
└── test_connection.php ← Testar banco
```

---

## 🔄 Workflow de Desenvolvimento

1. **Iniciar servidores**
   ```bash
   ./dev.sh
   ```

2. **Fazer mudanças no código**
   - Frontend: Salve o arquivo → Hot reload automático
   - Backend: Salve o arquivo → Recarregue a página

3. **Testar mudanças**
   - Navegue em http://localhost:3000
   - Verifique console do navegador (F12)
   - Veja logs no terminal

4. **Parar servidores**
   - Pressione **Ctrl+C** no terminal do dev.sh

---

## 🚀 Fazer Build para Produção

```bash
# Parar dev.sh se estiver rodando
# Ctrl+C

# Build do frontend
npm run build

# Resultado em /dist/
```

Depois siga as instruções em `DEPLOY_GUIDE.md`.

---

**Dica**: Mantenha sempre 2 janelas abertas:
1. Terminal com `dev.sh` rodando
2. Navegador com http://localhost:3000 + DevTools (F12)
