import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import userService from '../service/userService';
import api from '../service/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // 1. Inicialização do Estado
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser || savedUser === 'undefined') return null;
    try {
      return JSON.parse(savedUser);
    } catch (error) {
      localStorage.removeItem('user');
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // 2. Função de Logout (precisa ser useCallback para usar no interceptor)
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    // Opcional: Redirecionar para login
    window.location.href = '/login';
  }, []);

  // 3. Configuração Inicial e Interceptor de Expiração
  useEffect(() => {
    const savedToken = localStorage.getItem('token');

    if (savedToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }

    // INTERCEPTOR: Se o backend devolver 401/403 (Token inválido/expirado), desloga.
    const interceptorId = api.interceptors.response.use(
        response => response,
        error => {
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Sessão expirada. Deslogando...");
            logout();
          }
          return Promise.reject(error);
        }
    );

    // Remove o interceptor quando o componente desmontar
    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [logout]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await userService.login(email, password);

      const { token, ...userData } = response;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Email ou senha inválidos' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const roles = userData.role === 'SELLER' ? ['SELLER', 'BUYER'] : ['BUYER'];

      const newUserConfig = {
        userName: userData.name,
        email: userData.email,
        password: userData.password,
        cpf: userData.cpf,
        phoneNumber: userData.phone,
        address: userData.address,
        roles: roles
      };

      await userService.createUser(newUserConfig);
      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      const msg = error.response?.data?.message || 'Erro ao criar conta.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // 4. NOVA FUNÇÃO: Atualiza dados do usuário localmente
  // Útil quando o Checkout atualiza o endereço/telefone
  const updateUserLocal = (updatedData) => {
    setUser(prevUser => {
      const newUser = { ...prevUser, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  // 5. Helpers de Verificação
  const isAuthenticated = () => !!user && !!localStorage.getItem('token');

  const hasRole = (role) => user?.roles?.includes(role);

  return (
      <AuthContext.Provider value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserLocal, // Exposta para usar no Checkout
        isAuthenticated,
        hasRole
      }}>
        {children}
      </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}