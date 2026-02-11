# Script para popular o banco de dados com produtos de teste
# Execute este script no PowerShell

Write-Host "🚀 Iniciando população do banco de dados..." -ForegroundColor Cyan

$baseUrl = "http://localhost:8081/api"

# 1. Criar Categorias
Write-Host "`n📦 Criando categorias..." -ForegroundColor Yellow

$categorias = @(
    @{ name = "Eletrônicos"; description = "Produtos eletrônicos e de informática" },
    @{ name = "Moda"; description = "Roupas, calçados e acessórios" },
    @{ name = "Casa e Decoração"; description = "Móveis e itens de decoração" },
    @{ name = "Esportes"; description = "Artigos esportivos e fitness" },
    @{ name = "Livros"; description = "Livros e materiais educativos" },
    @{ name = "Beleza"; description = "Produtos de beleza e cuidados pessoais" }
)

$categoriaIds = @{}
foreach ($cat in $categorias) {
    try {
        $body = $cat | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Post -ContentType "application/json" -Body $body
        $categoriaIds[$cat.name] = $result.category_ID
        Write-Host "  ✓ Categoria '$($cat.name)' criada (ID: $($result.category_ID))" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Erro ao criar categoria '$($cat.name)'" -ForegroundColor Red
    }
}

# 2. Criar Usuário Vendedor
Write-Host "`n👤 Criando usuário vendedor..." -ForegroundColor Yellow

$vendedor = @{
    userName = "Maria Vendedora"
    email = "maria.vendedora@example.com"
    password = "senha123"
    cpf = "12345678901"
    phoneNumber = "11999999999"
    address = "Rua das Flores, 123 - São Paulo, SP"
    roles = @("SELLER", "BUYER")
}

try {
    $body = $vendedor | ConvertTo-Json
    $vendedorResult = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -ContentType "application/json" -Body $body
    $sellerId = $vendedorResult.user_ID
    Write-Host "  ✓ Vendedor criado (ID: $sellerId)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Vendedor já existe, fazendo login..." -ForegroundColor Yellow
}

# 2.1 Fazer Login para obter token JWT
Write-Host "`n🔐 Fazendo login..." -ForegroundColor Yellow

$loginData = @{
    email = "maria.vendedora@example.com"
    password = "senha123"
}

try {
    $body = $loginData | ConvertTo-Json
    $loginResult = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body $body
    $token = $loginResult.token
    $sellerId = $loginResult.userId
    Write-Host "  ✓ Login realizado com sucesso!" -ForegroundColor Green
    Write-Host "  ✓ Token obtido, Seller ID: $sellerId" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Erro ao fazer login. Verifique se o backend está rodando." -ForegroundColor Red
    exit
}

# Headers com autenticação
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 3. Criar Produtos
Write-Host "`n🛍️ Criando produtos..." -ForegroundColor Yellow

