import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../service/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('marketplace_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  const [cartCount, setCartCount] = useState(() => {
    return cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  });

  useEffect(() => {
    localStorage.setItem('marketplace_cart', JSON.stringify(cartItems));

    const count = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
    setCartCount(count);
  }, [cartItems]);

  const loadCart = useCallback(async () => {
    const userId = user?.id || user?.user_ID || user?.userId;

    if (!userId) return;

    try {
      const items = await cartService.getCartItems(userId);
      setCartItems(items);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      // Não fazer nada em caso de erro para não quebrar a aplicação
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

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
      alert('Erro ao adicionar produto ao carrinho. Tente novamente.');
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setCartItems(prev => prev.filter(item => (item.cartItemId || item.id) !== itemId));

      await cartService.removeItem(itemId);
      await loadCart(); // Confirma com o backend
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
      loadCart();
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

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}