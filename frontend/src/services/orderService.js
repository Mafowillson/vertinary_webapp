import api, { getApiErrorMessage } from '../../axiosInterceptor'

export const orderService = {
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', {
        product_id: orderData.productId,
        amount: orderData.amount,
      })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async getOrderById(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async getUserOrders() {
    try {
      const response = await api.get('/orders/my-orders')
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async processPayment(orderId, paymentData) {
    try {
      const response = await api.post(`/orders/${orderId}/payment`, paymentData)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },
}