$produtos = @(
    # Eletrônicos
    @{ productName = "Notebook Dell Inspiron"; description = "Intel Core i7, 16GB RAM, 512GB SSD, Tela 15.6 Full HD"; price = 4299.90; stockQuantity = 15; categoryName = "Eletrônicos"; imageUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300" },
    @{ productName = "Smartphone Samsung Galaxy"; description = "128GB, 6GB RAM, Câmera 48MP, Tela AMOLED"; price = 1899.00; stockQuantity = 30; categoryName = "Eletrônicos"; imageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300" },
    @{ productName = "Tablet Apple iPad"; description = "64GB, WiFi, Tela Retina 10.2"; price = 2599.00; stockQuantity = 20; categoryName = "Eletrônicos"; imageUrl = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300" },
    @{ productName = "Fone Bluetooth Sony"; description = "Cancelamento de ruído, 30h de bateria"; price = 899.90; stockQuantity = 40; categoryName = "Eletrônicos"; imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" },
    @{ productName = "Smart TV Samsung 50"; description = "4K UHD, HDR, Alexa integrada"; price = 2399.00; stockQuantity = 12; categoryName = "Eletrônicos"; imageUrl = "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300" },
    @{ productName = "Console PlayStation 5"; description = "825GB SSD, Controle DualSense"; price = 4599.00; stockQuantity = 8; categoryName = "Eletrônicos"; imageUrl = "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300" },
    
    # Moda
    @{ productName = "Tênis Nike Air Max"; description = "Corrida e caminhada, conforto superior"; price = 599.90; stockQuantity = 50; categoryName = "Moda"; imageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300" },
    @{ productName = "Jaqueta Jeans"; description = "100% algodão, estilo casual"; price = 189.90; stockQuantity = 35; categoryName = "Moda"; imageUrl = "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300" },
    @{ productName = "Relógio Smartwatch"; description = "Monitor cardíaco, GPS, à prova d'água"; price = 799.00; stockQuantity = 25; categoryName = "Moda"; imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300" },
    @{ productName = "Bolsa Feminina Couro"; description = "Couro legítimo, diversos compartimentos"; price = 349.90; stockQuantity = 18; categoryName = "Moda"; imageUrl = "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300" },
    
    # Casa e Decoração
    @{ productName = "Sofá 3 Lugares"; description = "Tecido suede, estrutura de madeira"; price = 1899.00; stockQuantity = 10; categoryName = "Casa e Decoração"; imageUrl = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300" },
    @{ productName = "Mesa de Jantar"; description = "6 lugares, madeira maciça"; price = 1299.00; stockQuantity = 8; categoryName = "Casa e Decoração"; imageUrl = "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=300" },
    @{ productName = "Luminária de Mesa"; description = "LED regulável, design moderno"; price = 159.90; stockQuantity = 30; categoryName = "Casa e Decoração"; imageUrl = "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300" },
    @{ productName = "Tapete Decorativo"; description = "2x1.5m, antialérgico"; price = 299.00; stockQuantity = 22; categoryName = "Casa e Decoração"; imageUrl = "https://images.unsplash.com/photo-1600166898405-da9535204843?w=300" },
    
    # Esportes
    @{ productName = "Bicicleta Mountain Bike"; description = "Aro 29, 21 marchas, freio a disco"; price = 1599.00; stockQuantity = 15; categoryName = "Esportes"; imageUrl = "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=300" },
    @{ productName = "Halteres 10kg"; description = "Par de halteres com revestimento emborrachado"; price = 149.90; stockQuantity = 40; categoryName = "Esportes"; imageUrl = "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300" },
    @{ productName = "Esteira Elétrica"; description = "Dobrável, velocidade até 12km/h"; price = 2299.00; stockQuantity = 7; categoryName = "Esportes"; imageUrl = "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=300" },
    @{ productName = "Bola de Futebol"; description = "Oficial, costurada à mão"; price = 89.90; stockQuantity = 60; categoryName = "Esportes"; imageUrl = "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=300" },
    
    # Livros
    @{ productName = "Clean Code"; description = "Livro sobre código limpo - Robert C. Martin"; price = 79.90; stockQuantity = 45; categoryName = "Livros"; imageUrl = "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300" },
    @{ productName = "O Poder do Hábito"; description = "Charles Duhigg - Desenvolvimento pessoal"; price = 42.90; stockQuantity = 50; categoryName = "Livros"; imageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300" },
    @{ productName = "1984 - George Orwell"; description = "Clássico da literatura distópica"; price = 34.90; stockQuantity = 38; categoryName = "Livros"; imageUrl = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300" },
    
    # Beleza
    @{ productName = "Kit Skincare Completo"; description = "Limpeza, tonificação e hidratação facial"; price = 189.90; stockQuantity = 28; categoryName = "Beleza"; imageUrl = "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300" },
    @{ productName = "Perfume Importado 100ml"; description = "Fragrância masculina amadeirada"; price = 299.00; stockQuantity = 32; categoryName = "Beleza"; imageUrl = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300" },
    @{ productName = "Secador de Cabelo Profissional"; description = "2200W, íons negativos"; price = 249.90; stockQuantity = 20; categoryName = "Beleza"; imageUrl = "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=300" }
)

$count = 0
foreach ($prod in $produtos) {
    try {
        $categoryId = $categoriaIds[$prod.categoryName]
        $produto = @{
            productName = $prod.productName
            description = $prod.description
            price = $prod.price
            stockQuantity = $prod.stockQuantity
            categoryId = $categoryId
            sellerId = $sellerId
            imageUrl = $prod.imageUrl
        }
        
        $body = $produto | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -Headers $headers -Body $body
        $count++
        Write-Host "  ✓ [$count/24] Produto '$($prod.productName)' criado" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Erro ao criar produto '$($prod.productName)'" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 200
}

Write-Host "`n✅ População do banco concluída!" -ForegroundColor Cyan
Write-Host "   - $($categoriaIds.Count) categorias criadas" -ForegroundColor White
Write-Host "   - $count produtos criados" -ForegroundColor White
Write-Host "`n🌐 Acesse: http://localhost:3000" -ForegroundColor Cyan
