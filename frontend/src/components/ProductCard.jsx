function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col border border-gray-100 group">
      <div className="w-full h-64 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 relative">
        <img 
          src={product.image || 'https://via.placeholder.com/300x300?text=Produto'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
          Destaque
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-4 flex-1 leading-relaxed">{product.description}</p>
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
          <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">R$ {product.price.toFixed(2)}</span>
          <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md">Adicionar</button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
