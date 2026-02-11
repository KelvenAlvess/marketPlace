import api from './api';

const categoryService = {
  // Criar nova categoria
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Buscar categoria por ID
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Buscar categoria por nome
  getCategoryByName: async (name) => {
    const response = await api.get(`/categories/name/${name}`);
    return response.data;
  },

  // Listar todas as categorias
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Atualizar categoria
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Deletar categoria
  deleteCategory: async (id) => {
    await api.delete(`/categories/${id}`);
  },

  // Verificar se categoria existe
  existsByName: async (name) => {
    const response = await api.get(`/categories/exists/${name}`);
    return response.data;
  }
};

export default categoryService;
