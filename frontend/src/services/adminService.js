import api, { getApiErrorMessage } from '../../axiosInterceptor'

function mapAdminUserFromApi(user) {
  if (!user || typeof user !== 'object') return user
  return {
    ...user,
    isActive: user.isActive ?? user.is_active,
    isVerified: user.isVerified ?? user.is_verified,
    createdAt: user.createdAt ?? user.created_at,
    ordersCount: user.ordersCount ?? user.orders_count ?? 0,
  }
}

export const adminService = {
  async getUsers() {
    try {
      const { data } = await api.get('/admin/users')
      return data.map(mapAdminUserFromApi)
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async updateUserStatus(userId, isActive) {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/status`, { isActive })
      return mapAdminUserFromApi(data)
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async updateUserRole(userId, role) {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role })
      return mapAdminUserFromApi(data)
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async deleteUser(userId) {
    try {
      const { data } = await api.delete(`/admin/users/${userId}`)
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async getAnalytics(timeframe = 'monthly') {
    try {
      const { data } = await api.get('/admin/analytics', { params: { timeframe } })
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  async getOrders({ skip = 0, limit = 100 } = {}) {
    try {
      const { data } = await api.get('/admin/orders', { params: { skip, limit } })
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },
}
