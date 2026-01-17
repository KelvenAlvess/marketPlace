import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Categories from './components/Categories'
import Products from './components/Products'
import Checkout from './components/Checkout'

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div>
      <Navbar onNavigate={setCurrentPage} />
      {currentPage === 'home' && <Home />}
      {currentPage === 'products' && <Products />}
      {currentPage === 'categories' && <Categories />}
      {currentPage === 'checkout' && <Checkout onNavigate={setCurrentPage} />}
    </div>
  )
}

export default App