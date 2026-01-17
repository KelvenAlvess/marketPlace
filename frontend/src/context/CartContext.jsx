/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../service/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  const loadCart = useCallback(async () => {
    if (!user?.user_ID) return;
    
    try {
      const items = await cartService.getCartItems(user.user_ID);
      setCartItems(items);
      setCartCount(items.reduce((total, item) => total + item.quantity, 0));
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      // Não fazer nada em caso de erro para não quebrar a aplicação
    }
  }, [user]);

  // Carregar itens do carrinho quando usuário estiver logado
  useEffect(() => {
    if (user?.user_ID) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadCart();
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, [user, loadCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user?.user_ID) {
      // Toast ou notificação mais elegante
      const event = new CustomEvent('show-login-modal');
      window.dispatchEvent(event);
      return false;
    }

    try {
      await cartService.addItem({
        userId: user.user_ID,
        productId: productId,
        quantity: quantity
      });
      await loadCart(); // Recarregar carrinho
      
      // Feedback de sucesso
      console.log('Produto adicionado ao carrinho com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      alert('Erro ao adicionar produto ao carrinho. Tente novamente.');
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
      await cartService.updateQuantity(itemId, quantity);
      await loadCart();
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user?.user_ID) return;
    
    try {
      await cartService.clearCart(user.user_ID);
      setCartItems([]);
      setCartCount(0);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      throw error;
    }
  };

  const value = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}