import api from './api';

const orderService = {
    // Busca um pedido específico (usado no Checkout)
    getOrderById: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    // === CORREÇÃO FINAL ===
    // O Backend espera POST em "/orders" com um JSON { "userId": 123 }
    createOrderFromCart: async (userId) => {
        const payload = { userId: userId };
        const response = await api.post('/orders', payload);
        return response.data;
    }
};

export default orderService;