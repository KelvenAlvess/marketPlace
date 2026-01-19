import Checkout from './Checkout';

// Agora recebe orderData (o pedido criado)
function CartCheckoutModal({ open, onClose, orderData }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fadeIn">
            <div className="relative z-60 w-full max-w-4xl mx-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-3xl z-10 font-bold bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
                >
                    ×
                </button>
                {/* Passa o pedido criado para o Checkout processar o pagamento */}
                <Checkout orderData={orderData} />
            </div>
        </div>
    );
}

export default CartCheckoutModal;