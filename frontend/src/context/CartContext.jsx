import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../service/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  // CORREÇÃO 1: loadCart agora é PURAMENTE para buscar dados.
  // Removemos a lógica de "else { setCartItems([]) }" daqui de dentro.
  // Se não tem user, ela retorna void sem disparar nenhum setState.
  const loadCart = useCallback(async () => {
    const userId = user?.id || user?.user_ID || user?.userId;
    
    // Se não tem usuário, PARE. Não limpe o estado aqui.
    if (!userId) return;
    
    try {
      const items = await cartService.getCartItems(userId);
      setCartItems(items);
      setCartCount(items.reduce((total, item) => total + (Number(item.quantity) || 0), 0));
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  }, [user]);

  // CORREÇÃO 2: O useEffect gerencia o ciclo de vida (Login vs Logout)
  useEffect(() => {
    const userId = user?.id || user?.user_ID || user?.userId;

    if (userId) {
      // Se tem usuário, chama a função Async (permitido)
      loadCart();
    } else {
      // Se NÃO tem usuário (Logout ou Load inicial), limpamos o estado AQUI.
      // Usamos a checagem 'prev.length > 0' para garantir que o React
      // ignore essa atualização se o carrinho já estiver vazio.
      setCartItems(prev => (prev.length > 0 ? [] : prev));
      setCartCount(prev => (prev > 0 ? 0 : prev));
    }
  }, [user, loadCart]);

  const addToCart = async (productId, quantity = 1) => {
    const userId = user?.id || user?.user_ID || user?.userId;

    if (!userId) {
      alert('Faça login para adicionar produtos ao carrinho');
      return false;
    }

    try {
      await cartService.addItem({
        userId: userId,
        productId: productId,
        quantity: quantity
      });
      await loadCart();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartService.removeItem(itemId);
      await loadCart();
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await cartService.updateItemQuantity(itemId, quantity);
      await loadCart();
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      throw error;
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}