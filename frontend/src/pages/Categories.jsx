import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryService from '../service/categoryService';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Não foi possível carregar as categorias no momento.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-dashed rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-500 font-medium tracking-wide">Carregando coleções...</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section com Gradiente Sutil */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20 text-center">
          <span className="text-red-600 font-semibold tracking-wider uppercase text-sm mb-2 block">
            Navegue pelo Catálogo
          </span>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
              Explore nossas <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Categorias</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed">
              Encontre exatamente o que você procura. Selecionamos os melhores produtos organizados para facilitar sua experiência.
            </p>
          </div>
        </div>

        {/* Grid Section */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {error ? (
              <div className="rounded-xl bg-red-50 border border-red-100 p-8 text-center">
                <p className="text-red-800 font-medium text-lg">{error}</p>
                <button
                    onClick={loadCategories}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  Tentar Novamente
                </button>
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {categories.map((category) => (
                    <Link
                        key={category.categoryId || category.category_ID}
                        to={`/categories/${category.categoryId || category.category_ID}`}
                        className="group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-red-100 transform hover:-translate-y-2"
                    >
                      {/* Background Decorativo (Blob) */}
                      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-gradient-to-br from-red-50 to-transparent opacity-50 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>

                      <div className="p-8 flex flex-col items-center flex-grow relative z-10">
                        {/* Ícone/Inicial com Efeito de Vidro */}
                        <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-inner flex items-center justify-center group-hover:from-red-50 group-hover:to-white group-hover:border-red-100 transition-all duration-300">
                    <span className="text-3xl font-black text-gray-300 group-hover:text-red-600 transition-colors duration-300">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                        </div>

                        {/* Título e Subtítulo */}
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2 group-hover:text-red-600 transition-colors">
                          {category.name}
                        </h3>

                        <div className="w-8 h-1 bg-gray-200 rounded-full mt-2 group-hover:bg-red-500 group-hover:w-16 transition-all duration-300"></div>
                      </div>

                      {/* Footer do Card com CTA */}
                      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center group-hover:bg-red-600 transition-colors duration-300">
                  <span className="text-sm font-medium text-gray-500 group-hover:text-white transition-colors">
                    Ver coleção
                  </span>
                        <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </Link>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}

export default Categories;