/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Criar instância axios sem interceptors para operações públicas
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Inicializar estado a partir do localStorage
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      return JSON.parse(savedUser);
    }
    return null;
  });

  const login = async (email, password) => {
    try {
      // Fazer login usando axios direto (sem interceptors)
      const response = await publicApi.post('/auth/login', { 
        email, 
        password 
      });
      
      const data = response.data;
      
      console.log('📥 Resposta do login:', data);
      console.log('🎫 Token recebido:', data.token ? 'Presente' : 'Ausente');
      
      // Salvar token e dados do usuário
      localStorage.setItem('token', data.token);
      const userData = {
        user_ID: data.userId,
        userName: data.userName,
        email: data.email,
        roles: data.roles
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('💾 Token salvo no localStorage');
      console.log('👤 Dados do usuário salvos:', userData);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error.response?.status === 401) {
        return { success: false, error: 'Email ou senha incorretos' };
      }
      if (error.response?.status === 404) {
        return { success: false, error: 'Usuário não encontrado' };
      }
      return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
    }
  };

  const register = async (userData) => {
    try {
      // Criar usuário usando axios direto (sem token - endpoint público)
      await publicApi.post('/users', {
        userName: userData.name,
        email: userData.email,
        password: userData.password,
        cpf: userData.cpf,
        phoneNumber: userData.phone,
        address: userData.address,
        roles: userData.roles || ["BUYER"]
      });

      // Após criar usuário, fazer login automaticamente
      return await login(userData.email, userData.password);
    } catch (error) {
      console.error('Erro ao registrar:', error);
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      if (error.response?.status === 400) {
        return { success: false, error: 'Dados inválidos. Verifique as informações.' };
      }
      return { success: false, error: 'Erro ao criar conta. Tente novamente.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}