import { useState, useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext'

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
    event.preventDefault();
    setAdding(true);
    
    try {
      const success = await addToCart(product.product_ID, 1);
      
      if (success) {
        // Feedback visual de sucesso
        const button = event.currentTarget;
        button.classList.add('bg-green-600');
        
        // Adicionar ícone de check temporariamente
        setTimeout(() => {
          button.classList.remove('bg-green-600');
        }, 800);
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-200 group">
      <div 
        className="w-full h-64 overflow-hidden bg-gray-50 relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img 
          src={images[currentImageIndex]} 
          alt={`${product.productName} - Imagem ${currentImageIndex + 1}`}
          className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          style={{
            transition: 'transform 0.7s ease-out, opacity 0.4s ease-in-out'
          }}
        />
        {product.stockQuantity < 10 && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium shadow-md z-10">
            Últimas unidades
          </div>
        )}
        
        {/* Indicadores de imagens com animação suave */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  index === currentImageIndex 
                    ? 'bg-white w-8 shadow-lg' 
                    : 'bg-white/60 w-2 hover:bg-white/90 hover:w-3'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageLoaded(false);
                  setCurrentImageIndex(index);
                }}
                aria-label={`Ver imagem ${index + 1}`}
              />
            ))}
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
