import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Login from './Login'
import Cart from './Cart'
import AddProduct from './AddProduct'

function Navbar({ onNavigate }) {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const isSeller = user?.roles?.includes('SELLER');

  return (
    <>
      <nav className="bg-gradient-to-r from-red-600 to-red-700 shadow-xl sticky top-0 z-50 border-b-2 border-red-800">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="navbar-logo">
            <h2 className="text-white text-2xl font-semibold tracking-tight">E-Commerce</h2>
          </div>
          
          <ul className="flex gap-8 list-none">
            <li>
              <button 
                onClick={() => onNavigate?.('home')} 
                className="text-white font-normal hover:text-red-100 transition-colors duration-200"
              >
                Home
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate?.('products')} 
                className="text-white font-normal hover:text-red-100 transition-colors duration-200"
              >
                Produtos
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate?.('categories')} 
                className="text-white font-normal hover:text-red-100 transition-colors duration-200"
              >
                Categorias
              </button>
            </li>
          </ul>
          
          <div className="flex gap-4 items-center">
            {isSeller && (
              <button 
                onClick={() => setShowAddProduct(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-md font-medium transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Produto
              </button>
            )}

            <button 
              onClick={() => setShowCart(true)}
              className="bg-white/90 hover:bg-white text-red-600 px-5 py-2.5 rounded-md font-medium transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Carrinho ({cartCount})
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-white text-sm">
                  Olá, {user.userName}
                </span>
                <button 
                  onClick={logout}
                  className="bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-md font-medium transition-all duration-200 shadow-sm"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-md font-medium transition-all duration-200 shadow-sm"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </nav>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showCart && <Cart isOpen={showCart} onClose={() => setShowCart(false)} onNavigate={onNavigate} />}
      {showAddProduct && (
        <AddProduct 
          onClose={() => setShowAddProduct(false)} 
          onProductAdded={() => window.location.reload()}
        />
      )}
    </>
  )
}

export default Navbar