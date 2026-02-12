# Script para criar usuário comprador
$baseUrl = "http://localhost:8081/api"

Write-Host "Criando usuario comprador de teste..." -ForegroundColor Cyan

$registerData = @{
    userName = "Comprador Teste"
    email = "comprador@test.com"
    password = "123456"
    cpf = "12345678901"
    phoneNumber = "11999999999"
    address = "Rua Teste, 456"
    roles = @("BUYER")
} | ConvertTo-Json

try {
    $registerResult = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -ContentType "application/json" -Body $registerData
    Write-Host "Usuario comprador criado com sucesso!" -ForegroundColor Green
    Write-Host "Email: comprador@test.com" -ForegroundColor Yellow
    Write-Host "Senha: 123456" -ForegroundColor Yellow
    Write-Host "User ID: $($registerResult.userId)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*409*") {
        Write-Host "Usuario ja existe! Use:" -ForegroundColor Yellow
        Write-Host "Email: comprador@test.com" -ForegroundColor Yellow
        Write-Host "Senha: 123456" -ForegroundColor Yellow
    } else {
        Write-Host "Erro ao criar usuario: $($_.Exception.Message)" -ForegroundColor Red
    }
}
