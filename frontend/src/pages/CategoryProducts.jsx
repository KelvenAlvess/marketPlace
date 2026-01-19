import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Importante: useParams
import productService from '../service/productService';
import categoryService from '../service/categoryService';
import ProductCard from '../components/ProductCard';

function CategoryProducts() {
  // 1. O nome aqui TEM que ser igual ao definido no App.jsx (:categoryId)
  const { categoryId } = useParams();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (categoryId) {
      loadCategoryAndProducts(categoryId);
    }
  }, [categoryId]);

  const loadCategoryAndProducts = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // Carrega os dados em paralelo para ser mais rápido
      const [catData, prodData] = await Promise.all([
        categoryService.getCategoryById(id),
        productService.getProductsByCategory(id)
      ]);

      setCategory(catData);
      setProducts(prodData);
    } catch (err) {
      console.error("Erro ao carregar categoria:", err);
      setError("Não foi possível carregar os produtos desta categoria.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="max-w-7xl mx-auto px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ops!</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link to="/categories" className="text-blue-600 underline">Voltar para Categorias</Link>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link to="/" className="hover:text-red-600">Home</Link>
              <span>/</span>
              <Link to="/categories" className="hover:text-red-600">Categorias</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{category?.name}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
            <p className="text-gray-600 mt-2">
              {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          </div>

          {products.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                <p className="text-gray-500 text-lg">Nenhum produto cadastrado nesta categoria ainda.</p>
                <Link to="/products" className="mt-4 inline-block text-red-600 font-medium hover:underline">
                  Ver todos os produtos
                </Link>
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                    // CORREÇÃO DO ERRO DE KEY: Usamos product_ID
                    <ProductCard key={product.product_ID} product={product} />
                ))}
              </div>
          )}
        </div>
      </div>
  );
}

export default CategoryProducts;