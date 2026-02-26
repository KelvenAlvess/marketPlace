import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProductDetails from './pages/ProductDetails';
import { useState } from 'react';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Checkout from './components/Checkout';
import Products from './pages/Products';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
      <Router>
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Navbar />

              <div className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />

                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route path="/products" element={<Products />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/categories/:categoryId" element={<CategoryProducts />} />

                  <Route path="/checkout/:orderId" element={<Checkout />} />

                  <Route path="*" element={<Navigate to="/" replace />} />

                  <Route path="/product/:id" element={<ProductDetails />} />
                </Routes>
              </div>
            </div>
          </CartProvider>
        </AuthProvider>
      </Router>
  );
}

export default App;