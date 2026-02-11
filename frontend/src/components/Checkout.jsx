import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import paymentService from '../service/paymentService';
import userService from '../service/userService';
import orderService from '../service/orderService.js';
import api from '../service/api';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

// Importa o CSS customizado para garantir visibilidade
import './Payment.css';

// Inicializa o SDK
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'pt-BR' });

function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, updateUserLocal } = useAuth();

  const [orderData, setOrderData] = useState(null);
  const [fetchingOrder, setFetchingOrder] = useState(true);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [paymentType, setPaymentType] = useState('card');

  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  const [formData, setFormData] = useState({
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cpf: '',
    phone: ''
  });

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        setFetchingOrder(true);
        const data = await orderService.getOrderById(orderId);
        setOrderData(data);
      } catch (err) {
        console.error("Erro ao buscar pedido:", err);
        setError("Não foi possível carregar os detalhes do pedido.");
      } finally {
        setFetchingOrder(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        street: user.address || '',
        cpf: user.cpf || '',
        phone: user.phoneNumber || ''
      }));
    }
  }, [user]);

  // CORREÇÃO 1: Lógica de cálculo robusta para evitar dupla cobrança de frete
  const getTotalWithShipping = () => {
    if (!orderData) return 0;

    // Se temos itens, calculamos o subtotal dos itens e somamos o frete selecionado
    if (orderData.items && orderData.items.length > 0) {
      const itemsSubtotal = orderData.items.reduce((acc, item) => acc + item.subtotal, 0);
      const shipping = selectedShipping ? Number(selectedShipping.price) : 0;
      return itemsSubtotal + shipping;
    }

    // Fallback: Se não conseguir calcular pelos itens, usa o total do pedido (que já inclui frete do banco)
    return Number(orderData.totalAmount) || 0;
  };

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        setLoading(true);
        setCalculatingShipping(true);
        const responseEnd = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dataEnd = await responseEnd.json();
        if (!dataEnd.erro) {
          setFormData(prev => ({
            ...prev,
            street: dataEnd.logradouro,
            neighborhood: dataEnd.bairro,
            city: dataEnd.localidade,
            state: dataEnd.uf
          }));
        }

        const responseShipping = await api.get(`/shipping/calculate/${cep}`);
        setShippingOptions(responseShipping.data);

        if (responseShipping.data.length > 0) {
          setSelectedShipping(responseShipping.data[0]);
        } else {
          setSelectedShipping(null);
        }

      } catch (err) {
        console.error("Erro ao buscar CEP/Frete", err);
        setError("Erro ao calcular frete. Verifique o CEP.");
      } finally {
        setLoading(false);
        setCalculatingShipping(false);
      }
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    if (!selectedShipping) {
      setError("Por favor, calcule e selecione uma opção de frete.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullAddress = `${formData.street}, ${formData.number} - ${formData.neighborhood}, ${formData.city}/${formData.state} - CEP: ${formData.zipCode}`;
      const cleanCpf = formData.cpf.replace(/\D/g, '');
      const cleanPhone = formData.phone.replace(/\D/g, '');

      if (cleanCpf.length !== 11) throw new Error("CPF deve ter 11 dígitos.");

      const updatePayload = {
        userName: user.userName || user.name,
        email: user.email,
        cpf: cleanCpf,
        phoneNumber: cleanPhone,
        password: null,
        address: fullAddress,
        roles: user.roles
      };

      await userService.updateUser(user.userId || user.user_ID, updatePayload);

      if (updateUserLocal) {
        updateUserLocal({
          cpf: cleanCpf,
          phoneNumber: cleanPhone,
          address: fullAddress
        });
      }

      if (orderId) {
        // Atualiza o frete no backend
        await api.patch(`/orders/${orderId}/shipping`, {
          shippingCost: selectedShipping.price
        });
        // Recarrega o pedido para garantir consistência
        const updatedOrder = await orderService.getOrderById(orderId);
        setOrderData(updatedOrder);
      }

      setStep(2);

    } catch (err) {
      console.error("Erro ao processar etapa de entrega:", err);
      const msg = err.response?.data?.errors
          ? Object.values(err.response.data.errors).join(", ")
          : (err.message || "Erro ao salvar dados.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSubmit = async (cardFormData) => {
    return new Promise(async (resolve, reject) => {
      try {
        setLoading(true);
        setError('');

        const methodId = cardFormData.paymentMethodId || cardFormData.payment_method_id;
        // Pega as parcelas ou assume 1
        const installments = cardFormData.installments ? Number(cardFormData.installments) : 1;

        const payload = {
          orderId: orderData.orderId,
          token: cardFormData.token,
          paymentMethodId: methodId,
          installments: installments,
          email: cardFormData.payer.email,
          idempotencyKey: uuidv4(),
        };

        const result = await paymentService.processCardPayment(payload);
        setSuccess(result);
        resolve();
      } catch (err) {
        console.error("ERRO BACKEND:", err);
        let msg = err.response?.data?.message || err.message || 'Erro ao processar pagamento';
        setError(msg);
        reject();
      } finally {
        setLoading(false);
      }
    });
  };

  const handlePix = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = {
        orderId: orderData.orderId,
        paymentMethodId: 'pix',
        installments: 1,
        email: user.email,
        idempotencyKey: uuidv4()
      };
      const result = await paymentService.processPixPayment(payload);
      setSuccess(result);
    } catch (err) {
      console.error("Erro Pix:", err);
      setError("Erro ao gerar Pix.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-red-600 font-bold">Você precisa estar logado.</div>;
  if (fetchingOrder) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div></div>;
  if (!orderData) return <div className="text-center p-8">Pedido não encontrado.</div>;

  if (success) {
    return (
        <div className="max-w-3xl mx-auto mt-8 flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-lg text-center animate-fadeIn">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido #{orderData.orderId} Aprovado!</h2>
          <p className="text-gray-500 mb-8">Status: {success.status}</p>
          <button onClick={() => navigate('/')} className="mt-8 px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">Voltar para Loja</button>
        </div>
    );
  }

  // Prepara valor final para o componente
  const finalAmount = getTotalWithShipping();
  // Prepara CPF limpo para o componente
  const payerCpf = formData.cpf ? formData.cpf.replace(/\D/g, '') : (user.cpf ? user.cpf.replace(/\D/g, '') : '');

  return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Finalizar Pedido #{orderData.orderId}</h1>

        <div className="flex flex-col lg:flex-row gap-8 min-h-[500px]">
          {/* LADO ESQUERDO */}
          <div className="flex-1">
            <div className="flex items-center mb-8">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <span className="ml-2 mr-4">Entrega</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <span className="ml-2">Pagamento</span>
            </div>

            {step === 1 && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold mb-4">Dados de Entrega</h3>
                  {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">{error}</div>}

                  <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="CPF" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="p-3 border rounded w-full" required />
                    <input placeholder="Telefone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="p-3 border rounded w-full" required />

                    <div className="md:col-span-2 relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                      <input
                          placeholder="00000-000"
                          value={formData.zipCode}
                          onChange={e => setFormData({...formData, zipCode: e.target.value})}
                          onBlur={handleCepBlur}
                          className="p-3 border rounded w-full"
                          maxLength={9}
                          required
                      />
                      {calculatingShipping && <span className="absolute right-3 top-9 text-sm text-gray-500">Calculando...</span>}
                    </div>

                    <input placeholder="Rua" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="p-3 border rounded w-full" required />
                    <input placeholder="Número" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="p-3 border rounded w-full" required />
                    <input placeholder="Bairro" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="p-3 border rounded w-full" required />
                    <input placeholder="Cidade" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="p-3 border rounded w-full" required />

                    {shippingOptions.length > 0 && (
                        <div className="md:col-span-2 mt-4 bg-gray-50 p-4 rounded border">
                          <h4 className="font-bold mb-3 text-gray-800">Selecione o Frete:</h4>
                          <div className="space-y-2">
                            {shippingOptions.map((opt, idx) => (
                                <label key={idx} className={`flex justify-between items-center p-3 border rounded cursor-pointer transition-all ${selectedShipping?.name === opt.name ? 'border-red-600 bg-red-50' : 'bg-white hover:border-gray-400'}`}>
                                  <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="shipping"
                                        checked={selectedShipping?.name === opt.name}
                                        onChange={() => setSelectedShipping(opt)}
                                        className="text-red-600 focus:ring-red-500"
                                    />
                                    <div>
                                      <span className="font-bold block text-gray-900">{opt.name}</span>
                                      <span className="text-xs text-gray-500">Chega em até {opt.days} dias úteis</span>
                                    </div>
                                  </div>
                                  <span className="font-bold text-gray-800">R$ {opt.price.toFixed(2)}</span>
                                </label>
                            ))}
                          </div>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="md:col-span-2 bg-gray-900 text-white py-3 rounded font-bold hover:bg-black transition-colors mt-4">
                      Ir para Pagamento
                    </button>
                  </form>
                </div>
            )}

            {step === 2 && (
                // Usa classe CSS para evitar corte do dropdown
                <div className="mp-payment-container border border-gray-200 shadow-sm relative">
                  <div className="flex justify-between mb-6">
                    <h3 className="text-lg font-bold">Pagamento (Total: R$ {finalAmount.toFixed(2)})</h3>
                    <button onClick={() => setStep(1)} className="text-sm text-blue-600 underline">Editar</button>
                  </div>

                  <div className="flex gap-4 mb-6">
                    <button onClick={() => setPaymentType('card')} className={`flex-1 p-3 border rounded ${paymentType === 'card' ? 'border-red-600 bg-red-50 text-red-700' : ''}`}>Cartão</button>
                    <button onClick={() => setPaymentType('pix')} className={`flex-1 p-3 border rounded ${paymentType === 'pix' ? 'border-green-600 bg-green-50 text-green-700' : ''}`}>Pix</button>
                  </div>

                  {paymentType === 'card' && finalAmount > 0 && (
                      <CardPayment
                          key={finalAmount}
                          initialization={{
                            amount: finalAmount,
                            payer: {
                              email: user.email || 'customer@test.com',
                              // CORREÇÃO 2: Só envia identification se tiver CPF válido
                              // Enviar objeto com string vazia pode bugar o brick
                              ...(payerCpf ? {
                                identification: {
                                  type: 'CPF',
                                  number: payerCpf
                                }
                              } : {})
                            },
                          }}
                          customization={{
                            visual: {
                              style: {
                                theme: 'default',
                              },
                            },
                            paymentMethods: {
                              maxInstallments: 12,
                              minInstallments: 1,
                              // REMOVIDO 'types' para evitar conflito de detecção de BIN
                            },
                          }}
                          onSubmit={handleCardSubmit}
                      />
                  )}

                  {paymentType === 'pix' && (
                      <button onClick={handlePix} disabled={loading} className="bg-green-600 text-white w-full py-3 rounded font-bold hover:bg-green-700 mt-4">
                        Gerar Pix (R$ {finalAmount.toFixed(2)})
                      </button>
                  )}
                </div>
            )}
          </div>

          {/* LADO DIREITO: RESUMO */}
          <div className="lg:w-96">
            <div className="bg-gray-50 p-6 rounded-xl sticky top-24 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 text-lg border-b border-gray-200 pb-3">Resumo do Pedido</h3>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {orderData.items?.map((item, i) => {
                  const itemImage = item.product?.image || item.image || 'https://placehold.co/300x300?text=Produto';
                  const unitPrice = item.price || (item.subtotal / item.quantity);
                  return (
                      <div key={item.orderItemId || i} className="flex gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          <img src={itemImage} alt={item.productName} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/300x300?text=Produto'} />
                        </div>
                        <div className="flex flex-col justify-center flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.productName}</h4>
                          <div className="flex justify-between items-end mt-1">
                            <span className="text-xs text-gray-500">{item.quantity}x R$ {unitPrice.toFixed(2)}</span>
                            <span className="text-sm font-bold text-red-600">R$ {item.subtotal?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>R$ {orderData.items?.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Frete</span>
                  {selectedShipping ? (
                      <span className="text-gray-900 font-medium">R$ {selectedShipping.price.toFixed(2)}</span>
                  ) : (
                      <span className="text-gray-400 text-xs">Calcule o CEP</span>
                  )}
                </div>
                <div className="flex justify-between items-center pt-4 mt-2 border-t border-dashed border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-extrabold text-red-600">
                      R$ {finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Checkout;
