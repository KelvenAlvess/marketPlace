import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook de navegação
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../service/orderService';

function Cart({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, loadCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate(); // Instância do navegador

  const [removingItems, setRemovingItems] = useState(new Set());
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  if (!isOpen) return null;

  const handleRemoveItem = async (itemId) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.subtotal || 0), 0);
  };

  // Lógica alterada: Cria pedido -> Redireciona para página dedicada
  const handleFinalizeOrder = async () => {
    if (!user) {
      alert("Faça login para finalizar a compra.");
      return;
    }

    try {
      setIsCreatingOrder(true);

      const userId = user.userId || user.user_ID || user.id;
      // 1. Cria o pedido no Backend
      const orderData = await orderService.createOrder({ userId });

      // 2. Atualiza o carrinho local (que agora estará vazio)
      await loadCart();

      // 3. Fecha a sidebar do carrinho
      onClose();

      // 4. Redireciona para a nova página de Checkout com o ID do pedido
      navigate(`/checkout/${orderData.orderId}`);

    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      alert("Erro ao processar o pedido. Tente novamente.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="fixed inset-y-0 right-0 max-w-full flex">
          <div className="w-screen max-w-md transform transition ease-in-out duration-500 sm:duration-700 bg-white shadow-xl flex flex-col h-full">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-6 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Carrinho de Compras</h2>
              <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
                <span className="sr-only">Fechar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              {cartItems.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">
                    <p>Seu carrinho está vazio</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.cartItem_ID} className="flex gap-4 py-4 border-b border-gray-100 animate-fadeIn">
                          <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            <img
                                src={item.productImage || 'https://via.placeholder.com/150'}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-base font-medium text-gray-900">{item.productName}</h3>
                              <p className="text-sm text-gray-500">Un: R$ {item.price?.toFixed(2)}</p>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                    onClick={() => handleQuantityChange(item.cartItem_ID, item.quantity - 1)}
                                >
                                  -
                                </button>
                                <span className="px-2 py-1 text-gray-900 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                                <button
                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                    onClick={() => handleQuantityChange(item.cartItem_ID, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                  className={`text-sm font-medium text-red-600 hover:text-red-500 ${removingItems.has(item.cartItem_ID) ? 'opacity-50 cursor-wait' : ''}`}
                                  onClick={() => handleRemoveItem(item.cartItem_ID)}
                                  disabled={removingItems.has(item.cartItem_ID)}
                              >
                                {removingItems.has(item.cartItem_ID) ? 'Removendo...' : 'Remover'}
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                      <span className="font-bold text-gray-800">
                        R$ {item.subtotal?.toFixed(2)}
                      </span>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>

            {/* Footer */}
            {user && cartItems.length > 0 && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-red-600">
                  R$ {calculateTotal().toFixed(2)}
                </span>
                  </div>

                  <button
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 flex justify-center items-center"
                      onClick={handleFinalizeOrder}
                      disabled={isCreatingOrder}
                  >
                    {isCreatingOrder ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processando...
                        </>
                    ) : 'Finalizar Pedido'}
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default Cart;