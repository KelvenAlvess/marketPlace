# Script para limpar produtos e repovoar com imagens múltiplas
$baseUrl = "http://localhost:8081/api"

Write-Host "� Registrando/Logando usuário vendedor..." -ForegroundColor Cyan

$registerData = @{
    username = "Maria Vendedora"
    email = "maria.vendedora@example.com"
    password = "senha123"
    cpf = "12345678901"
    phoneNumber = "11987654321"
    address = "Rua das Flores, 123"
    roles = @("SELLER")
} | ConvertTo-Json

# Tentar registrar o usuário primeiro (ignora erro se já existir)
try {
    $registerResult = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body $registerData
    Write-Host "✓ Usuário registrado!" -ForegroundColor Green
} catch {
    Write-Host "⚠ Usuário já existe, ok!" -ForegroundColor Yellow
}

# Fazer login
$loginData = @{
    email = "maria.vendedora@example.com"
    password = "senha123"
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body $loginData
    $token = $loginResult.token
    Write-Host "✓ Login OK!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro no login" -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n🗑️ Deletando produtos antigos..." -ForegroundColor Cyan

try {
    $produtos = Invoke-RestMethod -Uri "$baseUrl/products" -Method Get
    $deleted = 0
    foreach ($prod in $produtos) {
        try {
            Invoke-RestMethod -Uri "$baseUrl/products/$($prod.product_ID)" -Method Delete -Headers $headers
            $deleted++
            Write-Host "  ✓ Produto $($prod.product_ID) deletado" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Erro ao deletar produto $($prod.product_ID)" -ForegroundColor Red
        }
    }
    Write-Host "✓ $deleted produtos deletados" -ForegroundColor Green
} catch {
    Write-Host "⚠ Erro ao buscar produtos" -ForegroundColor Yellow
}

Write-Host "`n🔄 Executando script de população..." -ForegroundColor Cyan
.\seed-products.ps1
