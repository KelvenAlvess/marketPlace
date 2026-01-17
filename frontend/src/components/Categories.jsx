import { useState, useEffect } from 'react';
import categoryService from '../service/categoryService';
import productService from '../service/productService';
import ProductCard from './ProductCard';

// Mapeamento de ícones e cores por categoria
const categoryIcons = {
  'Eletronicos': { 
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-indigo-600',
    hoverGradient: 'from-blue-600 to-indigo-700',
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50'
  },
  'Moda': { 
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h8m-8 0H3m18 0a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4z" />
      </svg>
    ),
    gradient: 'from-pink-500 to-rose-600',
    hoverGradient: 'from-pink-600 to-rose-700',
    bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50'
  },
  'Casa e Decoracao': { 
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-600',
    hoverGradient: 'from-amber-600 to-orange-700',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50'
  },
  'Esportes': { 
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-green-500 to-emerald-600',
    hoverGradient: 'from-green-600 to-emerald-700',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50'
  },
  'Livros': { 
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    gradient: 'from-purple-500 to-violet-600',
    hoverGradient: 'from-purple-600 to-violet-700',
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50'
  },
  'Beleza': { 
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    gradient: 'from-fuchsia-500 to-pink-600',
    hoverGradient: 'from-fuchsia-600 to-pink-700',
    bgColor: 'bg-gradient-to-br from-fuchsia-50 to-pink-50'
  }
};

// Ícone padrão caso categoria não tenha mapeamento
const defaultCategory = {
  icon: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  gradient: 'from-gray-500 to-slate-600',
  hoverGradient: 'from-gray-600 to-slate-700',
  bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50'
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Não foi possível carregar as categorias.');
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByCategory = async (categoryId) => {
    try {
      setLoadingProducts(true);
      const data = await productService.getProductsByCategory(categoryId);
      setProducts(data);
      setSelectedCategory(categoryId);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Categorias</h1>
          <p className="text-lg text-gray-600">Explore produtos por categoria</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Carregando categorias...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600">Nenhuma categoria encontrada.</p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <>
            {/* Lista de Categorias com cards grandes e gradientes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {categories.map(category => {
                const categoryStyle = categoryIcons[category.name] || defaultCategory;
                const isSelected = selectedCategory === category.category_ID;
                
                return (
                  <button
                    key={category.category_ID}
                    onClick={() => loadProductsByCategory(category.category_ID)}
                    className={`group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                      isSelected 
                        ? 'scale-105 shadow-2xl ring-4 ring-red-400 ring-offset-2' 
                        : 'shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <div className={`${categoryStyle.bgColor} p-8 h-48 flex flex-col items-center justify-center relative`}>
                      {/* Overlay com gradiente no hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        isSelected ? categoryStyle.hoverGradient : categoryStyle.gradient
                      } opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      
                      {/* Ícone com animação */}
                      <div className={`text-transparent bg-clip-text bg-gradient-to-br ${categoryStyle.gradient} mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                        {categoryStyle.icon}
                      </div>
                      
                      {/* Nome da categoria */}
                      <h3 className={`font-bold text-lg text-center bg-gradient-to-br ${categoryStyle.gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
                        {category.name}
                      </h3>
                      
                      {/* Badge de selecionado */}
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className={`bg-gradient-to-br ${categoryStyle.gradient} text-white rounded-full p-2 shadow-lg animate-pulse`}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      {/* Efeito de brilho no hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Produtos da Categoria Selecionada */}
            {selectedCategory && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Produtos em {categories.find(c => c.category_ID === selectedCategory)?.name}
                </h2>

                {loadingProducts && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Carregando produtos...</p>
                  </div>
                )}

                {!loadingProducts && products.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <p className="text-gray-600">Nenhum produto encontrado nesta categoria.</p>
                  </div>
                )}

                {!loadingProducts && products.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(product => (
                      <ProductCard key={product.product_ID} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Categories;
