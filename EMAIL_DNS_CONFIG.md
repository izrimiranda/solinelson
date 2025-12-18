# Configurações DNS para Melhor Entrega de Emails

## 📧 Resumo

Para garantir que os emails enviados pelo sistema Solinelson sejam entregues corretamente e não caiam em spam, é necessário configurar os seguintes registros DNS no domínio `codigo1615.com.br`.

---

## ⚙️ Configurações Necessárias

### 1. Registro SPF (Sender Policy Framework)

O SPF indica quais servidores estão autorizados a enviar emails em nome do seu domínio.

**Tipo:** TXT  
**Nome:** @ (ou codigo1615.com.br)  
**Valor:** 
```
v=spf1 mx a ip4:205.172.59.146 include:_spf.codigo1615.com.br ~all
```

**Explicação:**
- `v=spf1` - Versão do SPF
- `mx` - Autoriza servidores MX do domínio
- `a` - Autoriza o IP do registro A do domínio
- `ip4:205.172.59.146` - IP da VPS (autorizado explicitamente)
- `include:_spf.codigo1615.com.br` - Incluir outras políticas SPF se houver
- `~all` - Soft fail (emails de outros IPs serão marcados como suspeitos)

**Alternativa mais restritiva:**
```
v=spf1 ip4:205.172.59.146 -all
```
Esta versão rejeita (`-all`) qualquer email que não venha do IP 205.172.59.146.

---

### 2. Registro DKIM (DomainKeys Identified Mail)

O DKIM assina digitalmente seus emails para provar autenticidade.

#### Passo 1: Gerar Par de Chaves DKIM

No servidor VPS, execute:

```bash
# Instalar OpenDKIM (se ainda não estiver instalado)
sudo apt install opendkim opendkim-tools

# Gerar chave DKIM
sudo mkdir -p /etc/opendkim/keys/codigo1615.com.br
sudo opendkim-genkey -t -s mail -d codigo1615.com.br -D /etc/opendkim/keys/codigo1615.com.br/

# Visualizar a chave pública
sudo cat /etc/opendkim/keys/codigo1615.com.br/mail.txt
```

#### Passo 2: Adicionar Registro DNS

**Tipo:** TXT  
**Nome:** `mail._domainkey` (ou `mail._domainkey.codigo1615.com.br`)  
**Valor:** (copie do arquivo `mail.txt` gerado acima)

Exemplo:
```
v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
```

**Nota:** O valor é uma string longa. Copie TODA a string após `p=`, sem espaços ou quebras de linha.

---

### 3. Registro DMARC (Domain-based Message Authentication)

O DMARC define a política de autenticação e onde receber relatórios de falhas.

**Tipo:** TXT  
**Nome:** `_dmarc` (ou `_dmarc.codigo1615.com.br`)  
**Valor:**
```
v=DMARC1; p=quarantine; rua=mailto:izri@outlook.com; ruf=mailto:izri@outlook.com; fo=1; adkim=r; aspf=r; pct=100
```

**Explicação:**
- `v=DMARC1` - Versão do DMARC
- `p=quarantine` - Política: coloca emails não autenticados em quarentena
  - Alternativas: `none` (apenas monitorar), `reject` (rejeitar completamente)
- `rua=mailto:izri@outlook.com` - Email para relatórios agregados
- `ruf=mailto:izri@outlook.com` - Email para relatórios de falhas forenses
- `fo=1` - Gerar relatórios se SPF ou DKIM falharem
- `adkim=r` - Alinhamento relaxado do DKIM
- `aspf=r` - Alinhamento relaxado do SPF
- `pct=100` - Aplicar política em 100% dos emails

---

### 4. Registro PTR (Reverse DNS) - Opcional mas Recomendado

O PTR é configurado no provedor da VPS (não no DNS do domínio). Entre em contato com o suporte da VPS para configurar.

**IP:** 205.172.59.146  
**PTR (Reverse):** `mail.codigo1615.com.br`

Isso faz com que ao fazer reverse lookup do IP, retorne o domínio correto.

---

## 🔧 Como Configurar no Registro.br

### Acessar Painel de Controle
1. Acesse https://registro.br/
2. Faça login com sua conta
3. Vá em **Meus Domínios** → **codigo1615.com.br** → **DNS**

### Adicionar Registros TXT

Para cada registro acima (SPF, DKIM, DMARC):

1. Clique em **Adicionar Entrada DNS**
2. Selecione o tipo **TXT**
3. Preencha:
   - **Nome:** (conforme indicado acima)
   - **Valor:** (copie o valor exato)
   - **TTL:** 3600 (1 hora) ou deixe padrão
4. Clique em **Salvar**

**Exemplo prático:**

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| TXT | @ | `v=spf1 ip4:205.172.59.146 -all` | 3600 |
| TXT | mail._domainkey | `v=DKIM1; h=sha256; k=rsa; p=MIIBIj...` | 3600 |
| TXT | _dmarc | `v=DMARC1; p=quarantine; rua=mailto:izri@outlook.com...` | 3600 |

---

## ✅ Verificar Configurações

### Ferramentas Online

Após configurar, aguarde a propagação DNS (15 minutos a 2 horas) e verifique:

