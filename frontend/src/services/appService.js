import api from '../../axiosInterceptor'

export const appService = {
  async getSiteConfig() {
    const response = await api.get('/config')
    return response.data
  },

  async updateSocialLinks(links) {
    const response = await api.put('/config/social-links', links)
    return response.data
  },

  async updateExchangeRates(rates) {
    const response = await api.put('/config/exchange-rates', rates)
    return response.data
  },
}

