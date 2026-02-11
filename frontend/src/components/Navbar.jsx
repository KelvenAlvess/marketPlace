import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import orderService from '../service/orderService.js'; // Importamos o service

function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false); // Estado de loading para o clique

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // === NOVA FUNÇÃO INTELIGENTE ===
  const handleCartClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert("Seu carrinho está vazio! Adicione produtos antes de finalizar.");
      return;
    }

    try {
      setLoadingOrder(true);
      // 1. Pede ao backend para transformar o carrinho em pedido
      // O backend deve pegar os itens, criar o registro na tabela orders e limpar o carrinho
      const newOrder = await orderService.createOrderFromCart(user.userId || user.user_ID);

      // 2. Navega para o Checkout com o ID DO PEDIDO (não do usuário)
      navigate(`/checkout/${newOrder.orderId}`);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      alert("Erro ao processar o carrinho. Tente novamente.");
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">

            {/* LOGO */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-red-600 text-white p-2 rounded-lg group-hover:bg-red-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                Market<span className="text-red-600">Place</span>
              </span>
              </Link>
            </div>

            {/* MENU DESKTOP */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-red-600 font-medium transition-colors">Home</Link>
              <Link to="/products" className="text-gray-600 hover:text-red-600 font-medium transition-colors">Produtos</Link>
              <Link to="/categories" className="text-gray-600 hover:text-red-600 font-medium transition-colors">Categorias</Link>
            </div>

            {/* ÁREA DO USUÁRIO & CARRINHO */}
            <div className="hidden md:flex items-center gap-6">

              {/* ÍCONE DO CARRINHO ATUALIZADO */}
              <div className="relative group">
                <button
                    onClick={handleCartClick}
                    disabled={loadingOrder}
                    className="text-gray-600 hover:text-red-600 transition-colors p-2 disabled:opacity-50"
                >
                  {loadingOrder ? (
                      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                  )}

                  {cartItems.length > 0 && !loadingOrder && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                      {cartItems.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Lógica de Login/Logout */}
              {user ? (
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden lg:block">
                      <p className="text-sm text-gray-500">Olá,</p>
                      <p className="text-sm font-bold text-gray-900">{user.userName || user.name}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-all"
                    >
                      Sair
                    </button>
                  </div>
              ) : (
                  <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="text-gray-700 font-medium hover:text-red-600 px-3 py-2 transition-colors"
                    >
                      Entrar
                    </Link>
                    <Link
                        to="/register"
                        className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      Criar Conta
                    </Link>
                  </div>
              )}
            </div>

            {/* BOTÃO MOBILE */}
            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* MENU MOBILE EXPANDIDO */}
        {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-2 shadow-xl">
              <Link to="/" className="block py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md px-2">Home</Link>
              <Link to="/products" className="block py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md px-2">Produtos</Link>
              <Link to="/categories" className="block py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md px-2">Categorias</Link>

              <div className="border-t border-gray-100 my-2 pt-2">
                {user ? (
                    <>
                      <div className="px-2 py-2">
                        <p className="text-sm text-gray-500">Logado como</p>
                        <p className="font-bold text-gray-900">{user.userName}</p>
                      </div>
                      {/* Carrinho Mobile */}
                      <button onClick={handleCartClick} className="w-full text-left py-3 text-red-600 font-bold hover:bg-red-50 rounded-md px-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Finalizar Pedido ({cartItems.length})
                      </button>
                      <button onClick={handleLogout} className="w-full text-left py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-md px-2">Sair</button>
                    </>
                ) : (
                    <div className="grid grid-cols-2 gap-4 mt-4 px-2">
                      <Link to="/login" className="text-center py-3 border border-gray-300 rounded-lg font-medium text-gray-700">Entrar</Link>
                      <Link to="/register" className="text-center py-3 bg-red-600 text-white rounded-lg font-bold">Criar Conta</Link>
                    </div>
                )}
              </div>
            </div>
        )}
      </nav>
  );
}

export default Navbar;