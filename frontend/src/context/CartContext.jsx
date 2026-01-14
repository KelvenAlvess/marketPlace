import { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../service/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  // Carregar itens do carrinho quando usuário estiver logado
  useEffect(() => {
    if (user?.user_ID) {
      loadCart();
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user?.user_ID) return;
    
    try {
      const items = await cartService.getCartItems(user.user_ID);
      setCartItems(items);
      setCartCount(items.reduce((total, item) => total + item.quantity, 0));
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user?.user_ID) {
      alert('Faça login para adicionar produtos ao carrinho');
      return false;
    }

    try {
      await cartService.addItem({
        userId: user.user_ID,
        productId: productId,
        quantity: quantity
      });
      await loadCart(); // Recarregar carrinho
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

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}