1. **MXToolbox** - https://mxtoolbox.com/
   - SPF Record Check: https://mxtoolbox.com/spf.aspx
   - DMARC Check: https://mxtoolbox.com/dmarc.aspx
   - DKIM Check: https://mxtoolbox.com/dkim.aspx

2. **Google Admin Toolbox** - https://toolbox.googleapps.com/apps/checkmx/

3. **Mail Tester** - https://www.mail-tester.com/
   - Envie um email de teste e receba uma pontuação de 0 a 10

### Comando Terminal

```bash
# Verificar SPF
dig TXT codigo1615.com.br

# Verificar DKIM
dig TXT mail._domainkey.codigo1615.com.br

# Verificar DMARC
dig TXT _dmarc.codigo1615.com.br

# Verificar PTR (reverse DNS)
dig -x 205.172.59.146
```

---

## 🚀 Configurar OpenDKIM no Servidor

Após gerar as chaves DKIM, configure o servidor para assinar emails:

```bash
# Editar arquivo de configuração do OpenDKIM
sudo nano /etc/opendkim.conf
```

Adicione/verifique estas linhas:

```conf
Domain                  codigo1615.com.br
KeyFile                 /etc/opendkim/keys/codigo1615.com.br/mail.private
Selector                mail
Socket                  inet:8891@localhost
Canonicalization        relaxed/simple
```

```bash
# Configurar tabela de assinatura
sudo nano /etc/opendkim/signing.table
```

Adicione:
```
*@codigo1615.com.br mail._domainkey.codigo1615.com.br
```

```bash
# Configurar tabela de chaves
sudo nano /etc/opendkim/key.table
```

Adicione:
```
mail._domainkey.codigo1615.com.br codigo1615.com.br:mail:/etc/opendkim/keys/codigo1615.com.br/mail.private
```

```bash
# Configurar hosts confiáveis
sudo nano /etc/opendkim/trusted.hosts
```

Adicione:
```
127.0.0.1
localhost
205.172.59.146
codigo1615.com.br
*.codigo1615.com.br
```

```bash
# Ajustar permissões
sudo chown -R opendkim:opendkim /etc/opendkim
sudo chmod 600 /etc/opendkim/keys/codigo1615.com.br/mail.private

# Reiniciar OpenDKIM
sudo systemctl restart opendkim
sudo systemctl enable opendkim

# Verificar status
sudo systemctl status opendkim
```

---

## 📤 Configurar Postfix para Usar DKIM

```bash
# Editar configuração do Postfix
sudo nano /etc/postfix/main.cf
```

Adicione no final:

```conf
# OpenDKIM
milter_default_action = accept
milter_protocol = 6
smtpd_milters = inet:localhost:8891
non_smtpd_milters = $smtpd_milters
```

```bash
# Reiniciar Postfix
sudo systemctl restart postfix
```

---

## 📊 Monitoramento

### Relatórios DMARC

Os relatórios serão enviados para `izri@outlook.com`. Eles contêm:
- Estatísticas de emails enviados
- Taxa de autenticação (SPF/DKIM)
- IPs que tentaram enviar emails em nome do domínio
- Falhas de autenticação

### Logs do Servidor

```bash
# Ver logs de emails enviados
sudo tail -f /var/log/mail.log

# Ver logs do OpenDKIM
sudo journalctl -u opendkim -f

# Ver fila de emails
mailq
```

---

## 🔍 Troubleshooting

### Emails caindo em spam mesmo após configurações

1. **Verificar reputação do IP:**
   - https://www.spamhaus.org/lookup/
   - https://mxtoolbox.com/blacklists.aspx

2. **Verificar conteúdo do email:**
   - Evite palavras spam (grátis, urgente, clique aqui, etc)
   - Tenha sempre texto plano além do HTML
   - Proporção texto/imagem balanceada
   - Link de descadastramento (unsubscribe)

3. **Aquecimento de IP (Warm-up):**
   - Comece enviando poucos emails por dia (10-20)
   - Aumente gradualmente ao longo de semanas
   - Evite envios em massa logo de início

### Emails não sendo enviados

```bash
# Verificar se portas estão abertas
sudo netstat -tulpn | grep :587
sudo netstat -tulpn | grep :25

# Testar SMTP localmente
telnet localhost 587

# Ver erros
sudo tail -100 /var/log/mail.log | grep error
```

---

## 📝 Checklist Final

- [ ] Registro SPF configurado
- [ ] Chaves DKIM geradas
- [ ] Registro DNS DKIM adicionado
- [ ] OpenDKIM configurado e rodando
- [ ] Postfix configurado para usar DKIM
- [ ] Registro DMARC configurado
- [ ] PTR (Reverse DNS) configurado (opcional)
- [ ] Testes realizados (MXToolbox, Mail Tester)
- [ ] Email de teste enviado e recebido
- [ ] Monitoramento de relatórios DMARC ativado

---

## 🆘 Suporte

**Contato VPS:** Suporte da VPS para configurar PTR  
**Email Admin:** izri@outlook.com  
**Documentação PHPMailer:** https://github.com/PHPMailer/PHPMailer  

---

**Última atualização:** 16 de dezembro de 2025  
**Responsável:** Código 1615 - Desenvolvimento
