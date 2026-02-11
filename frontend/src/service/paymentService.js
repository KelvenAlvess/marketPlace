
import api from './api';

const paymentService = {
  processCardPayment: async (paymentData) => {
    const response = await api.post('/payments/card', paymentData);
    return response.data;
  },
  processPixPayment: async (paymentData) => {
    const response = await api.post('/payments/pix', paymentData);
    return response.data;
  },
  processBoletoPayment: async (paymentData) => {
    const response = await api.post('/payments/boleto', paymentData);
    return response.data;
  },
};

export default paymentService;
