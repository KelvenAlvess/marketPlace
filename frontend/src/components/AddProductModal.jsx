import { useState, useEffect } from 'react';
import productService from '../service/productService';
import categoryService from '../service/categoryService';

function AddProductModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  const [productData, setProductData] = useState({
    productName: '',
    description: '',
    productPrice: '',
    categoryId: '',
    stockQuantity: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
      if (data.length > 0) {
        setProductData(prev => ({ ...prev, categoryId: data[0].categoryId }));
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Não foi possível carregar as categorias');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (parseFloat(productData.productPrice) <= 0) {
      setError('Preço deve ser maior que zero');
      return;
    }

    if (parseInt(productData.stockQuantity) < 0) {
      setError('Quantidade em estoque não pode ser negativa');
      return;
    }

    setLoading(true);

    try {
      const productToCreate = {
        productName: productData.productName,
        description: productData.description,
        productPrice: parseFloat(productData.productPrice),
        categoryId: parseInt(productData.categoryId),
        stockQuantity: parseInt(productData.stockQuantity)
      };

      await productService.createProduct(productToCreate);

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      setError(err.response?.data?.message || 'Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Adicionar Novo Produto
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={productData.productName}
                onChange={(e) => setProductData({ ...productData, productName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ex: Notebook Gamer"
                maxLength="150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <textarea
                required
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Descreva o produto em detalhes..."
                maxLength="500"
                rows="4"
              />
              <p className="text-xs text-gray-500 mt-1">
                {productData.description.length}/500 caracteres
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={productData.productPrice}
                  onChange={(e) => setProductData({ ...productData, productPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade em Estoque *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={productData.stockQuantity}
                  onChange={(e) => setProductData({ ...productData, stockQuantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                required
                value={productData.categoryId}
                onChange={(e) => setProductData({ ...productData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando...' : 'Adicionar Produto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProductModal;