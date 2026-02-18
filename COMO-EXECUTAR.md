# 🚀 Como Executar o MarketPlace

## 📋 Pré-requisitos
- Java 21
- Node.js
- Maven

## ▶️ Passos para executar

### 1️⃣ Iniciar o Backend (Terminal 1)

Abra um terminal PowerShell e execute:

```powershell
cd c:\Users\Kélven\marketPlace\backend
.\mvnw.cmd spring-boot:run
```

**Aguarde** até ver a mensagem:
```
Started MarketPlaceApplication in X.XXX seconds
```

### 2️⃣ Popular o Banco de Dados (Terminal 2)

Abra um **NOVO** terminal PowerShell e execute:

```powershell
cd c:\Users\Kélven\marketPlace
.\seed-database.ps1
```

Você deve ver:
```
✅ Categoria criada com ID: 1
✅ Usuário criado com ID: 1
✅ Produto criado: Notebook Dell
...
🎉 Todos os dados foram criados com sucesso!
```

### 3️⃣ Iniciar o Frontend (Terminal 3)

Abra um **NOVO** terminal PowerShell e execute:

```powershell
cd c:\Users\Kélven\marketPlace\frontend
npm run dev
```

Aguarde até ver:
```
➜  Local:   http://localhost:5173/
```

### 4️⃣ Acessar no Navegador

Abra o navegador e acesse:
```
http://localhost:5173
```

## 🔧 URLs Importantes

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8081/api
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **H2 Console**: http://localhost:8081/h2-console
  - JDBC URL: `jdbc:h2:mem:marketplace_db`
  - Username: `sa`
  - Password: (deixe em branco)

## ⚠️ Problemas Comuns

### Erro CORS
Se aparecer erro de CORS, certifique-se de que:
1. O backend está rodando
2. O SecurityConfig.java tem a configuração de CORS
3. Reinicie o backend após qualquer mudança

### Porta já em uso
Se a porta 8081 estiver em uso:
```powershell
# Ver processos na porta
Get-NetTCPConnection -LocalPort 8081

# Parar processo (substitua XXXX pelo PID)
Stop-Process -Id XXXX -Force
```

### Backend não inicia
Verifique se a porta 8080 está livre ou se há outro processo Java rodando.

## 📝 Notas

- O banco de dados H2 é em memória, então os dados são perdidos ao parar o backend
- Execute `.\seed-database.ps1` sempre que reiniciar o backend
- Mantenha os 3 terminais abertos enquanto estiver desenvolvendo
