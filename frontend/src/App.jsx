import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Componentes
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Checkout from './components/Checkout';

// Páginas
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
                  {/* Rota Principal */}
                  <Route path="/" element={<Home />} />

                  {/* Autenticação (AS ROTAS QUE FALTAVAM) */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Produtos e Categorias */}
                  <Route path="/products" element={<Products />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/categories/:categoryId" element={<CategoryProducts />} />

                  {/* Checkout e Pagamento */}
                  <Route path="/checkout/:orderId" element={<Checkout />} />

                  {/* Rota Coringa (Opcional: redireciona erro 404 para Home) */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
          </CartProvider>
        </AuthProvider>
      </Router>
  );
}

export default App;