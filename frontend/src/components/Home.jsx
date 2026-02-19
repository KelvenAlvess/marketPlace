import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../service/productService';
import { useCart } from '../context/CartContext';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');// Controla loading individual dos botões

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data.slice(0, 8));
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault(); // Garante que não navegue se estiver dentro de um Link (segurança)
    e.stopPropagation();

    const pId = product.productId || product.product_ID;
    setAddingId(pId);

    try {
      // Adiciona ao carrinho com um pequeno delay visual para feedback
      await Promise.all([
        addToCart(pId, 1),
        new Promise(resolve => setTimeout(resolve, 500))
      ]);
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho", err);
    } finally {
      setAddingId(null);
    }
  };

  const getFallbackImage = (categoryName) => {
    const fallbackMap = {
      'Eletrônicos': 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&w=500&q=80',
      'Roupas': 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80',
      'Calçados': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
      'Livros': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80',
      'Casa': 'https://images.unsplash.com/photo-1484154218962-a1c00207099b?auto=format&fit=crop&w=500&q=80',
      'Gamer': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80',
    };
    return fallbackMap[categoryName] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80';
  };

  const resolveImage = (product) => {
    if (product.image && product.image.startsWith('http')) {
      return product.image;
    }
    return getFallbackImage(product.category?.name);
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-dashed rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
    );
  }

  const featuredProducts = products.slice(0, 4);
  const displayProducts = selectedFilter === 'featured' ? featuredProducts : products;

  return (
      <div className="min-h-screen bg-gray-50 font-sans">

        {/* === HERO SECTION === */}
        <div className="relative bg-gray-900 overflow-hidden">
          <div className="absolute inset-0">
            <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                alt="Shopping Banner"
                className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/20"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8 flex flex-col justify-center min-h-[500px]">
          <span className="inline-flex items-center space-x-2 text-red-500 font-bold tracking-wider uppercase text-xs sm:text-sm mb-6 animate-fadeIn">
            <span className="w-12 h-0.5 bg-red-500"></span>
            <span>Nova Coleção 2026</span>
          </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6 max-w-3xl leading-tight">
              Descubra o Futuro <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
              do seu Lifestyle.
            </span>
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-xl leading-relaxed">
              Uma curadoria exclusiva dos melhores produtos do mercado.
              Tecnologia, moda e decoração com entrega rápida para todo o Brasil.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                  to="/products"
                  className="rounded-full bg-red-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-red-900/30 hover:bg-red-500 hover:scale-105 transition-all duration-300"
              >
                Ver Produtos
              </Link>
              <Link
                  to="/categories"
                  className="rounded-full bg-white/5 backdrop-blur-md px-8 py-4 text-sm font-bold text-white border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
              >
                Explorar Categorias
              </Link>
            </div>
          </div>
        </div>

        {/* === FEATURES === */}
        <div className="bg-white border-b border-gray-100 relative z-10 -mt-8 mx-6 rounded-xl shadow-xl max-w-7xl lg:mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex items-center gap-4 p-8 hover:bg-gray-50 transition-colors rounded-l-xl">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Garantia Total</h3>
                <p className="text-sm text-gray-500 mt-1">30 dias para devolução grátis</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-8 hover:bg-gray-50 transition-colors">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Entrega Flash</h3>
                <p className="text-sm text-gray-500 mt-1">Receba amanhã nas capitais</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-8 hover:bg-gray-50 transition-colors rounded-r-xl">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">100% Seguro</h3>
                <p className="text-sm text-gray-500 mt-1">Proteção de dados ponta a ponta</p>
              </div>
            </div>
          </div>
        </div>

        {/* === FEATURED PRODUCTS === */}
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Destaques da Semana</h2>
              <p className="mt-3 text-gray-500 text-lg">As melhores ofertas selecionadas manualmente para você.</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-700 font-semibold hover:border-red-600 hover:text-red-600 transition-all group shadow-sm">
              Ver catálogo completo
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const displayImage = resolveImage(product);
              const categoryName = product.category?.name || 'Geral';
              const pId = product.productId || product.product_ID;
              const isAdding = addingId === pId;

              return (
                  <div
                      key={pId}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Image Container - Link para detalhes */}
                    <Link to={`/product/${pId}`} className="relative h-72 overflow-hidden bg-gray-100 block cursor-pointer">
                      <img
                          src={displayImage}
                          alt={product.productName}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80';
                          }}
                      />

                      {/* Category Badge */}
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {categoryName}
                      </span>

                      {/* Badges de Estoque */}
                      {product.stockQuantity < 5 && (
                          <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse">
                            Últimos
                          </span>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow relative">
                      {/* Título - Link para detalhes */}
                      <Link to={`/product/${pId}`} className="block">
                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-red-600 transition-colors">
                          {product.productName}
                        </h3>
                      </Link>

                      <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-grow leading-relaxed">
                        {product.description}
                      </p>

                      <div className="flex items-end justify-between pt-4 border-t border-gray-50 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-medium line-through mb-0.5">R$ {(product.productPrice * 1.25).toFixed(2)}</span>
                          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            R$ {Number(product.productPrice).toFixed(2)}
                          </span>
                        </div>

                        {/* Botão de Adicionar ao Carrinho */}
                        <button
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={isAdding || product.stockQuantity === 0}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm group-hover:scale-110 
                              ${product.stockQuantity === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white cursor-pointer'}`}
                        >
                          {isAdding ? (
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                          ) : (
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
              );
            })}
          </div>

          <div className="mt-12 text-center sm:hidden">
            <Link to="/products" className="inline-block px-8 py-4 bg-gray-900 text-white rounded-full font-bold shadow-lg">
              Ver todos os produtos
            </Link>
          </div>
        </div>

        {/* === NEWSLETTER === */}
        <div className="bg-gray-900 py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-red-600 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-orange-600 rounded-full blur-3xl opacity-10"></div>

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Cadastre-se para ofertas exclusivas</h2>
            <p className="text-gray-400 mb-10 text-lg">
              Junte-se a mais de 50.000 clientes e receba descontos, novidades e conteúdo exclusivo diretamente no seu e-mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white/20 transition-all backdrop-blur-sm"
              />
              <button className="px-8 py-4 bg-red-600 text-white rounded-full font-bold hover:bg-red-500 transition-all shadow-lg shadow-red-900/40 hover:scale-105">
                Inscrever-se
              </button>
            </div>
            <p className="text-gray-600 text-sm mt-6">
              Não enviamos spam. Cancele a qualquer momento.
            </p>
          </div>
        </div>
      </div>
  );
}

export default Home;