# Script simplificado para popular banco de dados
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
    Write-Host "⚠ Usuário já existe, tentando login..." -ForegroundColor Yellow
}

# Fazer login
$loginData = @{
    email = "maria.vendedora@example.com"
    password = "senha123"
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body $loginData
    $token = $loginResult.token
    $sellerId = $loginResult.userId
    Write-Host "✓ Login OK! Seller ID: $sellerId" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro no login: $_" -ForegroundColor Red
    Write-Host "Detalhes: $($_.Exception.Response)" -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Usar categorias já existentes
Write-Host "`n📦 Buscando categorias existentes..." -ForegroundColor Cyan
try {
    $categorias = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Get
    Write-Host "✓ Encontradas $($categorias.Count) categorias" -ForegroundColor Green
    
    if ($categorias.Count -eq 0) {
        Write-Host "⚠ Nenhuma categoria encontrada! Crie categorias primeiro." -ForegroundColor Yellow
        exit
    }
} catch {
    Write-Host "✗ Erro ao buscar categorias: $_" -ForegroundColor Red
    exit
}

# Mapear categorias por nome
$catMap = @{}
foreach ($cat in $categorias) {
    $catMap[$cat.name] = $cat.category_ID
}

Write-Host "`n🛍️ Criando produtos..." -ForegroundColor Cyan

# Produtos de teste com múltiplas imagens
$produtos = @(
    @{ 
        name = "Notebook Dell"; 
        desc = "i7, 16GB, 512GB SSD"; 
        price = 4299.90; 
        stock = 15; 
        cat = "Eletrônicos";
        images = @(
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400",
            "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400"
        )
    },
    @{ 
        name = "iPhone 13"; 
        desc = "128GB, 5G"; 
        price = 4999.00; 
        stock = 20; 
        cat = "Eletrônicos";
        images = @(
            "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400",
            "https://images.unsplash.com/photo-1592286927505-697ac14bddc1?w=400",
            "https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?w=400"
        )
    },
    @{ 
        name = "Tênis Nike"; 
        desc = "Running, tamanho 42"; 
        price = 499.90; 
        stock = 30; 
        cat = "Moda";
        images = @(
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400"
        )
    },
    @{ 
        name = "Jaqueta Jeans"; 
        desc = "Azul, tamanho M"; 
        price = 189.90; 
        stock = 25; 
        cat = "Moda";
        images = @(
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
            "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400",
            "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400"
        )
    },
    @{ 
        name = "Sofá 3 Lugares"; 
        desc = "Cinza, tecido suede"; 
        price = 1899.00; 
        stock = 8; 
        cat = "Casa e Decoração";
        images = @(
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
            "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=400"
        )
    },
    @{ 
        name = "Mesa Jantar"; 
        desc = "6 lugares, madeira"; 
        price = 1299.00; 
        stock = 5; 
        cat = "Casa e Decoração";
        images = @(
            "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400",
            "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400",
            "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400"
        )
    },
    @{ 
        name = "Bicicleta MTB"; 
        desc = "Aro 29, 21 marchas"; 
        price = 1599.00; 
        stock = 12; 
        cat = "Esportes";
        images = @(
            "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400",
            "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400",
            "https://images.unsplash.com/photo-1617546742984-0f89db7d3a3d?w=400"
        )
    },
    @{ 
        name = "Halteres 10kg"; 
        desc = "Par emborrachado"; 
        price = 149.90; 
        stock = 40; 
        cat = "Esportes";
        images = @(
            "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400",
            "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400",
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400"
        )
    },
    @{ 
        name = "Clean Code"; 
        desc = "Livro Robert C. Martin"; 
        price = 79.90; 
        stock = 50; 
        cat = "Livros";
        images = @(
            "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"
        )
    },
    @{ 
        name = "1984"; 
        desc = "George Orwell"; 
        price = 34.90; 
        stock = 35; 
        cat = "Livros";
        images = @(
            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
            "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400"
        )
    },
    @{ 
        name = "Kit Skincare"; 
        desc = "Limpeza + hidratação"; 
        price = 189.90; 
        stock = 28; 
        cat = "Beleza";
        images = @(
            "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400",
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400"
        )
    },
    @{ 
        name = "Perfume 100ml"; 
        desc = "Fragrância amadeirada"; 
        price = 299.00; 
        stock = 32; 
        cat = "Beleza";
        images = @(
            "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
            "https://images.unsplash.com/photo-1588405748880-12d1d2a59926?w=400",
            "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400"
        )
    }
)

$created = 0
foreach ($p in $produtos) {
    $catId = $catMap[$p.cat]
    
    if (-not $catId) {
        Write-Host "  ⚠ Categoria '$($p.cat)' não encontrada para '$($p.name)'" -ForegroundColor Yellow
        continue
    }
    
    # Juntar imagens com vírgula
    $imageUrls = $p.images -join ","
    
    $produto = @{
        productName = $p.name
        description = $p.desc
        price = $p.price
        stockQuantity = $p.stock
        categoryId = $catId
        sellerId = $sellerId
        imageUrl = $imageUrls
    } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -Headers $headers -Body $produto
        $created++
        Write-Host "  ✓ [$created] $($p.name) - R$ $($p.price)" -ForegroundColor Green
    } catch {
        $errorMsg = $_.ErrorDetails.Message
        Write-Host "  ✗ Erro em '$($p.name)': $errorMsg" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 300
}

Write-Host "`n✅ Concluído! $created produtos criados." -ForegroundColor Cyan
Write-Host "🌐 Acesse: http://localhost:3000" -ForegroundColor Cyan
