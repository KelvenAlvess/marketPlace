# Script para Popular o Banco de Dados

## Opção 1: Via Swagger UI
Acesse: http://localhost:8080/swagger-ui.html

## Opção 2: Via PowerShell (execute no terminal)

### 1. Criar uma Categoria
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/categories" -Method Post -ContentType "application/json" -Body '{
  "name": "Eletrônicos",
  "description": "Produtos eletrônicos e de informática"
}'
```

### 2. Criar um Usuário (Vendedor)
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method Post -ContentType "application/json" -Body '{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "role": "SELLER"
}'
```

### 3. Criar Produtos (ajuste categoryId e sellerId conforme criados acima)
```powershell
# Produto 1
Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Post -ContentType "application/json" -Body '{
  "name": "Notebook Dell",
  "description": "Intel Core i5, 8GB RAM, 256GB SSD",
  "price": 3499.90,
  "stockQuantity": 10,
  "categoryId": 1,
  "sellerId": 1
}'

# Produto 2
Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Post -ContentType "application/json" -Body '{
  "name": "Mouse Gamer",
  "description": "RGB, 12000 DPI, 7 botões programáveis",
  "price": 149.90,
  "stockQuantity": 25,
  "categoryId": 1,
  "sellerId": 1
}'

# Produto 3
Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Post -ContentType "application/json" -Body '{
  "name": "Teclado Mecânico",
  "description": "Switch Blue, RGB, ABNT2",
  "price": 299.90,
  "stockQuantity": 15,
  "categoryId": 1,
  "sellerId": 1
}'

# Produto 4
Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Post -ContentType "application/json" -Body '{
  "name": "Monitor 24 polegadas",
  "description": "Full HD, 144Hz, IPS",
  "price": 899.90,
  "stockQuantity": 8,
  "categoryId": 1,
  "sellerId": 1
}'

# Produto 5
Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Post -ContentType "application/json" -Body '{
  "name": "Headset Gamer",
  "description": "Som surround 7.1, LED RGB",
  "price": 249.90,
  "stockQuantity": 20,
  "categoryId": 1,
  "sellerId": 1
}'

# Produto 6
Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Post -ContentType "application/json" -Body '{
  "name": "Webcam HD",
  "description": "1080p, 30fps, Microfone integrado",
  "price": 199.90,
  "stockQuantity": 12,
  "categoryId": 1,
  "sellerId": 1
}'
```

### 4. Verificar produtos criados
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Get
```

## Opção 3: Script Completo (copie e cole tudo de uma vez)

```powershell
# Criar categoria
$category = Invoke-RestMethod -Uri "http://localhost:8080/api/categories" -Method Post -ContentType "application/json" -Body '{"name": "Eletrônicos", "description": "Produtos eletrônicos e de informática"}'
Write-Host "Categoria criada: $($category.id)"

# Criar usuário vendedor
$user = Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method Post -ContentType "application/json" -Body '{"name": "João Silva", "email": "joao@example.com", "password": "senha123", "role": "SELLER"}'
Write-Host "Usuário criado: $($user.id)"

# Array de produtos
$produtos = @(
    @{name="Notebook Dell"; description="Intel Core i5, 8GB RAM, 256GB SSD"; price=3499.90; stock=10},
    @{name="Mouse Gamer"; description="RGB, 12000 DPI, 7 botões programáveis"; price=149.90; stock=25},
    @{name="Teclado Mecânico"; description="Switch Blue, RGB, ABNT2"; price=299.90; stock=15},
    @{name="Monitor 24 polegadas"; description="Full HD, 144Hz, IPS"; price=899.90; stock=8},
    @{name="Headset Gamer"; description="Som surround 7.1, LED RGB"; price=249.90; stock=20},
    @{name="Webcam HD"; description="1080p, 30fps, Microfone integrado"; price=199.90; stock=12}
)

# Criar produtos
foreach ($p in $produtos) {
    $body = @{
        name = $p.name
        description = $p.description
        price = $p.price
        stockQuantity = $p.stock
        categoryId = $category.id
        sellerId = $user.id
    } | ConvertTo-Json
    
    $produto = Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Post -ContentType "application/json" -Body $body
    Write-Host "Produto criado: $($produto.productName)"
}

Write-Host "`nTodos os produtos foram criados com sucesso!"
```
