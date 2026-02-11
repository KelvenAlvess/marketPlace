# Script para popular o banco de dados
# Execute este script APÓS o backend estar rodando

Write-Host "🔄 Criando dados de teste..." -ForegroundColor Yellow

try {
    # 1. Criar categoria
    $category = Invoke-RestMethod -Uri "http://localhost:8081/api/categories" -Method Post -ContentType "application/json" -Body '{"name": "Eletrônicos", "description": "Produtos eletrônicos e de informática"}'
    Write-Host "✅ Categoria criada com ID: $($category.id)" -ForegroundColor Green

    # 2. Criar usuário vendedor
    $userBody = @{
        userName = "João Silva"
        email = "joao@example.com"
        password = "senha123"
        cpf = "12345678901"
        phoneNumber = "11999999999"
        address = "Rua Exemplo 123"
        roles = @("SELLER")
    } | ConvertTo-Json

    $user = Invoke-RestMethod -Uri "http://localhost:8081/api/users" -Method Post -ContentType "application/json" -Body $userBody
    Write-Host "✅ Usuário criado com ID: $($user.id)" -ForegroundColor Green

    # 3. Criar produtos
    $produtos = @(
        @{productName="Notebook Dell"; description="Intel Core i5, 8GB RAM, 256GB SSD"; price=3499.90; stockQuantity=10},
        @{productName="Mouse Gamer"; description="RGB, 12000 DPI, 7 botões programáveis"; price=149.90; stockQuantity=25},
        @{productName="Teclado Mecânico"; description="Switch Blue, RGB, ABNT2"; price=299.90; stockQuantity=15},
        @{productName="Monitor 24 polegadas"; description="Full HD, 144Hz, IPS"; price=899.90; stockQuantity=8},
        @{productName="Headset Gamer"; description="Som surround 7.1, LED RGB"; price=249.90; stockQuantity=20},
        @{productName="Webcam HD"; description="1080p, 30fps, Microfone integrado"; price=199.90; stockQuantity=12}
    )

    foreach ($p in $produtos) {
        $produtoBody = @{
            productName = $p.productName
            description = $p.description
            price = $p.price
            stockQuantity = $p.stockQuantity
            categoryId = 1
            sellerId = 1
        } | ConvertTo-Json
        
        $produto = Invoke-RestMethod -Uri "http://localhost:8081/api/products" -Method Post -ContentType "application/json" -Body $produtoBody
        Write-Host "  ✅ Produto criado: $($produto.productName)" -ForegroundColor Cyan
    }

    Write-Host "`n🎉 Todos os dados foram criados com sucesso!" -ForegroundColor Green
    Write-Host "🌐 Acesse http://localhost:5173 para ver os produtos!" -ForegroundColor Yellow

} catch {
    Write-Host "`n❌ Erro ao criar dados: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Certifique-se de que o backend está rodando em http://localhost:8081" -ForegroundColor Yellow
}
