# Guia de Consumo das APIs

## 📋 Índice
- [Configuração](#configuração)
- [Produtos](#produtos)
- [Categorias](#categorias)
- [Usuários](#usuários)
- [Carrinho](#carrinho)
- [Exemplos Práticos](#exemplos-práticos)

## ⚙️ Configuração

A URL base da API já está configurada em `src/service/api.js`:

```javascript
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api'
```

Certifique-se de que seu backend está rodando em `http://localhost:8080`.

## 🛍️ Produtos

### Importar o serviço
```javascript
import productService from '../service/productService';
```

### Listar todos os produtos
```javascript
const products = await productService.getAllProducts();
```

### Buscar produto por ID
```javascript
const product = await productService.getProductById(1);
```

### Criar novo produto
```javascript
const newProduct = await productService.createProduct({
  name: "Notebook Gamer",
  description: "i7, 16GB RAM, RTX 3060",
  price: 5999.90,
  stockQuantity: 10,
  categoryId: 1,
  sellerId: 1
});
```

### Atualizar produto
```javascript
const updated = await productService.updateProduct(1, {
  name: "Notebook Gamer Atualizado",
  description: "i7, 32GB RAM, RTX 4060",
  price: 6999.90,
  stockQuantity: 5,
  categoryId: 1,
  sellerId: 1
});
```

### Listar produtos por categoria
```javascript
const products = await productService.getProductsByCategory(1);
```

### Deletar produto
```javascript
await productService.deleteProduct(1);
```

## 📁 Categorias

### Importar o serviço
```javascript
import categoryService from '../service/categoryService';
```

### Listar todas as categorias
```javascript
const categories = await categoryService.getAllCategories();
```

### Criar nova categoria
```javascript
const newCategory = await categoryService.createCategory({
  name: "Eletrônicos",
  description: "Produtos eletrônicos diversos"
});
```

### Buscar categoria por nome
```javascript
const category = await categoryService.getCategoryByName("Eletrônicos");
```

### Atualizar categoria
```javascript
const updated = await categoryService.updateCategory(1, {
  name: "Eletrônicos e Informática",
  description: "Eletrônicos e produtos de informática"
});
```

### Verificar se categoria existe
```javascript
const exists = await categoryService.existsByName("Eletrônicos");
```

## 👤 Usuários

### Importar o serviço
```javascript
import userService from '../service/userService';
```

### Criar novo usuário
```javascript
const newUser = await userService.createUser({
  name: "João Silva",
  email: "joao@example.com",
  password: "senha123",
  role: "CUSTOMER" // ou "SELLER", "ADMIN"
});
```

### Buscar usuário por email
```javascript
const user = await userService.getUserByEmail("joao@example.com");
```

### Listar todos os usuários
```javascript
const users = await userService.getAllUsers();
```

### Atualizar usuário
```javascript
const updated = await userService.updateUser(1, {
  name: "João Silva Santos",
  email: "joao.santos@example.com",
  password: "novaSenha123",
  role: "CUSTOMER"
});
```

## 🛒 Carrinho

### Importar o serviço
```javascript
import cartService from '../service/cartService';
```

### Adicionar item ao carrinho
```javascript
const cartItem = await cartService.addItem({
  userId: 1,
  productId: 5,
  quantity: 2
});
```

### Listar itens do carrinho
```javascript
const items = await cartService.getCartItems(1); // userId
```

### Atualizar quantidade
```javascript
const updated = await cartService.updateItemQuantity(1, 5); // itemId, quantity
```

### Remover item do carrinho
```javascript
await cartService.removeItem(1); // itemId
```

## 💡 Exemplos Práticos

### Exemplo 1: Carregar produtos ao abrir a página
```javascript
import { useState, useEffect } from 'react';
import productService from '../service/productService';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Erro ao carregar produtos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Exemplo 2: Adicionar produto ao carrinho
```javascript
import cartService from '../service/cartService';

function AddToCartButton({ productId, userId }) {
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await cartService.addItem({
        userId: userId,
        productId: productId,
        quantity: 1
      });
      alert('Produto adicionado ao carrinho!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao adicionar produto');
    } finally {
      setAdding(false);
    }
  };

  return (
    <button onClick={handleAddToCart} disabled={adding}>
      {adding ? 'Adicionando...' : 'Adicionar ao Carrinho'}
    </button>
  );
}
```

### Exemplo 3: Filtrar produtos por categoria
```javascript
import { useState, useEffect } from 'react';
import productService from '../service/productService';
import categoryService from '../service/categoryService';

function ProductsByCategory() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await categoryService.getAllCategories();
    setCategories(data);
  };

  const loadProductsByCategory = async (categoryId) => {
    setSelectedCategory(categoryId);
    const data = await productService.getProductsByCategory(categoryId);
    setProducts(data);
  };

  return (
    <div>
      <h2>Selecione uma categoria:</h2>
      {categories.map(cat => (
        <button 
          key={cat.id} 
          onClick={() => loadProductsByCategory(cat.id)}
        >
          {cat.name}
        </button>
      ))}
      
      <div>
        {products.map(product => (
          <div key={product.id}>{product.name} - R$ {product.price}</div>
        ))}
      </div>
    </div>
  );
}
```

### Exemplo 4: Tratamento de erros
```javascript
import productService from '../service/productService';

async function createProduct(productData) {
  try {
    const newProduct = await productService.createProduct(productData);
    console.log('Produto criado:', newProduct);
    return newProduct;
  } catch (error) {
    if (error.response) {
      // O servidor respondeu com um código de erro
      console.error('Erro na resposta:', error.response.status);
      console.error('Mensagem:', error.response.data);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Sem resposta do servidor');
    } else {
      // Erro ao configurar a requisição
      console.error('Erro:', error.message);
    }
    throw error;
  }
}
```

## 🚀 Próximos Passos

1. **Implemente autenticação**: Crie um contexto de autenticação para gerenciar o usuário logado
2. **Adicione interceptors**: Configure interceptors no axios para adicionar tokens JWT
3. **Crie hooks customizados**: Como `useProducts()`, `useCart()` para reutilizar lógica
4. **Adicione loading states**: Implemente skeletons e spinners
5. **Implemente cache**: Use React Query ou SWR para cache de dados

## 📝 Notas Importantes

- Sempre trate erros com try/catch
- Use estados de loading para melhor UX
- Valide dados antes de enviar para a API
- Configure CORS no backend se necessário
- Mantenha a URL da API em variáveis de ambiente
