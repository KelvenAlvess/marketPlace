function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        <div className="navbar-logo">
          <h2 className="text-white text-2xl font-bold tracking-wide">MarketPlace</h2>
        </div>
        
        <ul className="flex gap-8 list-none">
          <li><a href="/" className="text-white font-medium hover:text-yellow-300 transition-all duration-300 hover:scale-110">Home</a></li>
          <li><a href="/products" className="text-white font-medium hover:text-yellow-300 transition-all duration-300 hover:scale-110">Produtos</a></li>
          <li><a href="/categories" className="text-white font-medium hover:text-yellow-300 transition-all duration-300 hover:scale-110">Categorias</a></li>
          <li><a href="/about" className="text-white font-medium hover:text-yellow-300 transition-all duration-300 hover:scale-110">Sobre</a></li>
        </ul>
        
        <div className="flex gap-4">
          <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 border border-white/30">
            🛒 Carrinho (0)
          </button>
          <button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md">Entrar</button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
