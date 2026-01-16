# ⚠️ CONFLITO DE PORTA DETECTADO!

## 🔍 Problema Encontrado

Há um container PostgreSQL rodando na porta 5432:
```
rastreador-postgres - Up About an hour - 0.0.0.0:5432->5432/tcp
```

Isso vai impedir o PostgreSQL do MarketPlace de iniciar!

## 🛠️ Solução

Execute os comandos nesta ordem:

### 1️⃣ Parar o PostgreSQL do outro projeto
```powershell
docker stop rastreador-postgres
```

### 2️⃣ Limpar containers antigos do MarketPlace
```powershell
cd C:\Users\Kélven\marketPlace
docker-compose down -v
```

### 3️⃣ Remover containers órfãos (opcional mas recomendado)
```powershell
docker container prune
```
(Digite 'y' quando perguntar)

### 4️⃣ Iniciar o MarketPlace
```powershell
docker-compose up --build
```

## 🔄 Se Quiser Manter Ambos Projetos

Se você precisa do `rastreador-postgres` rodando, você tem 2 opções:

### Opção A: Mudar porta do MarketPlace
Edite o `docker-compose.yml`:
```yaml
postgres:
  ports:
    - "5433:5432"  # Mude de 5432 para 5433
```

### Opção B: Parar o rastreador-postgres quando usar o MarketPlace
```powershell
# Para parar
docker stop rastreador-postgres

# Para iniciar novamente depois
docker start rastreador-postgres
```

## 📋 Checklist Completo

Execute na ordem:

```powershell
# 1. Parar outro PostgreSQL
docker stop rastreador-postgres

# 2. Ir para o projeto
cd C:\Users\Kélven\marketPlace

# 3. Limpar containers antigos
docker-compose down -v

# 4. Limpar containers órfãos
docker container prune

# 5. Subir a aplicação
docker-compose up --build

# 6. Aguardar mensagens de sucesso (2-3 minutos)

# 7. Em outro terminal, popular o banco
.\seed-database.ps1
```

## ✅ Portas Que Precisam Estar Livres

- ❌ **5432** - OCUPADA (rastreador-postgres)
- ❓ **8081** - Precisa verificar
- ❓ **3000** - Precisa verificar

### Verificar Portas
```powershell
Get-NetTCPConnection -LocalPort 3000,8081,5432 -State Listen
```

## 🎯 Após Resolver

Quando conseguir subir, você verá:
1. ✅ `marketplace-postgres healthy`
2. ✅ `Started MarketPlaceApplication in X.XXX seconds`
3. ✅ `ready in XXX ms`

Então acesse: http://localhost:3000

---

**⚡ RESUMO: Pare o rastreador-postgres primeiro!**
```powershell
docker stop rastreador-postgres
cd C:\Users\Kélven\marketPlace
docker-compose down -v
docker-compose up --build
```

