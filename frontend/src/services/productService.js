import api, { getApiErrorMessage } from '../../axiosInterceptor'

export const productService = {
  async getAllProducts(params = {}) {
    try {
      const response = await api.get('/products', { params })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async searchProducts(query) {
    try {
      const response = await api.get('/products/search', { params: { q: query } })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async uploadProductImage(file, onUploadProgress) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/products/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      })
      return data.url
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },
}
