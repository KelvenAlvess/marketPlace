import api from './api';

const productService = {
  // Criar novo produto
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Buscar produto por ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Listar todos os produtos
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // Listar produtos por categoria
  getProductsByCategory: async (categoryId) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  // Listar produtos por vendedor
  getProductsBySeller: async (sellerId) => {
    const response = await api.get(`/products/seller/${sellerId}`);
    return response.data;
  },

  // Atualizar produto
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Atualizar estoque
  updateStock: async (id, quantity) => {
    const response = await api.patch(`/products/${id}/stock`, { quantity });
    return response.data;
  },

  // Deletar produto
  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
  }
};

export default productService;
