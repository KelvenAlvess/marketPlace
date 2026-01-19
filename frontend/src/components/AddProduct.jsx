import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import productService from '../service/productService';
import categoryService from '../service/categoryService';

function AddProduct({ onClose, onProductAdded }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [createNewCategory, setCreateNewCategory] = useState(false);

  const [productData, setProductData] = useState({
    productName: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    categoryName: '',
    imageUrl: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let categoryId = productData.categoryId;

      // Se deve criar nova categoria
      if (createNewCategory && productData.categoryName.trim()) {
        try {
          const newCategory = await categoryService.createCategory({
            name: productData.categoryName.trim(),
            description: `Categoria ${productData.categoryName}`
          });
          categoryId = newCategory.category_ID;
        } catch {
          setError('Erro ao criar categoria. Talvez ela já exista.');
          setLoading(false);
          return;
        }
      }

      if (!categoryId) {
        setError('Selecione ou crie uma categoria');
        setLoading(false);
        return;
      }

      // Criar produto
      await productService.createProduct({
        productName: productData.productName,
        description: productData.description,
        price: parseFloat(productData.price),
        stockQuantity: parseInt(productData.stockQuantity),
        categoryId: parseInt(categoryId),
        sellerId: user.user_ID,
        imageUrl: productData.imageUrl || 'https://via.placeholder.com/300'
      });

      if (onProductAdded) {
        onProductAdded();
      }
      onClose();
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      setError(err.response?.data?.message || 'Erro ao criar produto. Tente novamente.');
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
            <h2 className="text-2xl font-bold text-gray-900">Adicionar Produto</h2>
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
                placeholder="Ex: Notebook Dell Inspiron"
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
                placeholder="Descreva seu produto..."
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={productData.price}
                  onChange={(e) => setProductData({ ...productData, price: e.target.value })}
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
                  value={productData.stockQuantity}
                  onChange={(e) => setProductData({ ...productData, stockQuantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URLs das Imagens (separadas por vírgula)
              </label>
              <textarea
                value={productData.imageUrl}
                onChange={(e) => setProductData({ ...productData, imageUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="https://exemplo.com/imagem1.jpg, https://exemplo.com/imagem2.jpg"
                rows="2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Adicione múltiplas URLs separadas por vírgula para criar um carrossel. Deixe em branco para usar imagem padrão.
              </p>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              
              <div className="flex items-center mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createNewCategory}
                    onChange={(e) => {
                      setCreateNewCategory(e.target.checked);
                      setProductData({ ...productData, categoryId: '', categoryName: '' });
                    }}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Criar nova categoria</span>
                </label>
              </div>

              {createNewCategory ? (
                <input
                  type="text"
                  required
                  value={productData.categoryName}
                  onChange={(e) => setProductData({ ...productData, categoryName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nome da nova categoria"
                />
              ) : (
                <select
                  required
                  value={productData.categoryId}
                  onChange={(e) => setProductData({ ...productData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category.category_ID} value={category.category_ID}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-md font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando...' : 'Criar Produto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
