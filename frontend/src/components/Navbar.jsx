import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Login from './Login'
import Cart from './Cart'

function Navbar() {
  const { cartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <nav className="bg-gradient-to-r from-red-600 to-red-700 shadow-xl sticky top-0 z-50 border-b-2 border-red-800">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="navbar-logo">
            <h2 className="text-white text-2xl font-semibold tracking-tight">E-Commerce</h2>
          </div>
          
          <ul className="flex gap-8 list-none">
            <li><a href="/" className="text-white font-normal hover:text-red-100 transition-colors duration-200">Home</a></li>
            <li><a href="/products" className="text-white font-normal hover:text-red-100 transition-colors duration-200">Produtos</a></li>
            <li><a href="/categories" className="text-white font-normal hover:text-red-100 transition-colors duration-200">Categorias</a></li>
            <li><a href="/about" className="text-white font-normal hover:text-red-100 transition-colors duration-200">Sobre</a></li>
          </ul>
          
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setShowCart(true)}
              className="bg-white/90 hover:bg-white text-red-600 px-5 py-2.5 rounded-md font-medium transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Carrinho ({cartCount})
            </button>
            
            {isAuthenticated() ? (
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
      {showCart && <Cart isOpen={showCart} onClose={() => setShowCart(false)} />}
    </>
  )
}

export default Navbar
