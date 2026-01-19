import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import productService from '../service/productService';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Não foi possível carregar os produtos. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Todos os Produtos</h1>
          <p className="text-lg text-gray-600">Explore nosso catálogo completo</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Carregando produtos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600">Nenhum produto encontrado.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="mb-6 text-gray-600">
              <p>{products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map(product => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Products;
