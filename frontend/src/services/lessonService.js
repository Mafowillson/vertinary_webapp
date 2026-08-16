import api, { getApiErrorMessage } from '../../axiosInterceptor'

export const lessonService = {
  async getLessons(productId) {
    try {
      const { data } = await api.get(`/products/${productId}/lessons`)
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async uploadLesson(productId, { title, description, contentType, orderIndex, file }, onUploadProgress) {
    try {
      const formData = new FormData()
      formData.append('title', title)
      if (description) formData.append('description', description)
      formData.append('content_type', contentType)
      formData.append('order_index', String(orderIndex ?? 0))
      formData.append('file', file)

      const { data } = await api.post(`/products/${productId}/lessons`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      })
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async updateLesson(productId, lessonId, payload) {
    try {
      const { data } = await api.put(`/products/${productId}/lessons/${lessonId}`, payload)
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async deleteLesson(productId, lessonId) {
    try {
      const { data } = await api.delete(`/products/${productId}/lessons/${lessonId}`)
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async getLessonAccess(productId, lessonId) {
    try {
      const { data } = await api.post(`/products/${productId}/lessons/${lessonId}/access`)
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  /** streamUrlPath is path-only (e.g. "/products/4/lessons/1/stream?token=...") */
  buildStreamUrl(streamUrlPath) {
    const base = (api.defaults.baseURL || '').replace(/\/$/, '')
    return `${base}${streamUrlPath}`
  },
}
