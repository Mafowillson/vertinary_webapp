import api, { getApiErrorMessage } from '../../axiosInterceptor'

export const reviewService = {
  async getReviews(productId) {
    try {
      const { data } = await api.get(`/products/${productId}/reviews`)
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async createReview(productId, { body, rating }) {
    try {
      const { data } = await api.post(`/products/${productId}/reviews`, { body, rating })
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async updateReview(productId, reviewId, { body, rating }) {
    try {
      const { data } = await api.patch(`/products/${productId}/reviews/${reviewId}`, { body, rating })
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async deleteReview(productId, reviewId) {
    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`)
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async likeProduct(productId) {
    try {
      const { data } = await api.post(`/products/${productId}/like`)
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async unlikeProduct(productId) {
    try {
      const { data } = await api.delete(`/products/${productId}/like`)
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },
}
