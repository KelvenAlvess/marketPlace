import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../service/productService';
import orderService from '../service/OrderService.js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth(); // Pega o usuário do contexto

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [buying, setBuying] = useState(false);
    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        loadProduct();
    }, [id]);

    const getFallbackImage = (categoryName) => {
        const fallbackMap = {
            'Eletrônicos': 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&w=800&q=80',
            'Roupas': 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
            'Calçados': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
            'Livros': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
            'Casa': 'https://images.unsplash.com/photo-1484154218962-a1c00207099b?auto=format&fit=crop&w=800&q=80',
        };
        return fallbackMap[categoryName] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';
    };

    const loadProduct = async () => {
        try {
            setLoading(true);
            const data = await productService.getProductById(id);
            setProduct(data);

            const img = data.image && data.image.startsWith('http')
                ? data.image
                : getFallbackImage(data.category?.name);
            setMainImage(img);

        } catch (error) {
            console.error("Erro ao carregar produto", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        setAdding(true);
        const pId = product.productId || product.product_ID;
        await addToCart(pId, 1);
        setAdding(false);
    };

    // --- LÓGICA CORRIGIDA DO COMPRAR AGORA ---
    const handleBuyNow = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setBuying(true);
        try {
            const pId = product.productId || product.product_ID;

            // 1. Adiciona ao carrinho primeiro
            await addToCart(pId, 1);

            // 2. Cria o pedido passando o ID do usuário (CORREÇÃO AQUI)
            // O ID pode variar de nome dependendo do seu backend (userId, user_ID ou id)
            const userId = user.userId || user.user_ID || user.id;

            if (!userId) {
                throw new Error("ID do usuário não identificado. Faça login novamente.");
            }

            const createdOrder = await orderService.createOrder(userId);

            // 3. Redireciona para o Checkout
            if (createdOrder && createdOrder.orderId) {
                navigate(`/checkout/${createdOrder.orderId}`);
            } else {
                throw new Error("Pedido criado mas sem ID de retorno.");
            }

        } catch (err) {
            console.error("Erro no fluxo de compra imediata:", err);
            alert("Não foi possível processar a compra agora. Tente adicionar ao carrinho.");
        } finally {
            setBuying(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full"></div></div>;

    if (!product) return <div className="text-center p-20 text-gray-500">Produto não encontrado.</div>;

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <nav className="flex mb-6 text-sm text-gray-500">
                    <Link to="/" className="hover:text-red-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/products" className="hover:text-red-600">Produtos</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">{product.category?.name || 'Geral'}</span>
                </nav>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

                        {/* LADO ESQUERDO: IMAGEM */}
                        <div className="p-8 bg-white flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
                            <div className="relative w-full max-w-lg aspect-square">
                                <img
                                    src={mainImage}
                                    alt={product.productName}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        {/* LADO DIREITO: INFORMAÇÕES */}
                        <div className="p-8 md:p-10 flex flex-col">
              <span className="text-xs font-bold text-red-600 tracking-wider uppercase mb-2">
                {product.stockQuantity > 0 ? 'Em Estoque' : 'Esgotado'}
              </span>

                            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                                {product.productName}
                            </h1>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-gray-900">
                    R$ {Number(product.productPrice).toFixed(2)}
                  </span>
                                    <span className="text-lg text-gray-400 line-through">
                    R$ {(product.productPrice * 1.2).toFixed(2)}
                  </span>
                                </div>
                                <p className="text-green-600 text-sm font-medium mt-1">
                                    em até 12x de R$ {(product.productPrice / 12).toFixed(2)}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6 border border-gray-100">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Vendido e entregue por</p>
                                    <p className="text-sm font-bold text-gray-900">{product.seller?.name || 'Loja Oficial'}</p>
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex flex-col gap-3 mt-auto">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stockQuantity === 0 || adding || buying}
                                    className={`w-full py-4 px-6 rounded-full font-bold text-lg shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2
                    ${product.stockQuantity > 0
                                        ? 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-50'
                                        : 'bg-gray-300 text-gray-500 border-2 border-gray-300 cursor-not-allowed'}`}
                                >
                                    {adding ? 'Adicionando...' : (product.stockQuantity > 0 ? 'Adicionar ao Carrinho' : 'Indisponível')}
                                </button>

                                {product.stockQuantity > 0 && (
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={buying || adding}
                                        className="w-full py-4 px-6 rounded-full font-bold text-lg bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:shadow-red-500/30 text-center transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {buying ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Processando...</span>
                                            </>
                                        ) : 'Comprar Agora'}
                                    </button>
                                )}
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <span>Compra Garantida e Segura</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 bg-gray-50/50 p-8 md:p-12">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Descrição do Produto</h2>
                        <div className="prose prose-red max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                            {product.description}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                            <div className="bg-white p-4 rounded-lg border border-gray-100">
                                <span className="block text-xs text-gray-400 mb-1">Peso</span>
                                <span className="font-semibold text-gray-900">{product.weight} kg</span>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-100">
                                <span className="block text-xs text-gray-400 mb-1">Dimensões</span>
                                <span className="font-semibold text-gray-900">{product.height}x{product.width}x{product.length} cm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;