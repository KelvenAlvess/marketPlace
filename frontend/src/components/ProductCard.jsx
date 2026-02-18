import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  const [adding, setAdding] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const intervalRef = useRef(null);

  // Parse images - suporta string separada por vírgula ou array
  const images = (() => {
    if (Array.isArray(product.imageUrl)) {
      return product.imageUrl;
    }
    if (typeof product.imageUrl === 'string' && product.imageUrl.includes(',')) {
      return product.imageUrl.split(',').map(url => url.trim());
    }
    return [product.imageUrl || product.image || 'https://via.placeholder.com/300x300?text=Produto'];
  })();

  // Carrossel automático no hover com transição mais suave
  useEffect(() => {
    if (isHovering && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setImageLoaded(false); // Trigger fade effect
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 2000); // Muda de imagem a cada 2 segundos para mais naturalidade
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Volta para primeira imagem suavemente quando sai do hover
      if (!isHovering && currentImageIndex !== 0) {
        setImageLoaded(false);
        setTimeout(() => setCurrentImageIndex(0), 150);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovering, images.length, currentImageIndex]);

  const handleAddToCart = async (event) => {
    // Impede que o clique no botão abra a página do produto (navegação do Link pai)
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget;
    setAdding(true);

    const timeout = new Promise(resolve => setTimeout(resolve, 500));

    // Compatibilidade de ID (pode vir como productId ou product_ID)
    const pId = product.productId || product.product_ID;

    const [success] = await Promise.all([
      addToCart(pId, 1),
      timeout
    ]);

    setAdding(false);

    if (success && button) {
      button.classList.add('animate-pulse');
      setTimeout(() => button.classList.remove('animate-pulse'), 500);
    }
  };

  // Garante o ID correto
  const productId = product.productId || product.product_ID;

  return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-200 group relative">

        {/* A imagem inteira agora é um Link */}
        <Link to={`/product/${productId}`} className="block w-full h-64 overflow-hidden bg-gray-50 relative cursor-pointer">
          <img
              src={product.image || 'https://via.placeholder.com/300x300?text=Produto'}
              alt={product.productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.stockQuantity === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-bold text-lg px-4 py-2 border-2 border-white rounded-md">
                  ESGOTADO
                </span>
              </div>
          )}
        </Link>

        <div className="p-4 flex flex-col flex-1">
          <div className="mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
              {product.category?.name || 'Geral'}
            </span>

            {/* O Título agora é um Link */}
            <Link to={`/product/${productId}`} className="block">
              <h3 className="text-lg font-bold text-gray-800 line-clamp-2 min-h-[3.5rem] hover:text-red-600 transition-colors" title={product.productName}>
                {product.productName}
              </h3>
            </Link>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-xl font-bold text-red-600">
              R$ {parseFloat(product.productPrice).toFixed(2)}
            </span>

            <button
                onClick={handleAddToCart}
                disabled={adding || product.stockQuantity === 0}
                className={`
              px-5 py-2.5 rounded-md font-medium transition-all duration-200 shadow-sm flex items-center gap-2 z-10 relative
              ${product.stockQuantity === 0
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-md active:scale-95'}
            `}
            >
              {adding ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>...</span>
                  </>
              ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Comprar</span>
                  </>
              )}
            </button>
          </div>
        </div>
      </div>
  );
}

export default ProductCard;