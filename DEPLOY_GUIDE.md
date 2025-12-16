# 🚀 Guia Rápido de Deploy - Solinelson

Deploy rápido para o servidor de produção (VPS Código 1615).

---

## 📋 Pré-requisitos

- ✅ VPS com Apache/Nginx + PHP 7.4+ + MySQL 8.0+
- ✅ Acesso SSH ao servidor
- ✅ Domínio apontado para IP do servidor

---

## 🔧 Passo 1: Preparar Arquivos para Deploy

### No Computador Local

```bash
cd ~/projetos/solinelson

# 1. Build do frontend React
npm run build

# Isso cria a pasta /dist/ com arquivos otimizados
# Estrutura gerada:
# dist/
#   ├── index.html
#   ├── assets/
#   │   ├── index-[hash].js
#   │   └── index-[hash].css
```

### Criar Pacote de Deploy

```bash
# Cria arquivo .tar.gz com tudo necessário
tar -czf solinelson-deploy.tar.gz \
  dist/ \
  api/ \
  database.sql \
  test_connection.php \
  DATABASE_README.md \
  TESTING_GUIDE.md
```

---

## 📤 Passo 2: Enviar para Servidor

### Opção A: Via SCP (Linha de Comando)

```bash
# Substitua [usuario] pelo seu usuário SSH
scp solinelson-deploy.tar.gz [usuario]@205.172.59.146:/home/[usuario]/
```

### Opção B: Via SFTP (FileZilla, WinSCP)

1. Conecte via SFTP em `205.172.59.146`
2. Navegue até `/home/izrimiranda/web/codigo1615.com.br/public_html/`
3. Crie pasta `solinelson`
4. Faça upload do arquivo `solinelson-deploy.tar.gz`

---

## 🌐 Passo 3: Configurar no Servidor

### Via SSH

```bash
# Conectar ao servidor
ssh izrimiranda@205.172.59.146

# Navegar para pasta do site
cd /home/izrimiranda/web/codigo1615.com.br/public_html/

# Criar diretório solinelson (se não existir)
mkdir -p solinelson
cd solinelson

# Descompactar arquivos
tar -xzf ~/solinelson-deploy.tar.gz

# Mover arquivos do /dist/ para raiz
mv dist/* .
rm -rf dist/

# Estrutura final:
# /home/izrimiranda/web/codigo1615.com.br/public_html/solinelson/
#   ├── index.html
#   ├── assets/
#   │   ├── index-[hash].js
#   │   └── index-[hash].css
#   ├── api/
#   │   ├── config.php
#   │   ├── login.php
#   │   ├── ... (outros 8 arquivos)
#   ├── database.sql
#   ├── test_connection.php
#   └── ... (documentação)
```

---

## 🗄️ Passo 4: Configurar Banco de Dados (Se Ainda Não Foi Feito)

```bash
# Via SSH no servidor
mysql -u codigo1615admin_solinelson_user -p codigo1615admin_solinelson_db < database.sql

# Vai pedir a senha do banco
```

**Ou via HestiaCP**:
1. Login: https://205.172.59.146:8083
2. Menu **DB**
3. Selecionar banco `codigo1615admin_solinelson_db`
4. Clicar em **phpMyAdmin**
5. Aba **Import**
6. Fazer upload do `database.sql`

---

## ⚙️ Passo 5: Configurar API Backend

### Editar config.php

```bash
nano /home/izrimiranda/web/codigo1615.com.br/public_html/solinelson/api/config.php
```

**Ajustar as seguintes linhas**:

```php
// Credenciais do banco (já devem estar corretas)
define('DB_HOST', '205.172.59.146');
define('DB_NAME', 'codigo1615admin_solinelson_db');
define('DB_USER', 'codigo1615admin_solinelson_user');
define('DB_PASS', 'sua_senha_real_aqui');

// CORS - Alterar para domínio de produção
header('Access-Control-Allow-Origin: https://codigo1615.com.br');
// OU, se quiser permitir qualquer origem (menos seguro):
// header('Access-Control-Allow-Origin: *');

// Desabilitar exibição de erros (segurança)
error_reporting(0);
ini_set('display_errors', 0);
```

