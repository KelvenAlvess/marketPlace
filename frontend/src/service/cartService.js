import api from './api';

const cartService = {
  // Adicionar item ao carrinho
  addItem: async (cartItemData) => {
    const response = await api.post('/cart-items', cartItemData);
    return response.data;
  },

  // Atualizar quantidade de item
  updateQuantity: async (id, quantity) => {
    const response = await api.put(`/cart-items/${id}/quantity`, { quantity });
    return response.data;
  },

  // Remover item do carrinho
  removeItem: async (id) => {
    await api.delete(`/cart-items/${id}`);
  },

  // Listar itens do carrinho do usuário
  getCartItems: async (userId) => {
    const response = await api.get(`/cart-items/user/${userId}`);
    return response.data;
  },

  // Limpar carrinho do usuário
  clearCart: async (userId) => {
    await api.delete(`/cart-items/user/${userId}`);
  }
};

export default cartService;
