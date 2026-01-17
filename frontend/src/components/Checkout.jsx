import { useState } from 'react';
import { useCart } from '../context/CartContext';

function Checkout({ onNavigate }) {
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  
  console.log('🛒 Checkout - cartItems:', cartItems);
  console.log('📦 Checkout - total items:', cartItems?.length);
  
  const [shippingData, setShippingData] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  // Calcular valores com tratamento seguro
  const subtotal = Array.isArray(cartItems) 
    ? cartItems.reduce((sum, item) => {
        const price = item?.price || 0;
        const quantity = item?.quantity || 0;
        return sum + (price * quantity);
      }, 0)
    : 0;
  const shipping = subtotal > 200 ? 0 : 15.00;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    
    try {
      // Aqui você faria a chamada ao backend para criar o pedido
      // await orderService.createOrder({ items: cartItems, shipping: shippingData, paymentMethod })
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Limpar carrinho
      await clearCart();
      
      // Redirecionar para página de sucesso
      alert('Pedido realizado com sucesso! 🎉');
      onNavigate('home');
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Carrinho vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos ao carrinho para finalizar o pedido</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar às compras
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar às compras
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Pedido</h1>
          <p className="text-gray-600 mt-2">Revise seu pedido e complete as informações</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulários */}
          <div className="lg:col-span-2 space-y-6">
            {/* Endereço de Entrega */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Endereço de Entrega
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                  <input
                    type="text"
                    name="cep"
                    value={shippingData.cep}
                    onChange={handleInputChange}
                    placeholder="00000-000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
                  <input
                    type="text"
                    name="street"
                    value={shippingData.street}
                    onChange={handleInputChange}
                    placeholder="Nome da rua"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    name="number"
                    value={shippingData.number}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                  <input
                    type="text"
                    name="complement"
                    value={shippingData.complement}
                    onChange={handleInputChange}
                    placeholder="Apto, bloco..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={shippingData.neighborhood}
                    onChange={handleInputChange}
                    placeholder="Centro"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingData.city}
                    onChange={handleInputChange}
                    placeholder="São Paulo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    name="state"
                    value={shippingData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    {/* Adicionar outros estados conforme necessário */}
                  </select>
                </div>
              </div>
            </div>

            {/* Método de Pagamento */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Forma de Pagamento
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'PIX', name: 'PIX', icon: '💳', description: 'Aprovação imediata' },
                  { id: 'CREDIT_CARD', name: 'Cartão de Crédito', icon: '💳', description: 'Parcelamento disponível' },
                  { id: 'DEBIT_CARD', name: 'Cartão de Débito', icon: '💳', description: 'Débito na conta' },
                  { id: 'BANK_TRANSFER', name: 'Transferência', icon: '🏦', description: 'TED/DOC' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      paymentMethod === method.id
                        ? 'border-red-600 bg-red-50 ring-2 ring-red-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{method.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>

              {/* Lista de Produtos */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.cartItem_ID} className="flex gap-3 pb-4 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <img
                        src="https://via.placeholder.com/64"
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                      <p className="text-sm font-semibold text-gray-900">
                        R$ {((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Frete</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Grátis</span>
                    ) : (
                      `R$ ${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-red-600">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Botão Finalizar */}
              <button
                onClick={handleConfirmOrder}
                disabled={loading || !shippingData.street || !shippingData.city}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirmar Pedido
                  </>
                )}
              </button>

              {/* Selos de Segurança */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Compra Segura</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                    <span>Entrega Rápida</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
