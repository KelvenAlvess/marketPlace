import { useState } from 'react'
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async (event) => {
    setAdding(true);
    
    // Garante que o loading dura no máximo 1 segundo
    const timeout = setTimeout(() => setAdding(false), 1000);
    
    const success = await addToCart(product.product_ID, 1);
    
    clearTimeout(timeout);
    setAdding(false);
    
    if (success) {
      // Feedback visual de sucesso
      const button = event.currentTarget;
      button.classList.add('animate-pulse');
      setTimeout(() => button.classList.remove('animate-pulse'), 500);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-200 group">
      <div className="w-full h-64 overflow-hidden bg-gray-50 relative">
        <img 
          src={product.image || 'https://via.placeholder.com/300x300?text=Produto'} 
          alt={product.productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.stockQuantity < 10 && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium shadow-md">
            Últimas unidades
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.productName}</h3>
        <p className="text-sm text-gray-600 mb-4 flex-1 leading-relaxed">{product.description}</p>
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-200">
          <span className="text-2xl font-bold text-red-600">
            R$ {parseFloat(product.productPrice).toFixed(2)}
          </span>
          <button 
            onClick={handleAddToCart}
            disabled={adding}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-md font-medium transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {adding ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adicionando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Adicionar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
