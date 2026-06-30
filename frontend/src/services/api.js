import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 120000,
})

// Attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/auth/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  getGoogleUrl: () => api.get('/auth/google'),
}

// Users
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
}

// Interests
export const interestAPI = {
  getAll: () => api.get('/interests'),
  add: (interests) => api.post('/interests', { interests }),
  update: (id, data) => api.put(`/interests/${id}`, data),
  delete: (id) => api.delete(`/interests/${id}`),
}

// Paths
export const pathAPI = {
  getAll: () => api.get('/paths'),
  getById: (id) => api.get(`/paths/${id}`),
  create: (data) => api.post('/paths', data),
  generate: (data) => api.post('/paths/generate', data),
  update: (id, data) => api.put(`/paths/${id}`, data),
  delete: (id) => api.delete(`/paths/${id}`),
  updateStep: (pathId, stepId, data) => api.put(`/paths/${pathId}/steps/${stepId}`, data),
}

// Progress
export const progressAPI = {
  getAll: () => api.get('/progress'),
  log: (data) => api.post('/progress/log', data),
  getStreak: () => api.get('/progress/streak'),
  getStats: () => api.get('/progress/stats'),
}

// Quiz
export const quizAPI = {
  generate: (data) => api.post('/quiz/generate', data),
  submit: (data) => api.post('/quiz/submit', data),
  getHistory: () => api.get('/quiz/history'),
}

// Recommendations
export const recommendAPI = {
  getAll: () => api.get('/recommendations'),
  generate: () => api.post('/recommendations/generate'),
  accept: (id) => api.put(`/recommendations/${id}/accept`),
  dismiss: (id) => api.put(`/recommendations/${id}/dismiss`),
  getPathRecs: (pathId) => api.get(`/recommendations/path/${pathId}`),
  generatePathRecs: (pathId) => api.post(`/recommendations/path/${pathId}/generate`),
}

// AI
export const aiAPI = {
  getInsights: () => api.get('/ai/insights'),
  weeklyReport: () => api.post('/ai/weekly-report'),
}

// Resources
export const resourceAPI = {
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
}

// Utility for parsing SSE streams
export const parseSSEStream = async (res, onChunk, onDone) => {
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line.replace('data: ', ''))
          if (parsed.chunk) {
            fullText += parsed.chunk
            onChunk(fullText, parsed.chunk)
          }
          if (parsed.done && onDone) {
            onDone(fullText)
          }
        } catch {}
      }
    }
  } catch (err) {
    console.error('Stream read error:', err)
    throw err
  }
}
