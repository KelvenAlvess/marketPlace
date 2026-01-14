import { createContext, useContext, useState, useEffect } from 'react';
import userService from '../service/userService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Buscar usuário por email
      const userData = await userService.getUserByEmail(email);
      
      // Por enquanto, aceita qualquer senha já que o backend não retorna a senha
      // Em produção, você precisaria de um endpoint de login que valide a senha no backend
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: 'Usuário não encontrado' };
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error.response?.status === 404) {
        return { success: false, error: 'Email não encontrado' };
      }
      return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
    }
  };

  const register = async (userData) => {
    try {
      // Verificar se email já existe
      const emailExists = await userService.existsByEmail(userData.email);
      if (emailExists) {
        return { success: false, error: 'Email já cadastrado' };
      }

      // Criar novo usuário
      const newUser = await userService.createUser({
        userName: userData.name,
        email: userData.email,
        password: userData.password,
        cpf: userData.cpf,
        phoneNumber: userData.phone,
        address: userData.address,
        roles: ["BUYER"] // Usuário padrão como comprador
      });

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return { success: false, error: 'Erro ao criar conta. Verifique os dados.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated
    }}>
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
