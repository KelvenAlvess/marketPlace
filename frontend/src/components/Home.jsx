import { useState } from 'react'
import ProductCard from './ProductCard'

function Home() {
  // Dados mockados de produtos - depois você pode pegar da API
  const [products] = useState([
    {
      id: 1,
      name: 'Notebook Dell',
      description: 'Intel Core i5, 8GB RAM, 256GB SSD',
      price: 3499.90,
      image: 'https://via.placeholder.com/300x300?text=Notebook'
    },
    {
      id: 2,
      name: 'Mouse Gamer',
      description: 'RGB, 12000 DPI, 7 botões programáveis',
      price: 149.90,
      image: 'https://via.placeholder.com/300x300?text=Mouse'
    },
    {
      id: 3,
      name: 'Teclado Mecânico',
      description: 'Switch Blue, RGB, ABNT2',
      price: 299.90,
      image: 'https://via.placeholder.com/300x300?text=Teclado'
    },
    {
      id: 4,
      name: 'Monitor 24"',
      description: 'Full HD, 144Hz, IPS',
      price: 899.90,
      image: 'https://via.placeholder.com/300x300?text=Monitor'
    },
    {
      id: 5,
      name: 'Headset Gamer',
      description: 'Som surround 7.1, LED RGB',
      price: 249.90,
      image: 'https://via.placeholder.com/300x300?text=Headset'
    },
    {
      id: 6,
      name: 'Webcam HD',
      description: '1080p, 30fps, Microfone integrado',
      price: 199.90,
      image: 'https://via.placeholder.com/300x300?text=Webcam'
    }
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 tracking-tight">Produtos em Destaque</h1>
          <p className="text-xl text-gray-700 font-medium">Confira nossas melhores ofertas com preços incríveis</p>
          <div className="mt-6 flex justify-center gap-4">
            <span className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-purple-600 shadow-md">🔥 Novidades</span>
            <span className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-pink-600 shadow-md">⭐ Mais Vendidos</span>
            <span className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-indigo-600 shadow-md">💎 Premium</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
