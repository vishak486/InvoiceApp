import axios from 'axios'

const api = axios.create({
  baseURL: 'https://invoice-payment-backend-gnow.onrender.com',
})

export default api