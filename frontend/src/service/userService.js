import api from './api';

const userService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Criar novo usuário
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Buscar usuário por ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Buscar usuário por email
  getUserByEmail: async (email) => {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  },

  // Listar todos os usuários
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Atualizar usuário
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Deletar usuário
  deleteUser: async (id) => {
    await api.delete(`/users/${id}`);
  },

  // Verificar se email existe
  existsByEmail: async (email) => {
    const response = await api.get(`/users/exists/${email}`);
    return response.data;
  }
};

export default userService;