Salvar: `Ctrl+O`, Enter, `Ctrl+X`

---

## 🔐 Passo 6: Configurar Permissões

```bash
# Ajustar dono dos arquivos
sudo chown -R izrimiranda:izrimiranda /home/izrimiranda/web/codigo1615.com.br/public_html/solinelson/

# Permissões corretas
sudo chmod -R 755 /home/izrimiranda/web/codigo1615.com.br/public_html/solinelson/

# Arquivos PHP devem ter 644
sudo chmod 644 /home/izrimiranda/web/codigo1615.com.br/public_html/solinelson/api/*.php
```

---

## 🌐 Passo 7: Criar Subdomínio (Opcional)

### Via HestiaCP

1. Login: https://205.172.59.146:8083
2. Menu **WEB**
3. Clicar em **Add Web Domain**
4. Preencher:
   - **Domain**: `solinelson.codigo1615.com.br`
   - **Enable SSL**: Yes (Let's Encrypt)
   - **Enable PHP**: Yes
5. Clicar em **Save**

### Ou Via Registro.br (DNS Manual)

1. Login: https://registro.br
2. Meus Domínios → codigo1615.com.br
3. Adicionar registro:
   - **Tipo**: A
   - **Nome**: solinelson
   - **IP**: 205.172.59.146
   - **TTL**: 3600
4. Aguardar propagação (2-6 horas)

---

## 🔒 Passo 8: Configurar SSL (HTTPS)

### Via HestiaCP (Automático)

```bash
# Via SSH
sudo /usr/local/hestia/bin/v-add-letsencrypt-domain izrimiranda solinelson.codigo1615.com.br

# Forçar HTTPS
sudo /usr/local/hestia/bin/v-add-web-domain-ssl-force izrimiranda solinelson.codigo1615.com.br
```

### Ou Via Certbot (Manual)

```bash
sudo certbot --apache -d solinelson.codigo1615.com.br
```

---

## ✅ Passo 9: Testar Deploy

### 1. Teste de Conexão com Banco

```bash
cd /home/izrimiranda/web/codigo1615.com.br/public_html/solinelson
php test_connection.php
```

**Resultado esperado**:
```
✅ Conexão com banco OK
✅ 3 tabelas encontradas
✅ 4 fotos na galeria
✅ 1 usuário admin
✅ 3 stored procedures
✅ 2 views
```

### 2. Teste da API

```bash
# Galeria (público)
curl https://codigo1615.com.br/solinelson/api/get_gallery.php

# Login (deve retornar erro de método)
curl https://codigo1615.com.br/solinelson/api/login.php

# Se retornar 404, verificar configuração do Apache/Nginx
```

### 3. Teste do Frontend

Acesse no navegador:
- **Produção**: https://codigo1615.com.br/solinelson/
- **Ou Subdomínio**: https://solinelson.codigo1615.com.br/

**Verificar**:
- ✅ Página inicial carrega
- ✅ Galeria aparece (4 fotos)
- ✅ Formulário de orçamento funciona
- ✅ Login admin funciona (username: `admin`, password: `admin`)

---

## 🐛 Troubleshooting

### Erro 404 na API

**Problema**: `https://codigo1615.com.br/solinelson/api/login.php` retorna 404

**Solução**: Verificar se `.htaccess` não está bloqueando

```bash
# Verificar se .htaccess existe na pasta api/
ls -la /home/izrimiranda/web/codigo1615.com.br/public_html/solinelson/api/.htaccess

# Se existir e tiver regras bloqueando, remover ou ajustar
```

Se não houver `.htaccess`, criar um simples:

```bash
nano /home/izrimiranda/web/codigo1615.com.br/public_html/solinelson/api/.htaccess
```

Conteúdo:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /solinelson/api/
</IfModule>
```

---

### Erro de Conexão com Banco

**Problema**: API retorna erro de conexão.

**Solução**: Verificar credenciais em `api/config.php`

```bash
# Testar conexão manualmente
mysql -h 205.172.59.146 -u codigo1615admin_solinelson_user -p codigo1615admin_solinelson_db

# Se conectar OK, problema está no PHP
# Verificar se extensão PDO_MYSQL está instalada
php -m | grep pdo_mysql
```

---

### CORS Error

**Problema**: Console do navegador mostra erro CORS.

**Solução**: Ajustar headers em `api/config.php`

```php
// Se estiver acessando via https://codigo1615.com.br
header('Access-Control-Allow-Origin: https://codigo1615.com.br');

// Se tiver subdomínio
header('Access-Control-Allow-Origin: https://solinelson.codigo1615.com.br');

// Ou permitir tudo (menos seguro)
header('Access-Control-Allow-Origin: *');
```

---

### Frontend Carrega mas Galeria Vazia

**Problema**: Página inicial carrega mas galeria não aparece.

**Diagnóstico**:
1. Abrir Console do navegador (F12)
2. Aba Network
3. Verificar requisição para `/api/get_gallery.php`

**Soluções possíveis**:
- Se 404: Verificar caminho da API
- Se 500: Ver logs do PHP (`tail -f /var/log/apache2/error.log`)
- Se CORS: Ajustar headers (ver acima)
- Se retorna vazio: Verificar se há fotos no banco (`php test_connection.php`)

---

## 🔄 Atualização Futura (Deploy de Updates)

Quando fizer mudanças no código:

```bash
# No local
cd ~/projetos/solinelson
npm run build
tar -czf solinelson-update.tar.gz dist/ api/

# Enviar para servidor
scp solinelson-update.tar.gz izrimiranda@205.172.59.146:/tmp/

# No servidor
ssh izrimiranda@205.172.59.146
cd /home/izrimiranda/web/codigo1615.com.br/public_html/solinelson/

# Backup antes de atualizar
tar -czf backup-$(date +%Y%m%d).tar.gz *

# Atualizar
tar -xzf /tmp/solinelson-update.tar.gz
mv dist/* .
rm -rf dist/

# Reiniciar Apache/Nginx (se necessário)
sudo systemctl restart apache2
```

---

## 🔐 Segurança Pós-Deploy

### 1. Trocar Senha Padrão do Admin

```bash
# Via SSH
mysql -u codigo1615admin_solinelson_user -p codigo1615admin_solinelson_db

# No MySQL
UPDATE admin_users 
SET password_hash = '$2y$10$NovoHashAqui' 
WHERE username = 'admin';
```

**Gerar novo hash bcrypt**: https://bcrypt-generator.com/  
(Colar a senha desejada, copiar o hash gerado)

### 2. Desabilitar Exibição de Erros

No `api/config.php`:
```php
error_reporting(0);
ini_set('display_errors', 0);
```

### 3. Forçar HTTPS

No `.htaccess` da raiz do site:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 4. Configurar Firewall

```bash
# Bloquear acesso direto a arquivos .sql
sudo nano /home/izrimiranda/web/codigo1615.com.br/public_html/solinelson/.htaccess
```

Adicionar:
```apache
<Files "*.sql">
    Order Allow,Deny
    Deny from all
</Files>
```

---

## 📊 Checklist de Deploy

- [ ] ✅ Build do frontend (`npm run build`)
- [ ] ✅ Arquivos enviados para servidor
- [ ] ✅ Descompactados na pasta correta
- [ ] ✅ `api/config.php` configurado (DB + CORS)
- [ ] ✅ Banco de dados criado e populado
- [ ] ✅ Permissões ajustadas (755/644)
- [ ] ✅ Teste de conexão (`test_connection.php`) OK
- [ ] ✅ Teste da API (curl) OK
- [ ] ✅ Frontend carrega no navegador
- [ ] ✅ Galeria aparece
- [ ] ✅ Formulário de orçamento funciona
- [ ] ✅ Login admin funciona
- [ ] ✅ SSL configurado (HTTPS)
- [ ] ✅ Senha padrão do admin trocada
- [ ] ✅ Erros de PHP desabilitados

---

## 🎉 Deploy Completo!

Sua aplicação está no ar em:
- **URL Principal**: https://codigo1615.com.br/solinelson/
- **Painel Admin**: https://codigo1615.com.br/solinelson/ (rodapé → Área do Admin)

**Credenciais Padrão**:
- Username: `admin`
- Password: `admin`

**⚠️ IMPORTANTE**: Troque a senha padrão imediatamente!

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0
